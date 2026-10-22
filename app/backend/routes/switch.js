const express = require('express');
const { execFile, spawn } = require('child_process');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

const SCRIPT = '/root/projects.sh';
const NAMES = ['my-portal','aios-demo','wb-2.0'];
const ACTIONS = ['start','stop','restart'];

// 用 execFile（参数数组）天然防命令注入；name 仍白名单兜底
function runProjects(args) {
  return new Promise((resolve, reject) => {
    execFile(SCRIPT, args, { timeout: 90000, maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        // projects.sh 用 echo 打印错误，混在 stdout/stderr
        return reject(new Error((stderr || stdout || err.message).toString().trim() || '执行失败'));
      }
      resolve((stdout || '').toString());
    });
  });
}

// GET /api/switch — 列表状态
router.get('/', authMiddleware, async (req, res) => {
  try {
    const out = await runProjects(['--json']);
    const data = JSON.parse(out);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/switch/:name/:action
router.post('/:name/:action', authMiddleware, async (req, res) => {
  const { name, action } = req.params;
  if (!NAMES.includes(name)) return res.status(400).json({ error: `未知项目: ${name}` });
  if (!ACTIONS.includes(action)) return res.status(400).json({ error: `未知操作: ${action}` });

  // 停/重启 my-portal 自己：后端进程会自灭，必须 detached spawn 让子脚本脱离父进程
  if (name === 'my-portal' && (action === 'stop' || action === 'restart')) {
    const reply = {
      message: `my-portal ${action} 已触发（${action === 'restart' ? '先停后启' : '服务即将下线'}）`,
      async: true,
      recovery: '停后本面板也会下线；如需恢复请 SSH 执行: ssh aliyun "/root/projects.sh start my-portal"'
    };
    res.json(reply);
    // 必须给响应留出 flush 时间（~300ms），再 spawn 独立子进程
  // 用 systemd-run wrapper 让 projects.sh 在系统 cgroup 跑，脱离 pm2 cgroup
  setTimeout(() => {
    const child = spawn('/usr/local/bin/switch-runner', [action, name], {
      detached: true, stdio: 'ignore'
    });
    child.unref();
    child.on('error', err => console.error('[switch spawn error]', err.message));
  }, 300);
  return;
  }

  try {
    const out = await runProjects([action, name]);
    res.json({ message: `${name} ${action} 完成`, output: out });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
