const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authMiddleware } = require('../middleware/auth');

// 默认配置模板（供前端参考）
const defaultConfigs = {
  music: {
    ai_api_url: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    ai_api_key: '',
    ai_model: 'qwen-plus',
    ai_api_type: 'openai_compatible',
    ai_temperature: 0.8,
    ai_max_tokens: 500,
    ai_top_p: 0.9,
    ai_top_k: 40,
    ai_frequency_penalty: 0,
    ai_presence_penalty: 0,
    ai_num_candidates: 1,
    ai_reasoning: false,
    ai_system_prompt: `你是一个音乐推荐助手。根据用户描述的心情或场景，推荐1首合适的中文或英文歌曲。
请严格按照以下 JSON 格式返回（不要包含其他内容）：
{
  "songs": [
    {
      "name": "歌曲名",
      "artist": "歌手名",
      "reason": "推荐理由（50字以内）"
    }
  ]
}`,
    ai_user_prompt_template: '{{mood}}'
  }
};

// 获取项目默认配置（公开）
router.get('/defaults/:id', (req, res) => {
  const { id } = req.params;
  const defaults = defaultConfigs[id];
  if (!defaults) {
    return res.status(404).json({ error: '无默认配置' });
  }
  res.json(defaults);
});

// 获取项目列表（公开，只返回可见的）
router.get('/', (req, res) => {
  const showAll = req.query.all === '1';
  let projects;

  if (showAll) {
    // 管理后台查看所有
    projects = db.prepare('SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC').all();
  } else {
    // 公开只看可见的
    projects = db.prepare('SELECT * FROM projects WHERE is_visible = 1 ORDER BY sort_order ASC, created_at DESC').all();
  }

  // 解析 tech 和 config 字段
  projects = projects.map(p => ({
    ...p,
    tech: JSON.parse(p.tech || '[]'),
    config: JSON.parse(p.config || '{}')
  }));

  res.json(projects);
});

// 添加项目（需登录）
router.post('/', authMiddleware, (req, res) => {
  const { id, title, description, icon, tech, link, sort_order, config } = req.body;

  if (!id || !title) {
    return res.status(400).json({ error: '项目ID和标题不能为空' });
  }

  const existing = db.prepare('SELECT id FROM projects WHERE id = ?').get(id);
  if (existing) {
    return res.status(400).json({ error: '项目ID已存在' });
  }

  db.prepare(`
    INSERT INTO projects (id, title, description, icon, tech, link, config, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    title,
    description || '',
    icon || '📦',
    JSON.stringify(tech || []),
    link || '',
    JSON.stringify(config || {}),
    sort_order || 0
  );

  res.json({ message: '添加成功' });
});

// 修改项目（需登录）
router.put('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { title, description, icon, tech, link, sort_order, is_visible, config } = req.body;

  const existing = db.prepare('SELECT id FROM projects WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: '项目不存在' });
  }

  db.prepare(`
    UPDATE projects SET
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      icon = COALESCE(?, icon),
      tech = COALESCE(?, tech),
      link = COALESCE(?, link),
      config = COALESCE(?, config),
      sort_order = COALESCE(?, sort_order),
      is_visible = COALESCE(?, is_visible),
      updated_at = datetime('now','localtime')
    WHERE id = ?
  `).run(
    title || null,
    description !== undefined ? description : null,
    icon || null,
    tech ? JSON.stringify(tech) : null,
    link !== undefined ? link : null,
    config !== undefined ? JSON.stringify(config) : null,
    sort_order !== undefined ? sort_order : null,
    is_visible !== undefined ? is_visible : null,
    id
  );

  res.json({ message: '更新成功' });
});

// 删除项目（需登录）
router.delete('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const result = db.prepare('DELETE FROM projects WHERE id = ?').run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: '项目不存在' });
  }

  res.json({ message: '删除成功' });
});

module.exports = router;
