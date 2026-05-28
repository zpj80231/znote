// 播放器首次访问时使用的默认音量：50%。
export const DEFAULT_VOLUME = 0.5
// 播放器首次访问时默认尝试播放；浏览器仍可能因自动播放策略拦截。
export const DEFAULT_PLAY_STATE = true
// 音量和播放状态
export const VOLUME_STORAGE_KEY = 'musicPlayer.volume'
export const PLAYBACK_STATE_STORAGE_KEY = 'musicPlayer.playState'
export const PLAYBACK_PROGRESS_STORAGE_KEY = 'musicPlayer.playbackProgress'

// 本地状态采用滑动过期：每次成功读取都会续期 15 天。
export const STORAGE_TTL_MS = 15 * 24 * 60 * 60 * 1000
// 播放状态只存稳定字符串，避免直接持久化布尔值造成兼容歧义。
const PLAYBACK_STATE_PLAYING = 'playing'
const PLAYBACK_STATE_PAUSED = 'paused'

// 测试时注入 storage；浏览器运行时默认使用 window.localStorage。
function resolveStorage(storage) {
    if (storage) return storage
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage
    if (typeof localStorage !== 'undefined') return localStorage
    return null
}

// localStorage 在隐私模式、存储禁用或安全策略限制下可能 throw，失败时按无本地值处理。
function readStorageItem(key, storage) {
    const targetStorage = resolveStorage(storage)
    if (!targetStorage) return null
    try {
        return targetStorage.getItem(key)
    } catch (e) {
        return null
    }
}

// 写入失败不影响播放器继续工作，只放弃本次持久化。
function writeStorageItem(key, value, storage) {
    const targetStorage = resolveStorage(storage)
    if (!targetStorage) return
    try {
        targetStorage.setItem(key, JSON.stringify(value))
    } catch (e) {}
}

// 过期数据读取后立即清理，避免下次访问继续解析无效状态。
function removeStorageItem(key, storage) {
    const targetStorage = resolveStorage(storage)
    if (!targetStorage || typeof targetStorage.removeItem !== 'function') return
    try {
        targetStorage.removeItem(key)
    } catch (e) {}
}

// 所有持久化值统一包一层 expiresAt，方便滑动续期和过期判断。
function createStoredValue(value, now) {
    return {
        value,
        expiresAt: now + STORAGE_TTL_MS
    }
}

// 兼容旧版本直接存裸值的格式；读取到合法裸值后会按新格式续期写回。
function parseStoredValue(raw) {
    if (raw === null) return null
    try {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object' && Object.prototype.hasOwnProperty.call(parsed, 'value')) {
            return parsed
        }
    } catch (e) {}
    return { value: raw, expiresAt: null }
}

// 统一读取入口：解析、过期判断、合法性校验、续期都在这里完成。
function getStoredValue(key, fallback, isValid, storage, now) {
    const stored = parseStoredValue(readStorageItem(key, storage))
    if (!stored) return fallback

    if (typeof stored.expiresAt === 'number' && stored.expiresAt <= now) {
        removeStorageItem(key, storage)
        return fallback
    }

    if (!isValid(stored.value)) {
        return fallback
    }

    writeStorageItem(key, createStoredValue(stored.value, now), storage)
    return stored.value
}

// 读取音量；无值、过期或越界时回落到默认 50%。
export function getStoredVolume(storage, fallback = DEFAULT_VOLUME, now = Date.now()) {
    const volume = Number(getStoredValue(VOLUME_STORAGE_KEY, fallback, value => {
        const parsed = Number(value)
        return !isNaN(parsed) && parsed >= 0 && parsed <= 1
    }, storage, now))
    return !isNaN(volume) && volume >= 0 && volume <= 1 ? volume : fallback
}

// 保存音量并刷新 15 天有效期。
export function setStoredVolume(volume, storage, now = Date.now()) {
    writeStorageItem(VOLUME_STORAGE_KEY, createStoredValue(volume, now), storage)
}

// 读取播放状态；无值或过期时回落到默认播放。
export function getStoredPlaybackState(storage, fallback = DEFAULT_PLAY_STATE, now = Date.now()) {
    const value = getStoredValue(
        PLAYBACK_STATE_STORAGE_KEY,
        fallback ? PLAYBACK_STATE_PLAYING : PLAYBACK_STATE_PAUSED,
        item => item === PLAYBACK_STATE_PLAYING || item === PLAYBACK_STATE_PAUSED,
        storage,
        now
    )
    return value === PLAYBACK_STATE_PLAYING
}

// 保存播放/暂停状态并刷新 15 天有效期。
export function setStoredPlaybackState(isPlaying, storage, now = Date.now()) {
    writeStorageItem(
        PLAYBACK_STATE_STORAGE_KEY,
        createStoredValue(isPlaying ? PLAYBACK_STATE_PLAYING : PLAYBACK_STATE_PAUSED, now),
        storage
    )
}

// 标准化歌曲进度对象，避免把非法值写入 localStorage。
function normalizePlaybackProgress(progress) {
    if (!progress || typeof progress !== 'object') return null
    const musicType = Number(progress.musicType)
    const trackId = Number(progress.trackId)
    const trackIndex = Number(progress.trackIndex)
    const currentTime = Number(progress.currentTime)
    if (![musicType, trackId, trackIndex, currentTime].every(Number.isFinite)) return null
    if (trackIndex < 0 || currentTime < 0) return null
    return {
        musicType,
        trackId,
        trackIndex,
        currentTime
    }
}

// 读取上次播放的歌曲和进度；无值、过期或格式非法时返回 null。
export function getStoredPlaybackProgress(storage, now = Date.now()) {
    const value = getStoredValue(
        PLAYBACK_PROGRESS_STORAGE_KEY,
        null,
        item => normalizePlaybackProgress(item) !== null,
        storage,
        now
    )
    return normalizePlaybackProgress(value)
}

// 保存当前歌曲和播放进度，并刷新 15 天有效期。
export function setStoredPlaybackProgress(progress, storage, now = Date.now()) {
    const normalized = normalizePlaybackProgress(progress)
    if (!normalized) return
    writeStorageItem(PLAYBACK_PROGRESS_STORAGE_KEY, createStoredValue(normalized, now), storage)
}

// 歌曲进度彻底失效时主动清除，避免恢复到已播放完的旧位置。
export function removeStoredPlaybackProgress(storage) {
    removeStorageItem(PLAYBACK_PROGRESS_STORAGE_KEY, storage)
}
