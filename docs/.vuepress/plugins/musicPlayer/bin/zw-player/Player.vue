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
            <div class="pan" :style="{backgroundImage:'url('+pan+')'}" :class="{pan_active:disActive}" @click="DisActive">
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
                            <svg viewBox="0 0 24 24" width="14" height="14">
                                <polygon points="19,5 19,19 8,12" fill="currentColor"/>
                                <rect x="5" y="5" width="3" height="14" fill="currentColor"/>
                            </svg>
                        </div>
                        <div class="control_side control_play" @click="togglePlay" :title="playState ? '暂停' : '播放'">
                            <svg v-if="playState" viewBox="0 0 24 24" width="14" height="14">
                                <rect x="6" y="4" width="4" height="16" fill="currentColor"/>
                                <rect x="14" y="4" width="4" height="16" fill="currentColor"/>
                            </svg>
                            <svg v-else viewBox="0 0 24 24" width="14" height="14">
                                <polygon points="6,4 6,20 20,12" fill="currentColor"/>
                            </svg>
                        </div>
                        <div class="control_side control_next" @click="PlayNext" title="下一首">
                            <svg viewBox="0 0 24 24" width="14" height="14">
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
                        <div class="control_side" @click="toggleMute" :title="(muted || volume === 0) ? '取消静音' : '静音'">
                            <svg v-if="muted || volume === 0" viewBox="0 0 24 24" width="14" height="14">
                                <polygon points="3,9 3,15 7,15 12,20 12,4 7,9" fill="currentColor"/>
                                <line x1="16" y1="9" x2="22" y2="15" stroke="currentColor" stroke-width="2"/>
                                <line x1="22" y1="9" x2="16" y2="15" stroke="currentColor" stroke-width="2"/>
                            </svg>
                            <svg v-else viewBox="0 0 24 24" width="14" height="14">
                                <polygon points="3,9 3,15 7,15 12,20 12,4 7,9" fill="currentColor"/>
                                <path d="M16 8 Q20 12 16 16" stroke="currentColor" stroke-width="2" fill="none"/>
                            </svg>
                        </div>
                        <div class="volume_slider" ref="volumeSlider" @mousedown="handleVolumeDown">
                            <div class="volume_slider_c" :style="{width: (muted ? 0 : volume * 100) + '%'}"></div>
                        </div>
                    </div>
                </div>
            </div>
            <audio id="music" ref="audio" autoplay :src="musicUrl" :loop="musicState===1"></audio>
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

const myMusicId = 3068309305
// 手动滚动歌词后，从最后一次 wheel 事件起经过多少 ms 自动回正
// 注意：macOS trackpad/部分鼠标有惯性滚动，停手后系统仍会派发 wheel ~1-2s，
// 这段时间 timer 会被反复重置，所以实际感知 = 惯性 + 此值 + transition(0.5s)
const LYRIC_SCROLL_RESUME_MS = 1500

export default {
    name: 'Player',
    data() {
        return {
            visible: false,
            o: 0,
            top: 0,
            pan, add, shlter, listPlay, state0, state1, talkicon1, talkicon2,
            playState: true,
            musicImg: '',
            musicUrl: '',
            musicWords: [],
            musicTitle: '',
            musicName: '',
            wordsTime: [],
            wordsTop: 0,
            wordIndex: 0,
            currentProgress: '0%',
            musicList: [],
            myMusicList: [],
            thisMusicIndex: 1,
            disActive: false,
            listIsDis: false,
            listButtonActiveIndex: -1,
            thisListPage: 1,
            musicTypeList: [
                { name: '热歌榜', id: 3778678 },
                { name: '新歌榜', id: 3779629 },
                { name: '飙升榜', id: 19723756 },
                { name: '抖音榜', id: 2250011882 },
                { name: '我的单曲', id: myMusicId },
                { name: 'My Songs', id: -1 }
            ],
            thisMusicType: -1,
            notPlay: [],
            musicState: 0, // 0 列表循环  1 单曲循环
            musicStateButton: state1,
            musicSearchVal: '',
            musicSearchList: [],
            musicAlertVal: '',
            musicAlertState: false,
            musicAlertTimer: null,
            hotTalkList: [],
            isDraggingProgress: false,
            isUserScrolling: false,
            volume: 1,
            muted: false,
            lastVolume: 1,
            _onMouseMove: null,
            _onMouseUp: null,
            _userScrollTimer: null
        }
    },
    computed: {
        thisMusicList() {
            return this.musicList.slice((this.thisListPage - 1) * 10, this.thisListPage * 10)
        }
    },
    watch: {
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
        volume(val) {
            const audio = this.$refs.audio
            if (audio) audio.volume = val
        },
        muted(val) {
            const audio = this.$refs.audio
            if (audio) audio.muted = val
        }
    },
    created() {
        // 不放 data 是为了避免 Vue 把它做响应式（仅作版本号用）
        this._playToken = 0
    },
    mounted() {
        getMyMusic(myMusicId).then(res => {
            if (this.isPc() && res.data.code === 200) {
                this.visible = true
                this.$nextTick(() => {
                    const audio = this.$refs.audio
                    if (audio) {
                        audio.volume = this.volume
                        audio.muted = this.muted
                        audio.addEventListener('timeupdate', this.onTimeUpdate)
                        audio.addEventListener('ended', this.onAudioEnded)
                    }
                    this._getMusicType(myMusicId)
                })
            }
        })
    },
    beforeDestroy() {
        clearTimeout(this.musicAlertTimer)
        clearTimeout(this._userScrollTimer)
        const audio = this.$refs.audio
        if (audio) {
            audio.removeEventListener('timeupdate', this.onTimeUpdate)
            audio.removeEventListener('ended', this.onAudioEnded)
        }
        if (this._onMouseMove) document.removeEventListener('mousemove', this._onMouseMove)
        if (this._onMouseUp) document.removeEventListener('mouseup', this._onMouseUp)
    },
    methods: {
        isPc() {
            const flag = navigator.userAgent.match(/(phone|pod|iPhone|iPod|ios|Android|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
            return !flag
        },
        MusicAlert(val) {
            this.musicAlertState = true
            this.musicAlertVal = val
            clearTimeout(this.musicAlertTimer)
            this.musicAlertTimer = setTimeout(() => {
                this.musicAlertState = false
                this.musicAlertVal = ''
            }, 2000)
        },
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
        DisList() {
            this.listIsDis = !this.listIsDis
        },
        ListChange(isLast) {
            this.thisListPage += isLast ? -1 : 1
        },
        ListPlay(id) {
            if (this.thisMusicIndex !== id) {
                this.thisMusicIndex = id > this.musicList.length - 1 ? 0 : id
                this._getInfo()
                this.resetLyricState()
                if (!this.playState) {
                    this.togglePlay()
                }
            }
        },
        ButtonActive(id) {
            this.listButtonActiveIndex = id
        },
        DisActive() {
            this.disActive = !this.disActive
        },
        PlayPrev() {
            if (this.musicList.length === 0) return
            const prev = this.thisMusicIndex - 1
            const newIndex = prev < 0 ? this.musicList.length - 1 : prev
            this.ListPlay(newIndex)
        },
        PlayNext() {
            if (this.musicList.length === 0) return
            const next = this.thisMusicIndex + 1
            const newIndex = next >= this.musicList.length ? 0 : next
            this.ListPlay(newIndex)
        },
        toggleMute() {
            if (this.muted || this.volume === 0) {
                this.muted = false
                if (this.volume === 0) {
                    this.volume = this.lastVolume > 0 ? this.lastVolume : 0.5
                }
            } else {
                this.lastVolume = this.volume
                this.muted = true
            }
        },
        handleVolumeDown(ev) {
            const slider = this.$refs.volumeSlider
            if (!slider) return
            const compute = (clientX) => {
                const rect = slider.getBoundingClientRect()
                const v = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
                this.volume = v
                if (v > 0 && this.muted) this.muted = false
                return v
            }
            compute(ev.clientX)
            const onMove = (e) => compute(e.clientX)
            const onUp = () => {
                document.removeEventListener('mousemove', onMove)
                document.removeEventListener('mouseup', onUp)
            }
            document.addEventListener('mousemove', onMove)
            document.addEventListener('mouseup', onUp)
        },
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
                        if (!this.playState) {
                            this.togglePlay()
                        }
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
        getMusicDetail(res, id) {
            this.musicList = res.data.playlist.tracks.slice(0, 200)
            this.thisMusicType = id
            this.thisMusicIndex = 0
            this.thisListPage = 1
            this._getInfo()
            this.resetLyricState()
            if (!this.playState) {
                this.togglePlay()
            }
        },
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
                    if (this.notPlay.length !== this.musicList.length) {
                        const nextIndex = (idx + 1) % this.musicList.length
                        if (this.notPlay.indexOf(idx) === -1) {
                            this.notPlay.push(idx)
                        }
                        this.MusicAlert(`${track.name}因为一些原因不能播放`)
                        this.ListPlay(nextIndex)
                    } else {
                        this.MusicAlert('此列表所有歌都不能播放')
                    }
                } else {
                    this.musicUrl = url.replace(/^http:\/\//, 'https://')
                    this.musicImg = track.al.picUrl.replace(/^http:\/\//, 'https://') + '?param=300y300'
                    this.musicTitle = track.name
                    this.musicName = track.ar.map(i => i.name).join('/')

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
        togglePlay() {
            const audio = this.$refs.audio
            if (!audio) return
            if (this.playState) {
                audio.pause()
                this.playState = false
            } else {
                audio.play()
                this.playState = true
            }
        },
        onTimeUpdate() {
            if (this.isDraggingProgress) return
            const audio = this.$refs.audio
            if (!audio || !audio.duration) return
            this.currentProgress = `${(audio.currentTime / audio.duration) * 100}%`

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
        onAudioEnded() {
            // loop=true 时不会触发；此处只处理列表循环
            if (this.musicList.length > 1) {
                this.thisMusicIndex = this.thisMusicIndex >= this.musicList.length - 1 ? 0 : this.thisMusicIndex + 1
                this._getInfo()
            } else {
                const audio = this.$refs.audio
                if (audio) audio.play()
            }
            this.resetLyricState()
        },
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

                if (audio.currentTime >= audio.duration) {
                    this.resetLyricState()
                }
                audio.play()
                this.playState = true
            }
            // 先解绑再绑定，避免多次拖动叠加
            document.removeEventListener('mousemove', this._onMouseMove)
            document.removeEventListener('mouseup', this._onMouseUp)
            document.addEventListener('mousemove', this._onMouseMove)
            document.addEventListener('mouseup', this._onMouseUp)
        },
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
