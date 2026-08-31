const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const db = require('../../db/connection');

// 限流：每 IP 每分钟最多 10 次
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: '请求太频繁，请稍后再试' }
});

router.use(limiter);

// 获取项目配置
function getProjectConfig(projectId) {
  const row = db.prepare("SELECT config FROM projects WHERE id = ?").get(projectId);
  if (!row || !row.config) return {};
  try {
    return JSON.parse(row.config);
  } catch (e) {
    return {};
  }
}

// 调用 AI API
async function callAI(prompt, config) {
  // 使用配置中的参数，没有则使用默认值
  const temperature = config.ai_temperature !== undefined ? config.ai_temperature : 0.8;
  const maxTokens = config.ai_max_tokens !== undefined ? config.ai_max_tokens : 500;
  const topP = config.ai_top_p !== undefined ? config.ai_top_p : 0.9;
  const topK = config.ai_top_k !== undefined ? config.ai_top_k : 40;
  const frequencyPenalty = config.ai_frequency_penalty !== undefined ? config.ai_frequency_penalty : 0;
  const presencePenalty = config.ai_presence_penalty !== undefined ? config.ai_presence_penalty : 0;
  const numCandidates = config.ai_num_candidates !== undefined ? config.ai_num_candidates : 1;
  const reasoning = config.ai_reasoning === true;
  
  // 系统提示词：使用自定义或默认（空字符串也视为未配置）
  const defaultSystemPrompt = `你是一个音乐推荐助手。根据用户描述的心情或场景，推荐${numCandidates}首合适的中文或英文歌曲。
请严格按照以下 JSON 格式返回（不要包含其他内容）：
{
  "songs": [
    {
      "name": "歌曲名",
      "artist": "歌手名",
      "reason": "推荐理由（50字以内）"
    }
  ]
}`;
  const systemPrompt = (config.ai_system_prompt && config.ai_system_prompt.trim()) 
    ? config.ai_system_prompt 
    : defaultSystemPrompt;
  
  // 用户提示词模板：使用自定义或默认（空字符串也视为未配置）
  const defaultUserTemplate = '{{mood}}';
  const userTemplate = (config.ai_user_prompt_template && config.ai_user_prompt_template.trim())
    ? config.ai_user_prompt_template
    : defaultUserTemplate;
  const userPrompt = userTemplate.replace(/\{\{mood\}\}/g, prompt);
  
  // 构建请求体
  const requestBody = {
    model: config.ai_model,
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userPrompt
      }
    ],
    temperature: temperature,
    max_tokens: maxTokens,
    top_p: topP,
    top_k: topK,
    frequency_penalty: frequencyPenalty,
    presence_penalty: presencePenalty
  };
  
  // 如果开启思考模式且模型支持，添加相关参数
  if (reasoning) {
    requestBody.reasoning = true;
    if (config.ai_model?.includes('claude')) {
      requestBody.thinking = { type: 'enabled', budget_tokens: 16000 };
    }
  }
  
  const response = await fetch(config.ai_api_url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.ai_api_key}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`AI API 调用失败: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('AI 返回内容为空');
  }

  // 提取 JSON
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('AI 返回格式异常');
  }

  const result = JSON.parse(jsonMatch[0]);
  
  // 兼容新旧格式：如果返回的是 {songs: [...]}，取第一首
  if (result.songs && Array.isArray(result.songs) && result.songs.length > 0) {
    return result.songs[0];
  }
  
  // 旧格式直接返回
  return result;
}

// 调用网易云 API 搜索歌曲
async function searchNetease(songName, artist) {
  try {
    const { cloudsearch } = require('NeteaseCloudMusicApi');
    const keyword = `${songName} ${artist}`;
    const result = await cloudsearch({ keywords: keyword, limit: 1 });

    const song = result?.body?.result?.songs?.[0];
    if (!song) return null;

    return {
      neteaseId: song.id,
      neteaseUrl: `https://music.163.com/#/song?id=${song.id}`,
      coverUrl: song.al?.picUrl || null,
      duration: song.dt || null
    };
  } catch (err) {
    console.error('网易云搜索失败:', err.message);
    return null;
  }
}

// 获取试听链接
async function getSongUrl(id) {
  try {
    const { song_url_v1 } = require('NeteaseCloudMusicApi');
    const result = await song_url_v1({ id, level: 'standard' });
    const url = result?.body?.data?.[0]?.url;
    return url || null;
  } catch (err) {
    console.error('获取播放链接失败:', err.message);
    return null;
  }
}

// AI 音乐推荐接口
router.post('/recommend', async (req, res) => {
  try {
    const { mood } = req.body;

    if (!mood || mood.trim().length === 0) {
      return res.status(400).json({ error: '请输入你的心情' });
    }

    if (mood.length > 500) {
      return res.status(400).json({ error: '描述太长了，请控制在 500 字以内' });
    }

    // 获取项目配置（music 项目的 AI 配置）
    const config = getProjectConfig('music');
    if (!config.ai_api_key) {
      return res.status(500).json({ error: 'AI 服务未配置，请在项目管理中设置 API Key' });
    }

    // 调用 AI 推荐
    const aiResult = await callAI(mood, config);

    // 搜索网易云
    const neteaseInfo = await searchNetease(aiResult.name, aiResult.artist);

    // 获取试听链接
    let previewUrl = null;
    if (neteaseInfo?.neteaseId) {
      previewUrl = await getSongUrl(neteaseInfo.neteaseId);
    }

    res.json({
      song: {
        name: aiResult.name,
        artist: aiResult.artist,
        reason: aiResult.reason,
        neteaseId: neteaseInfo?.neteaseId || null,
        neteaseUrl: neteaseInfo?.neteaseUrl || null,
        coverUrl: neteaseInfo?.coverUrl || null,
        previewUrl: previewUrl
      }
    });

  } catch (err) {
    console.error('音乐推荐错误:', err);
    res.status(500).json({ error: err.message || '推荐失败，请稍后重试' });
  }
});

module.exports = router;
