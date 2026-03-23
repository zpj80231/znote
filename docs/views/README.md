---
title: 概览
sidebar: true
date: 2019-08-21
sidebarDepth: 0
isShowComments: true
next: source/code/rpc/rpc-source-01
---

<div style="height: 120px">
	<Boxx :changeTime='changeTime' />
</div>

<p style='display: block; margin-bottom: 8px;'>
	<img id='imgShow' :class='active' :src='imgSrc'/>
</p>

<div id='category'>

[【分类】](/categories/后端%20Back-end/)

</div>

<div id='tag'>

[【标签】](/tag/)

</div>

<div id='fj'>

[【前端】](/views/frontend/EChartsStudy.html) | [【后端】](/views/source/code/spring/spring-source-01.html)

</div>

<div id='se'>

[【规范】](/views/specification/ali.html) | [【随笔】](/views/essay/20191109.html)

</div>

<br/>

我不知道会不会有人来到这里。<br/>
也许你只是偶然点进来，也许你什么都不会留下。<br/>

但没关系。<br/>

这个地方，本来就不是为了被很多人看到。<br/>
它更像是一个被时间忽略的空档，安静、缓慢，也不需要被理解。<br/>

有些想法太小，不值得发朋友圈；<br/>
有些情绪太重，不适合打扰别人。<br/>
有些零散的技术笔记，也只是写给未来某一天会忘记的自己；<br/>
有些关于朋友的片段，记录下来，不过是怕时间把他们悄悄带走。<br/>

还有一些不成体系的念头，<br/>
一些半途而废的尝试，<br/>
一些说不上重要、却又舍不得丢掉的瞬间。<br/>

它只是一个角落 —— 用来安放我的心声，以及那些在现实里说不出口的东西。<br/>

所以我把它们都放在这里。<br/>

就像把一封封没有寄出的信，<br/>
慢慢折好，收进一个不会被打扰的抽屉。<br/>
它们不需要被回复，也不一定被读到，<br/>
只是安静地存在着，就已经足够。<br/>

如果你读到了某一段，<br/>
刚好与你的某个时刻产生了一点点重合，<br/>
那也许，在这一瞬间，<br/>
我们就曾短暂地相遇过。<br/>

不需要留下名字，<br/>
也不需要彼此记住。<br/>

这，就已经足够。<br/>

<div class="list">
    <div class="cc rowup">
        <div class="item">&nbsp;</div>
        <div class="item">&nbsp;</div>
        <div class="item">&nbsp;</div>
        <div class="item">谁能明白我</div>
        <div class="item">&nbsp;</div>
        <div class="item">昂然踏着前路去</div>
        <div class="item">追赶理想旅途上</div>
        <div class="item">前行步步怀自信</div>
        <div class="item">风吹雨打不退让</div>
        <div class="item">&nbsp;</div>
        <div class="item">无论我去到哪方</div>
        <div class="item">心里梦想不变样</div>
        <div class="item">是新生&nbsp;是醒觉</div>
        <div class="item">梦想永远在世上</div>
        <div class="item">&nbsp;</div>
        <div class="item">前路哪怕远&nbsp;只要自强</div>
        <div class="item">我继续独自寻路向</div>
        <div class="item">常为以往梦想发狂</div>
        <div class="item">耐心摸索路途上</div>
        <div class="item">&nbsp;</div>
        <div class="item">怀自信&nbsp;我永不怕夜航</div>
        <div class="item">到困倦我自弹自唱</div>
        <div class="item">掌声我向梦想里寻</div>
        <div class="item">尽管一切是狂想</div>
        <div class="item">&nbsp;</div>
        <div class="item">途人路上回望我</div>
        <div class="item">只因我的怪模样</div>
        <div class="item">途人谁能明白我</div>
        <div class="item">今天眼睛多雪亮</div>
        <div class="item">&nbsp;</div>
        <div class="item">人是各有各理想</div>
        <div class="item">奔向目标不退让</div>
        <div class="item">用歌声&nbsp;用欢笑</div>
        <div class="item">来博知音的赞赏</div>
        <div class="item">&nbsp;</div>
        <div class="item">怀自信&nbsp;我永不怕夜航</div>
        <div class="item">到困倦我自弹自唱</div>
        <div class="item">掌声我向梦想里寻</div>
        <div class="item">尽管一切是狂想</div>
        <div class="item">&nbsp;</div>
        <div class="item">昂然踏着前路去</div>
        <div class="item">追赶理想旅途上</div>
        <div class="item">前行步步怀自信</div>
        <div class="item">依照心中那&nbsp;正确方向</div>
        <div class="item">&nbsp;</div>
        <div class="item">怀着爱与恕的心</div>
        <div class="item">充满梦想的笑着</div>
        <div class="item">用歌声&nbsp;用欢笑</div>
        <div class="item">来博知音的赞赏</div>
        <div class="item">&nbsp;</div>
    </div>
</div>

<script>
	export default {
		data() {
			return {
                changeTime: '2000',
				index: 2,
				imgSrc: '/znote/view/rddek.gif',
				active: 'active'
			}
		},
		mounted() {
			this.updateTime(this.changeTime);
			this.randomPic()
		},
		updated() {
		},
		methods: {
    		randomPic() {
				let picList = ['kQWXr.gif','rddek.gif'];
				let imgShow = document.getElementById("imgShow");
				setInterval(() => {
					if(this.active === 'active'){
						this.active="noActive"
					}else {
						this.active="active";
					}
					this.imgSrc = '/znote/view/' + picList[Math.floor(Math.random() * picList.length)]

				}, 5000)
			},
	
			updateTime(time) {
				setInterval(() => {
			      if (this.index%2 === 0) {
			      	this.changeTime = '300'
			      }
			      if (this.index%2 !== 0) {
			      	this.changeTime = time
			      }
			      this.index++;
			    }, 6000)
			}
		}
	
	}
</script>

<style lang='stylus' scoped> 
	@keyframes rowup {
        0% {
            -webkit-transform: translate3d(0, 15%, 0);
            transform: translate3d(0, 15%, 0);
        }
        100% {
            -webkit-transform: translate3d(0, -100%, 0);
            transform: translate3d(0, -100%, 0);
        }
    }
    .list{
        border: 1px solid #999;
        position: fixed;
        right: 50px;
        bottom: 50px;
        height: 200px;
        overflow: hidden;
        text-align: center;
        font-size: 14px;
        border-radius: 3px;
        width: 150px;
    }
    .list .rowup{
        -webkit-animation: 50s rowup linear infinite normal;
        animation: 50s rowup linear infinite normal;
        position: relative;
    }

	img.noActive{
		opacity: 0;
		transition: opacity 5s linear;
		pointer-events: none;
	}
	img.active{
		opacity: 1;
		transition: opacity 5s linear;
		pointer-events: none;
	} 
	.content__default:not(.custom) img {
	    max-width: 20% !important;
	    margin-top: -10px;
	    //padding-left: 26%;
	}

	#category {
		width:100px;
		height:100px;
		float: right;
		border-radius: 25%;
		background:#ffff0059;
		transition:width 2s, height 2s;
		-moz-transition:width 2s, height 2s, -moz-transform 2s; /* Firefox 4 */
		-webkit-transition:width 2s, height 2s, -webkit-transform 2s; /* Safari and Chrome */
		-o-transition:width 2s, height 2s, -o-transform 2s; /* Opera */
	}
	#category:hover {
		width:100px;
		height:100px;
		transform:rotate(360deg);
		-moz-transform:rotate(360deg); /* Firefox 4 */
		-webkit-transform:rotate(360deg); /* Safari and Chrome */
		-o-transform:rotate(360deg	); /* Opera */
	}
	
	#tag {
		width:100px;
		height:100px;
		float: right;
		border-radius: 25%;
		background:#ffff0059;
		transition:width 2s, height 2s;
		-moz-transition:width 2s, height 2s, -moz-transform 2s; /* Firefox 4 */
		-webkit-transition:width 2s, height 2s, -webkit-transform 2s; /* Safari and Chrome */
		-o-transition:width 2s, height 2s, -o-transform 2s; /* Opera */
	}
	#tag:hover {
		width:100px;
		height:100px;
		transform:rotate(360deg);
		-moz-transform:rotate(360deg); /* Firefox 4 */
		-webkit-transform:rotate(360deg); /* Safari and Chrome */
		-o-transform:rotate(360deg	); /* Opera */
	}
	
	#category p,#tag p {
	    margin: 0;
	    line-height: 100px;
	    text-align: center;
	    font-size: 15px;
	}
	#category,#tag {
        margin-top: 18px;
    }
	
	#fj,#se {
		margin-top: 32px;
	}
	
	@media screen and (max-width: 960px){
	    .catalog-graph {
	        display: none;
	    }
		.content__default:not(.custom) img {
		    max-width: 35% !important;
		    margin: 17px;
		    padding-left: 26%;
		}
		#fj,#se {
			font-size: 13px !important;
		}
		#category,#tag {
		    margin: 3% 0;
		    margin-top: 28px;
			width:80px;
			height:80px;
		}
		#category:hover,#tag:hover {
			width:80px;
			height:80px;
		}
		#category p,#tag p {
		    line-height: 80px;
	        font-size: 14px;
	    }
	}
	
	@media screen and (max-width: 560px){
		.list {
		    position: relative;
		    right: auto;
		    bottom: auto;
		    margin: 2px 0;
		    width: auto;
		    max-width: 150px;
		    text-align: left;
		    padding: 10px 5px;
		}
		.list .rowup {
		    text-align: left;
		    padding-left: 10px;
		}
	}
	
	@media screen and (max-width: 320px){
		#fj,#se {
			font-size: 10px !important;
		}
	}
</style>


