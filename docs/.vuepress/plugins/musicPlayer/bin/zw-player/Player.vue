<template>
    <div id="musicPlayer" v-show="visible">
        <transition name="dis_list">
            <div class="list_box" v-if="listIsDis">
                <transition name="music_alert">
                    <span class="music_alert" v-if="musicAlertState">{{musicAlertVal}}</span>
                </transition>
                <div class="list_close" @click="DisList">x</div>
                <div class="music_list">
                    <div class="list_l">
                        <ul class="music_type">
                            <li v-for="item in musicTypeList" :key="item.id" @click="_getMusicType(item.id)" :class="{type_active:item.id==thisMusicType}">{{item.name}}</li>
                        </ul>
                        <div class="list_title">
                            <span style="font-size: 14px;">歌曲列表</span>
                            <img :src="musicStateButton" alt="" class="music_state" @click="MusicStateChange">
                            <div class="music_search_box">
                                <input type="text" class="music_search" v-model="musicSearchVal" placeholder="搜索歌曲">
                                <transition name="music_search">
                                    <ul class="search_list" v-if="musicSearchVal!=''">
                                        <li v-for="item in musicSearchList" :key="item.id" @click="ListAdd(item)">
                                            <span class="music_search_name">{{item.name}}</span>
                                            <span class="music_search_ar">{{item.ar[0].name}}</span>
                                        </li>
                                    </ul>
                                </transition>
                            </div>
                        </div>
                        <div class="music_ul_title">
                            <span>歌曲</span><span>歌手</span><span>专辑</span>
                        </div>
                        <ul class="_list">
                            <li v-for="(item,index) in thisMusicList" :key="item.id" @mouseover="ButtonActive(index)" @dblclick="ListPlay((thisListPage-1)*10+index)">
                                <div class="this_music_shlter" v-if="(thisListPage-1)*10+index==thisMusicIndex"></div>
                                <span>{{item.name}}</span><span>{{item.ar[0].name}}</span><span>{{item.al.name}}</span>
                                <transition name="list_button">
                                    <div class="music_button" v-if="listButtonActiveIndex==index">
                                        <div class="list_play" title="播放这首歌" :style="{backgroundImage:'url('+listPlay+')'}" @click="ListPlay((thisListPage-1)*10+index)"></div>
                                        <div class="list_play" title="添加到 My Songs" :style="{backgroundImage:'url('+add+')'}" @click="ListAdd(item)" v-if="thisMusicType!=-1"></div>
                                    </div>
                                </transition>
                            </li>
                        </ul>
                        <div class="list_page">
                            <div class="page_last" v-if="thisListPage!=1" @click="ListChange(true)"><</div>
                            <div class="page_next" v-if="thisListPage!=Math.ceil(musicList.length/10)" @click="ListChange(false)">></div>
                        </div>
                    </div>
                    <div class="list_r">
                        <img class="music_list_bg" :src="musicImg"></img>
                        <div class="music_list_shlter" :style="{backgroundImage:'url('+shlter+')'}"></div>
                        <ul class="music_talk_list">
                            <li v-for="(item,index) in hotTalkList" :key="index">
                                <div class="talk_head">
                                    <img :src="item.user.avatarUrl" alt="" class="talk_head_img">
                                    <span class="talk_head_name">{{item.user.nickname}}</span>
                                </div>
                                <p class="talk_content">
                                    <img class="talk_icon_l" :src="talkicon1"/>
                                    {{item.content}}
                                    <img class="talk_icon_r" :src="talkicon2"/>
                                </p>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </transition>
        <div class="bbox" :class="{bbox_active:disActive}">
            <div class="pan" :style="{backgroundImage:'url('+pan+')'}" :class="{pan_active:disActive, pan_playing:playState}" @click="DisActive">
                <img :src="musicImg" alt="" class="pan_c">
            </div>
            <div class="box" :style="{backgroundImage:'url('+musicImg+')'}" :class="{box_active:disActive}" @dblclick="DisList">
                <div class="music_shlter_2" :style="{backgroundImage:'url('+musicImg+')'}" :class="{shlter_active:disActive}"></div>
                <div class="music_shlter" :style="{backgroundImage:'url('+musicImg+')'}" :class="{shlter_active:disActive}"></div>
                <div class="music_shlter_3"></div>
                <div class="music_dis">
                    <div class="dis_list" @click="DisList">···</div>
                    <p class="music_title">{{musicTitle}}</p>
                    <p class="music_intro">歌手: {{musicName}}</p>
                    <ul class="music_words" ref="lyricBox" @wheel.prevent="handleLyricWheel">
                        <div class="music_words_box" :style="{ top: wordsTop + 'px', transition: isUserScrolling ? 'none' : '' }">
                            <li v-for="(item,index) in musicWords" :key="index" ref="lyricLines" class="music_word" :class="{word_highlight:wordIndex==index}">{{item}}</li>
                        </div>
                    </ul>
                </div>
                <div class="control_box">
                    <div class="control_buttons">
                        <div class="control_side control_prev" @click="PlayPrev" title="上一首">
                            <svg viewBox="0 0 24 24" width="18" height="18">
                                <polygon points="19,5 19,19 8,12" fill="currentColor"/>
                                <rect x="5" y="5" width="3" height="14" fill="currentColor"/>
                            </svg>
                        </div>
                        <div class="control_side control_play" @click="togglePlay" :title="playState ? '暂停' : '播放'">
                            <svg v-if="playState" viewBox="0 0 24 24" width="18" height="18">
                                <rect x="6" y="4" width="4" height="16" fill="currentColor"/>
                                <rect x="14" y="4" width="4" height="16" fill="currentColor"/>
                            </svg>
                            <svg v-else viewBox="0 0 24 24" width="18" height="18">
                                <polygon points="6,4 6,20 20,12" fill="currentColor"/>
                            </svg>
                        </div>
                        <div class="control_side control_next" @click="PlayNext" title="下一首">
                            <svg viewBox="0 0 24 24" width="18" height="18">
                                <polygon points="5,5 5,19 16,12" fill="currentColor"/>
                                <rect x="16" y="5" width="3" height="14" fill="currentColor"/>
                            </svg>
                        </div>
                    </div>
                    <div class="progress" ref="progress" @mousedown="handleProgressDown">
                        <div class="progress_c" :style="{width:currentProgress}">
                            <div class="progress_circle">
                                <div class="progress_circle_c"></div>
                            </div>
                        </div>
                    </div>
                    <div class="control_volume">
                        <div class="control_side control_vol_btn" ref="volumeBtn" @click="toggleVolumePopup" :title="volume === 0 ? '已静音' : '音量 ' + Math.round(volume * 100) + '%'">
                            <svg v-if="volume === 0" viewBox="0 0 24 24" width="18" height="18">
                                <polygon points="3,9 3,15 7,15 12,20 12,4 7,9" fill="currentColor"/>
                                <line x1="16" y1="9" x2="22" y2="15" stroke="currentColor" stroke-width="2"/>
                                <line x1="22" y1="9" x2="16" y2="15" stroke="currentColor" stroke-width="2"/>
                            </svg>
                            <svg v-else viewBox="0 0 24 24" width="18" height="18">
                                <polygon points="3,9 3,15 7,15 12,20 12,4 7,9" fill="currentColor"/>
                                <path d="M16 8 Q20 12 16 16" stroke="currentColor" stroke-width="2" fill="none"/>
                            </svg>
                        </div>
                        <transition name="volume_popup_fade">
                            <div v-if="showVolumePopup" class="volume_popup" ref="volumePopup">
                                <div class="volume_value">{{ Math.round(volume * 100) }}%</div>
                                <div class="volume_slider_vertical" ref="volumeSlider" @mousedown="handleVolumeDown">
                                    <div class="volume_slider_fill" :style="{height: (volume * 100) + '%'}"></div>
                                </div>
                            </div>
                        </transition>
                    </div>
                </div>
            </div>
            <audio id="music" ref="audio" :src="musicUrl" :loop="musicState===1" @play="onAudioPlay" @pause="onAudioPause" @error="onAudioError"></audio>
        </div>
    </div>
</template>

<script>
import { getWords, getMusicInfo, getMusicUrl, getHotMusic, getMyMusic, getSearchSuggest, getHotTalk } from './api/music'
import pan from './img/pan.png'
import add from './img/add.png'
import shlter from './img/list_pan.png'
import listPlay from './img/list_play_hover.png'
import state0 from './img/state_0.png'
import state1 from './img/state_1.png'
import talkicon1 from './img/talkicon1.png'
import talkicon2 from './img/talkicon2.png'
import {
    DEFAULT_PLAY_STATE,
    DEFAULT_VOLUME,
    getStoredPlaybackProgress,
    getStoredPlaybackState,
    getStoredVolume,
    setStoredPlaybackProgress,
    setStoredPlaybackState,
    setStoredVolume
} from './playerStorage'

// 默认加载的网易云歌单 ID。
const myMusicId = 3068309305
// 手动滚动歌词后，从最后一次 wheel 事件起经过多少 ms 自动回正
// 注意：macOS trackpad/部分鼠标有惯性滚动，停手后系统仍会派发 wheel ~1-2s，
// 这段时间 timer 会被反复重置，所以实际感知 = 惯性 + 此值 + transition(0.5s)
const LYRIC_SCROLL_RESUME_MS = 1500
// 播放中节流保存进度，避免 timeupdate 高频写 localStorage。
const PROGRESS_SAVE_INTERVAL_MS = 5000
// 恢复进度如果贴近歌曲末尾，留出缓冲，避免刷新后立刻触发 ended 切到下一首。
const RESTORE_END_GUARD_SECONDS = 3
export default {
    name: 'Player',
    data() {
        return {
            // API 可用且当前设备是桌面端时才显示播放器。
            visible: false,
            // 歌词推进状态：o 是当前歌词行游标，top 是已滚过的歌词高度。
            o: 0,
            top: 0,
            // 图片资源放进响应式数据，模板可直接绑定。
            pan, add, shlter, listPlay, state0, state1, talkicon1, talkicon2,
            // 播放状态会从 localStorage 恢复，无本地值时默认播放。
            playState: DEFAULT_PLAY_STATE,
            // 当前歌曲基础信息。
            musicImg: '',
            musicUrl: '',
            musicWords: [],
            musicTitle: '',
            musicName: '',
            // 歌词和进度条状态。
            wordsTime: [],
            wordsTop: 0,
            wordIndex: 0,
            currentProgress: '0%',
            // 当前列表、用户临时添加列表和列表分页状态。
            musicList: [],
            myMusicList: [],
            thisMusicIndex: 1,
            // 网络探测成功后读取的上次播放歌曲和进度。
            pendingPlaybackProgress: null,
            // 播放器展开状态、歌曲列表弹层状态和列表悬停按钮状态。
            disActive: false,
            listIsDis: false,
            listButtonActiveIndex: -1,
            thisListPage: 1,
            // 内置榜单类型；-1 表示用户临时添加的 My Songs。
            musicTypeList: [
                { name: '热歌榜', id: 3778678 },
                { name: '新歌榜', id: 3779629 },
                { name: '飙升榜', id: 19723756 },
                { name: '抖音榜', id: 2250011882 },
                { name: '我的单曲', id: myMusicId },
                { name: 'My Songs', id: -1 }
            ],
            thisMusicType: -1,
            // 记录当前列表中不可播放的歌曲索引，避免死循环切换。
            notPlay: [],
            musicState: 0, // 0 列表循环  1 单曲循环
            musicStateButton: state1,
            // 搜索输入、搜索候选和轻提示状态。
            musicSearchVal: '',
            musicSearchList: [],
            musicAlertVal: '',
            musicAlertState: false,
            musicAlertTimer: null,
            // 当前歌曲热门评论。
            hotTalkList: [],
            // 用户交互状态：拖动进度、手动滚动歌词、音量弹层。
            isDraggingProgress: false,
            isUserScrolling: false,
            volume: DEFAULT_VOLUME,
            showVolumePopup: false,
            // DOM 级事件监听句柄，销毁或关闭弹层时用于准确解绑。
            _onMouseMove: null,
            _onMouseUp: null,
            _userScrollTimer: null,
            _onDocMouseDown: null,
            _onBeforeUnload: null,
            _onVisibilityChange: null
        }
    },
    computed: {
        // 当前分页展示 10 首歌，避免一次渲染完整榜单。
        thisMusicList() {
            return this.musicList.slice((this.thisListPage - 1) * 10, this.thisListPage * 10)
        }
    },
    watch: {
        // 搜索框有输入时实时请求候选，清空输入时同步清空候选列表。
        musicSearchVal() {
            if (this.musicSearchVal === '') {
                this.musicSearchList = []
            } else {
                getSearchSuggest(this.musicSearchVal).then((res) => {
                    if (res.data.result.songs === undefined) {
                        this.musicSearchList = []
                    } else {
                        this.musicSearchList = res.data.result.songs
                    }
                })
            }
        },
        // 音量变化只同步到 audio；本地持久化只在用户拖动音量条时触发。
        volume(val) {
            const audio = this.$refs.audio
            if (audio) audio.volume = val
        }
    },
    created() {
        // 不放 data 是为了避免 Vue 把它做响应式（仅作版本号用）
        this._playToken = 0
        this._lastProgressSaveAt = 0
        this._pendingRestoreTime = null
        this._isTrackLoading = false
        this._isRestoringPlayback = false
    },
    mounted() {
        // 先探测默认歌单是否可用；只在桌面端显示这个悬浮播放器。
        getMyMusic(myMusicId)
            .then(res => {
                if (this.isPc() && res.data.code === 200) {
                    // 网络探测成功后才读取本地状态，避免异常访问刷新本地有效期。
                    this.playState = getStoredPlaybackState()
                    this.volume = getStoredVolume()
                    this.pendingPlaybackProgress = getStoredPlaybackProgress()
                    this.visible = true
                    this.$nextTick(() => {
                        const audio = this.$refs.audio
                        if (audio) {
                            // timeupdate/ended 用原生事件监听，避免模板上事件过多。
                            audio.volume = this.volume
                            audio.addEventListener('timeupdate', this.onTimeUpdate)
                            audio.addEventListener('ended', this.onAudioEnded)
                        }
                        this.bindProgressPersistenceEvents()
                        const restoreMusicType = this.pendingPlaybackProgress && this.pendingPlaybackProgress.musicType !== -1
                            ? this.pendingPlaybackProgress.musicType
                            : myMusicId
                        this._getMusicType(restoreMusicType)
                    })
                }
            })
            .catch(() => {
                // 网络不可达或接口异常时保持不加载播放器，也不读写本地状态。
            })
    },
    beforeDestroy() {
        // 清理定时器和 document/audio 监听，避免页面切换后残留回调。
        this.savePlaybackProgress()
        clearTimeout(this.musicAlertTimer)
        clearTimeout(this._userScrollTimer)
        const audio = this.$refs.audio
        if (audio) {
            audio.removeEventListener('timeupdate', this.onTimeUpdate)
            audio.removeEventListener('ended', this.onAudioEnded)
        }
        if (this._onMouseMove) document.removeEventListener('mousemove', this._onMouseMove)
        if (this._onMouseUp) document.removeEventListener('mouseup', this._onMouseUp)
        if (this._onDocMouseDown) document.removeEventListener('mousedown', this._onDocMouseDown)
        if (this._onBeforeUnload) window.removeEventListener('beforeunload', this._onBeforeUnload)
        if (this._onVisibilityChange) document.removeEventListener('visibilitychange', this._onVisibilityChange)
    },
    methods: {
        // 移动端空间有限且自动播放限制更多，因此只在桌面端启用。
        isPc() {
            const flag = navigator.userAgent.match(/(phone|pod|iPhone|iPod|ios|Android|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
            return !flag
        },
        // 统一控制播放器内短提示文案，重复触发时重置隐藏计时。
        MusicAlert(val) {
            this.musicAlertState = true
            this.musicAlertVal = val
            clearTimeout(this.musicAlertTimer)
            this.musicAlertTimer = setTimeout(() => {
                this.musicAlertState = false
                this.musicAlertVal = ''
            }, 2000)
        },
        // 搜索结果加入 My Songs；首次添加时立即切到 My Songs 列表。
        ListAdd(obj) {
            getMusicInfo(obj.id).then((res) => {
                this.musicSearchVal = ''
                if (this.myMusicList.length === 0) {
                    this.myMusicList = [res.data.songs[0]]
                    this._getMusicType(-1)
                } else {
                    this.myMusicList.push(res.data.songs[0])
                }
                this.MusicAlert('添加成功')
            })
        },
        // 切换列表循环/单曲循环，同时切换列表面板上的状态图标。
        MusicStateChange() {
            if (this.musicState === 0) {
                this.musicState = 1
                this.musicStateButton = this.state0
                this.MusicAlert('已切换为单曲循环模式')
            } else {
                this.musicState = 0
                this.musicStateButton = this.state1
                this.MusicAlert('已切换为列表循环模式')
            }
        },
        // 打开或关闭完整歌曲列表面板。
        DisList() {
            this.listIsDis = !this.listIsDis
        },
        // 歌曲列表分页：true 上一页，false 下一页。
        ListChange(isLast) {
            this.thisListPage += isLast ? -1 : 1
        },
        // 从列表显式播放某首歌；只有用户触发时才把“播放”状态写回本地。
        ListPlay(id, shouldPersist = true) {
            if (this.thisMusicIndex !== id) {
                if (shouldPersist) this._isRestoringPlayback = false
                this.thisMusicIndex = id > this.musicList.length - 1 ? 0 : id
                this.playState = true
                if (shouldPersist) setStoredPlaybackState(true)
                this._getInfo()
                this.resetLyricState()
            }
        },
        // 记录当前悬停行，用于显示行内播放/添加按钮。
        ButtonActive(id) {
            this.listButtonActiveIndex = id
        },
        // 展开或收起小播放器详情面板。
        DisActive() {
            this.disActive = !this.disActive
        },
        // 上一首；到达列表开头时回到最后一首。
        PlayPrev() {
            if (this.musicList.length === 0) return
            const prev = this.thisMusicIndex - 1
            const newIndex = prev < 0 ? this.musicList.length - 1 : prev
            this.ListPlay(newIndex)
        },
        // 下一首；到达列表末尾时回到第一首。
        PlayNext() {
            if (this.musicList.length === 0) return
            const next = this.thisMusicIndex + 1
            const newIndex = next >= this.musicList.length ? 0 : next
            this.ListPlay(newIndex)
        },
        // 打开音量弹层，并监听外部点击自动关闭。
        toggleVolumePopup() {
            if (this.showVolumePopup) {
                this.closeVolumePopup()
                return
            }
            this.showVolumePopup = true
            // popup 在下一帧才挂到 DOM，需要 $nextTick 后绑外点监听
            this.$nextTick(() => {
                this._onDocMouseDown = (e) => {
                    const popup = this.$refs.volumePopup
                    const btn = this.$refs.volumeBtn
                    if (popup && popup.contains(e.target)) return
                    if (btn && btn.contains(e.target)) return
                    this.closeVolumePopup()
                }
                document.addEventListener('mousedown', this._onDocMouseDown)
            })
        },
        // 关闭音量弹层并解绑外部点击监听。
        closeVolumePopup() {
            this.showVolumePopup = false
            if (this._onDocMouseDown) {
                document.removeEventListener('mousedown', this._onDocMouseDown)
                this._onDocMouseDown = null
            }
        },
        // 绑定页面生命周期保存点，刷新/切后台前尽量落盘当前进度。
        bindProgressPersistenceEvents() {
            if (this._onBeforeUnload || this._onVisibilityChange) return
            this._onBeforeUnload = () => this.savePlaybackProgress()
            this._onVisibilityChange = () => {
                if (document.visibilityState === 'hidden') this.savePlaybackProgress()
            }
            window.addEventListener('beforeunload', this._onBeforeUnload)
            document.addEventListener('visibilitychange', this._onVisibilityChange)
        },
        // 竖向音量条：底部 = 0%、顶部 = 100%
        handleVolumeDown(ev) {
            const slider = this.$refs.volumeSlider
            if (!slider) return
            const compute = (clientY) => {
                const rect = slider.getBoundingClientRect()
                const v = Math.max(0, Math.min(1, (rect.bottom - clientY) / rect.height))
                this.volume = v
                setStoredVolume(v)
                return v
            }
            compute(ev.clientY)
            const onMove = (e) => compute(e.clientY)
            const onUp = () => {
                document.removeEventListener('mousemove', onMove)
                document.removeEventListener('mouseup', onUp)
            }
            document.addEventListener('mousemove', onMove)
            document.addEventListener('mouseup', onUp)
        },
        // 切换歌单类型；My Songs 使用内存列表，其余类型请求远程歌单。
        _getMusicType(id) {
            if (this.thisMusicType !== id) {
                this.notPlay = []
                if (id === -1) {
                    if (this.myMusicList.length !== 0) {
                        this.musicList = this.myMusicList
                        this.thisMusicType = id
                        this.thisMusicIndex = 0
                        this.thisListPage = 1
                        this._getInfo()
                        this.resetLyricState()
                    } else {
                        this.MusicAlert('没有歌曲,需要自己添加')
                    }
                } else if (id === myMusicId) {
                    getMyMusic(id).then((res) => this.getMusicDetail(res, id))
                } else {
                    getHotMusic(id).then((res) => this.getMusicDetail(res, id))
                }
            }
        },
        // 接收歌单详情响应，重置分页和当前播放索引后加载第一首歌。
        getMusicDetail(res, id) {
            this.musicList = res.data.playlist.tracks.slice(0, 200)
            this.thisMusicType = id
            const restoredIndex = this.getRestoredTrackIndex(id)
            this.thisMusicIndex = restoredIndex >= 0 ? restoredIndex : 0
            this._pendingRestoreTime = restoredIndex >= 0 ? this.pendingPlaybackProgress.currentTime : null
            this._isRestoringPlayback = restoredIndex >= 0
            this.pendingPlaybackProgress = null
            this.thisListPage = 1
            this._getInfo()
            this.resetLyricState()
        },
        // 根据上次保存的 trackId 优先恢复歌曲；找不到时再用索引兜底。
        getRestoredTrackIndex(id) {
            const progress = this.pendingPlaybackProgress
            if (!progress || progress.musicType !== id || this.musicList.length === 0) return -1
            const trackId = Number(progress.trackId)
            const byId = this.musicList.findIndex(item => Number(item.id) === trackId)
            if (byId >= 0) return byId
            return progress.trackIndex >= 0 && progress.trackIndex < this.musicList.length ? progress.trackIndex : -1
        },
        // 加载当前歌曲的播放地址、封面、歌词和热门评论。
        _getInfo() {
            // 用 token 防止快速连续切歌时旧请求 resolve 把新数据覆盖；
            // 全程用本地 idx/track 而不是 this.thisMusicIndex（resolve 时可能已变）
            const token = ++this._playToken
            const idx = this.thisMusicIndex
            const track = this.musicList[idx]
            if (!track) return

            getMusicUrl(track.id).then((res) => {
                if (token !== this._playToken) return
                const url = res.data.data[0].url
                if (url === null || url === '' || url === undefined) {
                    if (this._isRestoringPlayback) {
                        // 刷新恢复时当前歌曲临时无地址，只保留本地记录的歌曲和播放状态，不自动污染到下一首。
                        this.MusicAlert(`${track.name}暂时不能播放，已保留上次播放状态`)
                        return
                    }
                    // 当前歌曲无可用地址时跳到下一首，直到整个列表都不可播。
                    if (this.notPlay.length !== this.musicList.length) {
                        const nextIndex = (idx + 1) % this.musicList.length
                        if (this.notPlay.indexOf(idx) === -1) {
                            this.notPlay.push(idx)
                        }
                        this.MusicAlert(`${track.name}因为一些原因不能播放`)
                        this.ListPlay(nextIndex, false)
                    } else {
                        this.MusicAlert('此列表所有歌都不能播放')
                    }
                } else {
                    // 播放地址和封面统一转 https，避免站点 https 下出现混合内容。
                    this._isTrackLoading = true
                    this.musicUrl = url.replace(/^http:\/\//, 'https://')
                    this.musicImg = track.al.picUrl.replace(/^http:\/\//, 'https://') + '?param=300y300'
                    this.musicTitle = track.name
                    this.musicName = track.ar.map(i => i.name).join('/')
                    this.$nextTick(() => {
                        this.markCurrentAudioReady(token)
                        if (this.playState) this.ensureAudioPlay()
                    })

                    // 歌词和评论与播放地址并行加载；token 失效时丢弃旧响应。
                    getWords(track.id).then((res) => {
                        if (token !== this._playToken) return
                        if (!res.data.nolyric && res.data.lrc && res.data.lrc.lyric) {
                            const info = this.Cut(res.data.lrc.lyric)
                            this.musicWords = info.wordArr
                            this.wordsTime = info.timeArr
                        } else {
                            this.musicWords = []
                            this.wordsTime = []
                        }
                    })

                    getHotTalk(track.id).then((res) => {
                        if (token !== this._playToken) return
                        const comments = (res.data.hotComments || []).slice(0, 3)
                        let count = 0
                        comments.forEach(e => {
                            count += e.content.length
                            e.user.avatarUrl = e.user.avatarUrl + '?param=50y50'
                        })
                        this.hotTalkList = count >= 200 ? comments.slice(0, 2) : comments
                    })
                }
            })
        },

        // 歌词截取函数：LRC 时间戳 mm:ss.xxx → 秒，保留毫秒精度
        Cut(str) {
            const lines = str.split('[')
            lines.shift()
            const timeArr = []
            const wordArr = []
            for (let i = 0; i < lines.length; i++) {
                const cut = lines[i].split(']')
                const parts = cut[0].split(':')
                const minutes = Number.parseInt(parts[0], 10)
                const seconds = Number.parseFloat(parts[1])
                let total = minutes * 60 + seconds
                if (isNaN(total)) total = 0
                timeArr.push(total)
                wordArr.push((cut[1] || '').trim())
            }
            return { timeArr, wordArr }
        },
        resetLyricState() {
            // 切换歌曲或拖到末尾时，将歌词、高亮和进度恢复到起点。
            this.top = 0
            this.o = 0
            this.wordIndex = 0
            this.wordsTop = 0
            this.currentProgress = '0%'
            // 切歌时清空歌词数据，避免上一首 audio 仍在跑、新歌词未到达时，
            // timeupdate 在旧 wordsTime 上推进 o，导致新歌词显示从中间开始
            this.musicWords = []
            this.wordsTime = []
        },
        // 把恢复出来的秒数写回 audio；等待 metadata 后再设置可避免浏览器忽略 currentTime。
        restorePendingAudioTime() {
            const audio = this.$refs.audio
            const pendingTime = this._pendingRestoreTime
            if (!audio || pendingTime === null || pendingTime === undefined) return
            const apply = () => {
                const duration = Number(audio.duration)
                const maxRestoreTime = Number.isFinite(duration) && duration > 0
                    ? Math.max(0, duration - RESTORE_END_GUARD_SECONDS)
                    : pendingTime
                audio.currentTime = Number.isFinite(duration) && duration > 0
                    ? Math.min(pendingTime, maxRestoreTime)
                    : pendingTime
                this.alignLyricToTime(audio.currentTime)
                this._pendingRestoreTime = null
            }
            if (audio.readyState >= 1) {
                apply()
            } else {
                audio.addEventListener('loadedmetadata', apply, { once: true })
            }
        },
        // 新音频 metadata 就绪后，audio.currentTime 才能安全地和当前歌曲索引绑定。
        markCurrentAudioReady(token) {
            const audio = this.$refs.audio
            if (!audio) {
                this._isTrackLoading = false
                return
            }
            const ready = () => {
                if (token !== this._playToken) return
                this._isTrackLoading = false
                this.restorePendingAudioTime()
            }
            if (audio.readyState >= 1) {
                ready()
            } else {
                audio.addEventListener('loadedmetadata', ready, { once: true })
            }
        },
        // 生成当前歌曲进度快照；异常和无歌曲时返回 null，避免污染本地状态。
        getPlaybackProgressSnapshot(currentTime) {
            if (this._isTrackLoading) return null
            const audio = this.$refs.audio
            const track = this.musicList[this.thisMusicIndex]
            const time = currentTime === undefined ? audio && audio.currentTime : currentTime
            if (!track || !Number.isFinite(Number(time))) return null
            return {
                musicType: this.thisMusicType,
                trackId: track.id,
                trackIndex: this.thisMusicIndex,
                currentTime: Math.max(0, Number(time))
            }
        },
        // 不读取 audio.currentTime，专门用于切歌边界保存“某首歌从 0 秒开始”。
        savePlaybackProgressForIndex(trackIndex, currentTime) {
            if (!this.visible) return
            const track = this.musicList[trackIndex]
            if (!track) return
            setStoredPlaybackProgress({
                musicType: this.thisMusicType,
                trackId: track.id,
                trackIndex,
                currentTime
            })
        },
        // 立即保存当前歌曲进度；只在播放器已正常加载后调用。
        savePlaybackProgress(currentTime) {
            if (!this.visible) return
            const progress = this.getPlaybackProgressSnapshot(currentTime)
            if (progress) setStoredPlaybackProgress(progress)
        },
        // 播放中节流保存进度，减少 localStorage 写入频率。
        savePlaybackProgressThrottled() {
            const now = Date.now()
            if (now - this._lastProgressSaveAt < PROGRESS_SAVE_INTERVAL_MS) return
            this._lastProgressSaveAt = now
            this.savePlaybackProgress()
        },
        // 播放按钮入口：根据当前状态决定暂停或尝试播放。
        togglePlay() {
            const audio = this.$refs.audio
            if (!audio) return
            this._isRestoringPlayback = false
            if (this.playState) {
                this.playState = false
                setStoredPlaybackState(false)
                audio.pause()
            } else {
                this.playState = true
                setStoredPlaybackState(true)
                this.ensureAudioPlay()
            }
        },
        // 封装 audio.play()；playState 只表达本地用户意图，播放失败不能把 playing 改成 paused。
        ensureAudioPlay() {
            const audio = this.$refs.audio
            if (!audio || !this.musicUrl) return
            this.playState = true
            const playPromise = audio.play()
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise
                    .catch(() => {
                        // 浏览器策略或资源异常只影响真实音频，不覆盖本地 playing 状态。
                    })
            }
        },
        // audio 原生 play 事件不改 playState；playState 必须和本地用户意图一致。
        onAudioPlay() {
        },
        // audio 原生 pause 事件不改 playState，避免刷新/异常暂停把本地 playing 显示成 paused。
        onAudioPause() {
        },
        // 资源异常不改 playState，也不写本地进度，避免下次刷新继承错误状态。
        onAudioError() {
        },
        // 播放进度推进时同步进度条和歌词高亮。
        onTimeUpdate() {
            if (this.isDraggingProgress) return
            const audio = this.$refs.audio
            if (!audio || !audio.duration) return
            if (this._isRestoringPlayback) this._isRestoringPlayback = false
            this.currentProgress = `${(audio.currentTime / audio.duration) * 100}%`
            this.savePlaybackProgressThrottled()

            const lyricLines = this.$refs.lyricLines || []
            const lyricBox = this.$refs.lyricBox
            const containerHeight = lyricBox ? lyricBox.offsetHeight : 160
            // 用 while 处理一次回调跨多行的情况
            while (this.o + 1 < this.wordsTime.length && audio.currentTime >= this.wordsTime[this.o + 1]) {
                const lineEl = lyricLines[this.o]
                if (lineEl) {
                    const marginTop = parseInt(getComputedStyle(lineEl).marginTop, 10) || 0
                    const lineHeight = lineEl.offsetHeight + marginTop
                    this.top += lineHeight
                    // 用户手动滚动期间，仅更新当前高亮行，不修改 wordsTop（由 recalc 在停手后统一对齐）
                    if (!this.isUserScrolling && this.top >= containerHeight / 2 - 11) {
                        this.wordsTop -= lineHeight
                    }
                }
                this.wordIndex = this.o + 1
                this.o++
            }
        },
        // 当前歌曲结束后按列表循环逻辑切到下一首。
        onAudioEnded() {
            if (this._isTrackLoading || this._isRestoringPlayback) return
            // loop=true 时不会触发；此处只处理列表循环
            if (this.musicList.length > 1) {
                this.thisMusicIndex = this.thisMusicIndex >= this.musicList.length - 1 ? 0 : this.thisMusicIndex + 1
                this.savePlaybackProgressForIndex(this.thisMusicIndex, 0)
                this._getInfo()
            } else {
                this.savePlaybackProgressForIndex(this.thisMusicIndex, 0)
                const audio = this.$refs.audio
                if (audio) this.ensureAudioPlay()
            }
            this.resetLyricState()
        },
        // 拖动进度条时只更新 UI，松手后再写入 audio.currentTime。
        handleProgressDown(ev) {
            const audio = this.$refs.audio
            const progressEl = this.$refs.progress
            if (!audio || !audio.duration || !progressEl) return

            this.isDraggingProgress = true
            const compute = (clientX) => {
                const rect = progressEl.getBoundingClientRect()
                const pro = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
                this.currentProgress = `${pro * 100}%`
                return pro
            }
            let pro = compute(ev.clientX)

            this._onMouseMove = (e) => { pro = compute(e.clientX) }
            this._onMouseUp = () => {
                document.removeEventListener('mousemove', this._onMouseMove)
                document.removeEventListener('mouseup', this._onMouseUp)
                this._onMouseMove = null
                this._onMouseUp = null

                audio.currentTime = audio.duration * pro
                this.alignLyricToTime(audio.currentTime)
                this.isDraggingProgress = false
                this._isRestoringPlayback = false

                if (audio.currentTime >= audio.duration) {
                    this.resetLyricState()
                }
                this.savePlaybackProgress()
                this.ensureAudioPlay()
            }
            // 先解绑再绑定，避免多次拖动叠加
            document.removeEventListener('mousemove', this._onMouseMove)
            document.removeEventListener('mouseup', this._onMouseUp)
            document.addEventListener('mousemove', this._onMouseMove)
            document.addEventListener('mouseup', this._onMouseUp)
        },
        // 外部修改播放时间后，将歌词游标移动到对应行。
        alignLyricToTime(currentTime) {
            // 找最大 i 使 wordsTime[i] <= currentTime
            let newO = 0
            for (let i = 0; i < this.wordsTime.length; i++) {
                if (currentTime >= this.wordsTime[i]) newO = i
                else break
            }
            this.o = newO
            this.wordIndex = newO
            this.recalcLyricScroll()
        },
        // 根据当前 wordIndex 从头累加每行高度，重算 top 与 wordsTop。
        // 用于进度条拖动后对齐、以及用户手动滚动结束后恢复同步。
        recalcLyricScroll() {
            const lyricLines = this.$refs.lyricLines || []
            const lyricBox = this.$refs.lyricBox
            if (!lyricBox) return
            const containerHeight = lyricBox.offsetHeight
            const halfMark = containerHeight / 2 - 11
            let cumTop = 0
            let cumWordsTop = 0
            for (let i = 0; i < this.wordIndex; i++) {
                const el = lyricLines[i]
                if (!el) continue
                const marginTop = parseInt(getComputedStyle(el).marginTop, 10) || 0
                const h = el.offsetHeight + marginTop
                cumTop += h
                if (cumTop >= halfMark) {
                    cumWordsTop -= h
                }
            }
            this.top = cumTop
            this.wordsTop = cumWordsTop
        },
        // 鼠标滚轮自由浏览歌词；停手 ？ 秒后自动恢复跟随播放进度
        handleLyricWheel(ev) {
            const lyricLines = this.$refs.lyricLines || []
            const lyricBox = this.$refs.lyricBox
            if (!lyricBox || lyricLines.length === 0) return

            let totalHeight = 0
            for (let i = 0; i < lyricLines.length; i++) {
                const marginTop = parseInt(getComputedStyle(lyricLines[i]).marginTop, 10) || 0
                totalHeight += lyricLines[i].offsetHeight + marginTop
            }
            const containerHeight = lyricBox.offsetHeight
            // 与自动同步一致：滚动下限让最后一行可以停在容器中线（halfMark），
            // 避免最后一行紧贴容器底部被下方控件视觉遮挡
            const halfMark = containerHeight / 2 - 11
            const minWordsTop = Math.min(0, halfMark - totalHeight)

            const next = this.wordsTop - ev.deltaY
            this.wordsTop = Math.max(minWordsTop, Math.min(0, next))

            this.isUserScrolling = true
            clearTimeout(this._userScrollTimer)
            this._userScrollTimer = setTimeout(() => {
                this.isUserScrolling = false
                this.recalcLyricScroll()
            }, LYRIC_SCROLL_RESUME_MS)
        }
    }
}
</script>

<style scoped>
@import url('./player.css');
@import url('./playermobile.css');
</style>
