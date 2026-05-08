<template>
  <div class="music-page">
    <div class="container">
      <div class="page-header">
        <h1>🎵 AI 音乐推荐</h1>
        <router-link to="/tools" class="btn btn-outline btn-sm">← 返回工具箱</router-link>
      </div>

      <div class="music-card card">
        <p class="music-desc">告诉我你现在的心情，我会为你推荐一首歌 ✨</p>

        <div class="input-area">
          <textarea
            v-model="mood"
            class="form-input mood-input"
            placeholder="比如：今天加班很累，想听点轻松的..."
            rows="3"
            :disabled="loading"
            @keydown.ctrl.enter="recommend"
          ></textarea>
          <button
            class="btn btn-primary recommend-btn"
            :disabled="loading || !mood.trim()"
            @click="recommend"
          >
            {{ loading ? '🎵 推荐中...' : '🎵 为我推荐' }}
          </button>
        </div>

        <div v-if="error" class="message message-error">{{ error }}</div>

        <!-- 推荐结果 -->
        <div v-if="song" class="result-area">
          <div class="song-card">
            <div class="song-cover-wrapper">
              <img
                v-if="song.coverUrl"
                :src="song.coverUrl"
                class="song-cover"
                alt="封面"
              />
              <div v-else class="song-cover-placeholder">🎵</div>
            </div>
            <div class="song-info">
              <h3 class="song-name">{{ song.name }}</h3>
              <p class="song-artist">{{ song.artist }}</p>
              <p class="song-reason">{{ song.reason }}</p>

              <!-- 播放器 -->
              <div v-if="song.previewUrl" class="audio-player">
                <audio
                  ref="audioRef"
                  :src="song.previewUrl"
                  controls
                  class="audio-element"
                ></audio>
              </div>

              <div class="song-links">
                <a
                  v-if="song.neteaseUrl"
                  :href="song.neteaseUrl"
                  target="_blank"
                  class="btn btn-outline btn-sm"
                >
                  🎧 在网易云中打开
                </a>
                <a
                  v-if="!song.previewUrl && !song.neteaseUrl"
                  :href="'https://music.163.com/#/search/m/?s=' + encodeURIComponent(song.name + ' ' + song.artist)"
                  target="_blank"
                  class="btn btn-outline btn-sm"
                >
                  🔍 去网易云搜索
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { musicRecommend } from '../../api/index.js'

const mood = ref('')
const loading = ref(false)
const error = ref('')
const song = ref(null)
const audioRef = ref(null)

async function recommend() {
  if (!mood.value.trim() || loading.value) return

  loading.value = true
  error.value = ''
  song.value = null

  try {
    const result = await musicRecommend(mood.value.trim())
    song.value = result.song
  } catch (e) {
    error.value = e.error || '推荐失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.music-page {
  min-height: 100vh;
  padding: 40px 0;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 24px;
}

.music-card {
  max-width: 600px;
  margin: 0 auto;
}

.music-desc {
  color: var(--text-secondary);
  margin-bottom: 20px;
  text-align: center;
}

.input-area {
  margin-bottom: 20px;
}

.mood-input {
  margin-bottom: 12px;
  resize: none;
}

.recommend-btn {
  width: 100%;
  padding: 12px;
  font-size: 16px;
}

.result-area {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}

.song-card {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.song-cover-wrapper {
  flex-shrink: 0;
}

.song-cover {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  object-fit: cover;
}

.song-cover-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  background: var(--primary-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
}

.song-info {
  flex: 1;
  min-width: 0;
}

.song-name {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
}

.song-artist {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 10px;
}

.song-reason {
  color: var(--text);
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 16px;
  padding: 10px 14px;
  background: var(--primary-bg);
  border-radius: 8px;
}

.audio-player {
  margin-bottom: 12px;
}

.audio-element {
  width: 100%;
  height: 40px;
  border-radius: 8px;
}

.song-links {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 640px) {
  .music-page {
    padding: 20px 0;
  }
  .song-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .song-reason {
    text-align: left;
  }
  .song-links {
    justify-content: center;
  }
}
</style>
