const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authMiddleware } = require('../middleware/auth');

// 获取所有配置（需登录）
router.get('/', authMiddleware, (req, res) => {
  const settings = db.prepare('SELECT * FROM settings ORDER BY group_name, sort_order').all();

  // 按 group_name 分组
  const grouped = {};
  const groupLabels = {
    ai: '🤖 AI 配置',
    general: '⚙️ 通用配置'
  };

  for (const s of settings) {
    const group = s.group_name || 'general';
    if (!grouped[group]) {
      grouped[group] = {
        label: groupLabels[group] || group,
        items: []
      };
    }

    // password 类型的值脱敏
    let displayValue = s.value;
    if (s.type === 'password' && s.value) {
      displayValue = s.value.substring(0, 6) + '****';
    }

    grouped[group].items.push({
      key: s.key,
      value: s.value,
      displayValue,
      label: s.label,
      type: s.type,
      options: s.options ? JSON.parse(s.options) : []
    });
  }

  res.json(grouped);
});

// 更新配置（需登录）
router.put('/', authMiddleware, (req, res) => {
  const updates = req.body;

  const update = db.prepare("UPDATE settings SET value = ?, updated_at = datetime('now','localtime') WHERE key = ?");

  const transaction = db.transaction((items) => {
    for (const [key, value] of Object.entries(items)) {
      // 如果 password 类型且值包含 ****，说明用户没改，跳过
      const setting = db.prepare('SELECT type, value as oldValue FROM settings WHERE key = ?').get(key);
      if (setting && setting.type === 'password' && value.includes('****')) {
        continue;
      }
      update.run(value, key);
    }
  });

  transaction(updates);
  res.json({ message: '配置已更新' });
});

// 内部方法：获取单个配置值（给其他路由用）
function getSetting(key) {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? row.value : null;
}

module.exports = router;
module.exports.getSetting = getSetting;
