const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/connection');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');

// 登录
router.post('/login', (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: '请输入密码' });
  }

  const admin = db.prepare('SELECT password_hash FROM admin WHERE id = 1').get();
  if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
    return res.status(401).json({ error: '密码错误' });
  }

  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token });
});

// 检查登录状态
router.get('/check', authMiddleware, (req, res) => {
  res.json({ authenticated: true });
});

// 修改密码
router.post('/change-password', authMiddleware, (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: '请输入旧密码和新密码' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: '新密码至少 6 位' });
  }

  const admin = db.prepare('SELECT password_hash FROM admin WHERE id = 1').get();
  if (!bcrypt.compareSync(oldPassword, admin.password_hash)) {
    return res.status(401).json({ error: '旧密码错误' });
  }

  const newHash = bcrypt.hashSync(newPassword, 10);
  db.prepare("UPDATE admin SET password_hash = ?, updated_at = datetime('now','localtime') WHERE id = 1").run(newHash);

  res.json({ message: '密码已修改' });
});

module.exports = router;
