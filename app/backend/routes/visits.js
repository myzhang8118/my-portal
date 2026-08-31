const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authMiddleware } = require('../middleware/auth');

// ===== 公开接口：访问埋点 =====
router.post('/track', (req, res) => {
  try {
    const path = String(req.body.path || '/').slice(0, 200);
    // 不记录后台页面和接口调用
    if (path.startsWith('/admin') || path.startsWith('/api')) {
      return res.json({ ok: true, skipped: true });
    }
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
      || req.socket.remoteAddress || 'unknown';
    const ua = String(req.headers['user-agent'] || '').slice(0, 300);
    const referer = String(req.body.referer || req.headers['referer'] || '').slice(0, 300);

    // 同一 IP 同一路径 30 秒内不重复记录（防刷新刷屏）
    const dup = db.prepare(
      "SELECT id FROM visits WHERE ip = ? AND path = ? AND created_at >= datetime('now','localtime','-30 seconds') LIMIT 1"
    ).get(ip, path);
    if (dup) return res.json({ ok: true, skipped: true });

    db.prepare('INSERT INTO visits (ip, path, user_agent, referer) VALUES (?, ?, ?, ?)')
      .run(ip, path, ua, referer);
    res.json({ ok: true });
  } catch (e) {
    console.error('track error:', e.message);
    res.json({ ok: false });
  }
});

// ===== 管理接口（需登录）=====
// 访问记录列表（分页 + IP 筛选）
router.get('/', authMiddleware, (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const size = Math.min(100, Math.max(1, parseInt(req.query.size) || 20));
  const ip = String(req.query.ip || '').trim().slice(0, 50);
  const where = ip ? 'WHERE ip LIKE ?' : '';
  const params = ip ? [`%${ip}%`] : [];
  const total = db.prepare(`SELECT COUNT(*) AS c FROM visits ${where}`).get(...params).c;
  const list = db.prepare(
    `SELECT id, ip, path, user_agent, referer, created_at FROM visits ${where} ORDER BY id DESC LIMIT ? OFFSET ?`
  ).all(...params, size, (page - 1) * size);
  res.json({ total, page, size, list });
});

// 统计数据
router.get('/stats', authMiddleware, (req, res) => {
  const total = db.prepare('SELECT COUNT(*) AS c FROM visits').get().c;
  const totalIps = db.prepare('SELECT COUNT(DISTINCT ip) AS c FROM visits').get().c;
  const today = db.prepare("SELECT COUNT(*) AS c FROM visits WHERE date(created_at) = date('now','localtime')").get().c;
  const todayIps = db.prepare("SELECT COUNT(DISTINCT ip) AS c FROM visits WHERE date(created_at) = date('now','localtime')").get().c;
  const trend = db.prepare(`
    SELECT date(created_at) AS day, COUNT(*) AS count, COUNT(DISTINCT ip) AS ips
    FROM visits
    WHERE created_at >= datetime('now','localtime','-6 days','start of day')
    GROUP BY date(created_at) ORDER BY day
  `).all();
  const topIps = db.prepare(`
    SELECT ip, COUNT(*) AS count, MAX(created_at) AS last_seen
    FROM visits GROUP BY ip ORDER BY count DESC LIMIT 10
  `).all();
  const topPages = db.prepare(`
    SELECT path, COUNT(*) AS count FROM visits GROUP BY path ORDER BY count DESC LIMIT 10
  `).all();
  res.json({ total, totalIps, today, todayIps, trend, topIps, topPages });
});

module.exports = router;
