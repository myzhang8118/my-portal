const db = require('./connection');
const bcrypt = require('bcryptjs');

function initDatabase() {
  // 创建 about 表
  db.exec(`
    CREATE TABLE IF NOT EXISTS about (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT DEFAULT '你的名字',
      avatar TEXT DEFAULT '',
      title TEXT DEFAULT '一句话介绍自己',
      content TEXT DEFAULT '# 你好\n\n欢迎来到我的个人网站，这里是关于我的介绍。\n\n你可以在管理后台编辑这段内容。',
      updated_at DATETIME DEFAULT (datetime('now','localtime'))
    )
  `);

  // 插入默认数据（如果不存在）
  const aboutExists = db.prepare('SELECT COUNT(*) as count FROM about').get();
  if (aboutExists.count === 0) {
    db.prepare(`
      INSERT INTO about (id, name, avatar, title, content)
      VALUES (1, '你的名字', '', '一句话介绍自己', '# 你好\n\n欢迎来到我的个人网站。\n\n请在管理后台编辑这段内容。')
    `).run();
  }

  // 创建 projects 表（带 config 字段）
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      icon TEXT DEFAULT '📦',
      tech TEXT DEFAULT '[]',
      link TEXT DEFAULT '',
      config TEXT DEFAULT '{}',
      sort_order INTEGER DEFAULT 0,
      is_visible INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT (datetime('now','localtime')),
      updated_at DATETIME DEFAULT (datetime('now','localtime'))
    )
  `);

  // 检查是否需要添加 config 字段（兼容旧数据库）
  try {
    db.prepare("SELECT config FROM projects LIMIT 1").get();
  } catch (e) {
    db.exec(`ALTER TABLE projects ADD COLUMN config TEXT DEFAULT '{}'`);
    console.log('Added config column to projects table');
  }

  // 插入默认项目
  const projectExists = db.prepare('SELECT COUNT(*) as count FROM projects').get();
  if (projectExists.count === 0) {
    const defaultConfig = JSON.stringify({
      ai_api_url: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
      ai_api_key: '',
      ai_model: 'qwen-plus',
      ai_api_type: 'openai_compatible'
    });
    db.prepare(`
      INSERT INTO projects (id, title, description, icon, tech, link, config, sort_order)
      VALUES ('music', 'AI 音乐推荐', '基于通义千问大模型的智能音乐推荐，输入你的心情，为你推荐一首歌', '🎵', '["Vue 3","Node.js","通义千问"]', '/tools/music', ?, 1)
    `).run(defaultConfig);
  }

  // 创建 admin 表
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      password_hash TEXT NOT NULL,
      updated_at DATETIME DEFAULT (datetime('now','localtime'))
    )
  `);

  // 插入默认管理员密码 admin123
  const adminExists = db.prepare('SELECT COUNT(*) as count FROM admin').get();
  if (adminExists.count === 0) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO admin (id, password_hash) VALUES (1, ?)').run(hash);
  }

  // 创建 settings 表
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT DEFAULT '',
      label TEXT DEFAULT '',
      type TEXT DEFAULT 'text',
      options TEXT DEFAULT '',
      group_name TEXT DEFAULT 'general',
      sort_order INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT (datetime('now','localtime'))
    )
  `);

  // 插入默认全局配置（网站基本信息）
  const settingsExist = db.prepare('SELECT COUNT(*) as count FROM settings').get();
  if (settingsExist.count === 0) {
    const defaultSettings = [
      { key: 'site_name', value: '我的个人网站', label: '网站名称', type: 'text', options: '', group_name: 'general', sort_order: 1 },
      { key: 'site_description', value: '一个有趣的个人网站', label: '网站描述', type: 'text', options: '', group_name: 'general', sort_order: 2 },
      { key: 'site_icp', value: '', label: 'ICP 备案号', type: 'text', options: '', group_name: 'general', sort_order: 3 }
    ];

    const insert = db.prepare('INSERT INTO settings (key, value, label, type, options, group_name, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)');
    for (const s of defaultSettings) {
      insert.run(s.key, s.value, s.label, s.type, s.options, s.group_name, s.sort_order);
    }
  }

  // 迁移：如果存在旧版 AI 配置，提示用户去项目管理中配置
  try {
    const oldAIConfig = db.prepare("SELECT key FROM settings WHERE group_name = 'ai' LIMIT 1").get();
    if (oldAIConfig) {
      console.log('Note: Legacy AI settings found. Please configure AI settings in Project Management.');
    }
  } catch (e) {
    // ignore
  }

  console.log('Database initialized successfully');
}

module.exports = { initDatabase };
