const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authMiddleware } = require('../middleware/auth');

const DEFAULT_SOCIAL = [
  { label: 'GitHub / 开源主页', url: 'https://github.com' },
  { label: '小红书 / 内容更新', url: 'https://www.xiaohongshu.com' },
  { label: '微信 / 商务合作', url: '#' },
  { label: '邮箱 / Email', url: 'mailto:hello@example.com' }
];

function parseSocial(raw) {
  try {
    const v = JSON.parse(raw || '[]');
    if (Array.isArray(v) && v.length > 0) {
      return v
        .filter((x) => x && typeof x.label === 'string')
        .map((x) => ({
          label: x.label,
          url: typeof x.url === 'string' ? x.url : '#'
        }));
    }
  } catch (e) {
    /* ignore */
  }
  return DEFAULT_SOCIAL.map((x) => ({ ...x }));
}

function stringifySocial(body) {
  if (Array.isArray(body.home_social)) {
    return JSON.stringify(body.home_social);
  }
  if (typeof body.home_social === 'string') {
    try {
      const v = JSON.parse(body.home_social);
      if (Array.isArray(v)) return JSON.stringify(v);
    } catch (e) {
      /* ignore */
    }
  }
  return '[]';
}

// 获取关于我（公开）
router.get('/', (req, res) => {
  const row = db
    .prepare(
      `SELECT name, avatar, title, content,
        home_hero_line1, home_hero_line2, home_intro,
        home_btn_projects, home_btn_about,
        home_heading_projects, home_heading_about, home_heading_social,
        home_social
      FROM about WHERE id = 1`
    )
    .get();

  if (!row) {
    return res.json({
      name: '',
      avatar: '',
      title: '',
      content: '',
      home_hero_line1: '冷静表达，',
      home_hero_line2: '锋利执行。',
      home_intro:
        '你好，我是{{name}} / YOUR NAME —— 使用右上角太阳与月亮开关在同一页切换昼夜主题。',
      home_btn_projects: '进入项目矩阵 / PROJECTS',
      home_btn_about: '查看完整介绍 / ABOUT',
      home_heading_projects: '我的项目 / PROJECTS',
      home_heading_about: '关于我 / ABOUT ME',
      home_heading_social: '社交链接 / SOCIAL',
      home_social: parseSocial('[]')
    });
  }

  res.json({
    ...row,
    home_social: parseSocial(row.home_social)
  });
});

// 更新关于我（需登录）
router.put('/', authMiddleware, (req, res) => {
  const b = req.body || {};
  const socialJson = stringifySocial(b);

  db.prepare(
    `UPDATE about SET
      name = ?, title = ?, content = ?, avatar = ?,
      home_hero_line1 = ?, home_hero_line2 = ?, home_intro = ?,
      home_btn_projects = ?, home_btn_about = ?,
      home_heading_projects = ?, home_heading_about = ?, home_heading_social = ?,
      home_social = ?,
      updated_at = datetime('now','localtime')
    WHERE id = 1`
  ).run(
    b.name ?? '',
    b.title ?? '',
    b.content ?? '',
    b.avatar ?? '',
    b.home_hero_line1 ?? '',
    b.home_hero_line2 ?? '',
    b.home_intro ?? '',
    b.home_btn_projects ?? '',
    b.home_btn_about ?? '',
    b.home_heading_projects ?? '',
    b.home_heading_about ?? '',
    b.home_heading_social ?? '',
    socialJson
  );

  res.json({ message: '更新成功' });
});

module.exports = router;
