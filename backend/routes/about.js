const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authMiddleware } = require('../middleware/auth');

// 获取关于我（公开）
router.get('/', (req, res) => {
  const about = db.prepare('SELECT name, avatar, title, content FROM about WHERE id = 1').get();
  res.json(about || { name: '', avatar: '', title: '', content: '' });
});

// 更新关于我（需登录）
router.put('/', authMiddleware, (req, res) => {
  const { name, title, content, avatar } = req.body;
  db.prepare(`
    UPDATE about SET name = ?, title = ?, content = ?, avatar = ?, updated_at = datetime('now','localtime')
    WHERE id = 1
  `).run(name || '', title || '', content || '', avatar || '');

  res.json({ message: '更新成功' });
});

module.exports = router;
