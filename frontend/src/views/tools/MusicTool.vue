<template>
  <div class="music-page">
    <header class="sub-header">
      <div class="container sub-header__inner">
        <router-link to="/tools" class="sub-header__back mono">← LAB</router-link>
        <span class="sub-header__title mono">MUSIC</span>
      </div>
    </header>

    <div class="container music-body">
      <div class="page-head">
        <div>
          <h1 class="page-head__h">音乐推荐</h1>
          <p class="page-head__sub mono">CONTEXT · ONE_TRACK</p>
        </div>
        <router-link to="/tools" class="btn btn-outline btn-sm">返回工作台</router-link>
      </div>

      <div class="music-card card">
        <p class="music-desc">用一两句话描述当下状态，系统会尝试匹配一首合适的曲目。</p>

        <div class="input-area">
          <textarea
            v-model="mood"
            class="form-input mood-input"
            placeholder="例：加班结束，想听节奏轻一点、偏电子的氛围…"
            rows="3"
            :disabled="loading"
            @keydown.ctrl.enter="recommend"
          ></textarea>
          <button
            class="btn btn-primary recommend-btn"
            :disabled="loading || !mood.trim()"
            @click="recommend"
          >
            {{ loading ? '生成中…' : '生成推荐' }}
          </button>
        </div>

        <div v-if="error" class="message message-error">{{ error }}</div>

        <div v-if="song" class="result-area">
          <div class="song-card">
            <div class="song-cover-wrapper">
              <img
                v-if="song.coverUrl"
                :src="song.coverUrl"
                class="song-cover"
                alt="封面"
              />
              <div v-else class="song-cover-placeholder mono">♪</div>
            </div>
            <div class="song-info">
              <h3 class="song-name">{{ song.name }}</h3>
              <p class="song-artist">{{ song.artist }}</p>
              <p class="song-reason">{{ song.reason }}</p>

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
                  rel="noopener noreferrer"
                  class="btn btn-outline btn-sm"
                >
                  网易云打开
                </a>
                <a
                  v-if="!song.previewUrl && !song.neteaseUrl"
                  :href="'https://music.163.com/#/search/m/?s=' + encodeURIComponent(song.name + ' ' + song.artist)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn btn-outline btn-sm"
                >
                  网易云搜索
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
.mono {
  font-family: var(--font-mono);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.music-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.sub-header {
  border-bottom: 1px solid var(--border);
  background: rgba(7, 8, 11, 0.72);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.sub-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
}

.sub-header__back {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
}

.sub-header__back:hover {
  color: var(--accent);
}

.sub-header__title {
  font-size: 11px;
  color: var(--text-light);
  font-weight: 600;
}

.music-body {
  padding: 28px 22px 48px;
  flex: 1;
}

.page-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 18px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border);
}

.page-head__h {
  font-size: clamp(1.35rem, 3.5vw, 1.6rem);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.page-head__sub {
  margin-top: 6px;
  font-size: 10px;
  color: var(--text-light);
  font-weight: 600;
}

.music-card {
  max-width: 640px;
  margin: 0 auto;
  padding: 22px 20px;
}

.music-desc {
  color: var(--text-secondary);
  margin-bottom: 18px;
  text-align: left;
  font-size: 14px;
  line-height: 1.6;
}

.input-area {
  margin-bottom: 16px;
}

.mood-input {
  margin-bottom: 12px;
  resize: none;
}

.recommend-btn {
  width: 100%;
  padding: 12px;
  font-size: 14px;
}

.result-area {
  margin-top: 22px;
  padding-top: 22px;
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
  border: 1px solid var(--border);
}

.song-cover-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  background: var(--accent-muted);
  border: 1px solid rgba(94, 234, 212, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: var(--accent);
}

.song-info {
  flex: 1;
  min-width: 0;
}

.song-name {
  font-size: 19px;
  font-weight: 650;
  margin-bottom: 4px;
  letter-spacing: -0.02em;
}

.song-artist {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 10px;
}

.song-reason {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 16px;
  padding: 12px 14px;
  background: rgba(94, 234, 212, 0.06);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}

.audio-player {
  margin-bottom: 12px;
}

.audio-element {
  width: 100%;
  height: 40px;
  border-radius: var(--radius-sm);
  opacity: 0.95;
}

.song-links {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 640px) {
  .music-body {
    padding: 20px 16px 40px;
  }
  .page-head {
    flex-direction: column;
    align-items: flex-start;
  }
  .song-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .music-desc {
    text-align: left;
  }
  .song-reason {
    text-align: left;
  }
  .song-links {
    justify-content: center;
  }
}
</style>
