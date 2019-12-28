<template>
	<div id="boxx">

		<div :class="class_boxx" :style="style_boxx">
			<p class="custom-block-title" :v-if="show_title" :style="style_title" v-html="boxx.title"></p>
			<p :v-if="show_content" :style="style_content" v-html="boxx.content"></p>
		</div>

	</div>
</template>

<script type="text/javascript">
	export default {
		props: {
			type: {
		      type: String,
		      default: ''
		    },
			title: {
		      type: String,
		      default: ''
		    },
		    content: {
		      type: String,
		      default: ''
		    },
		    blockStyle: {
		      type: Object,
		      default: null
		    },
		    titleStyle: {
		      type: Object,
		      default: null
		    },
		    contentStyle: {
		      type: Object,
		      default: null
		    },
		    changeTime: {
		      type: String,
		      default: "false"
		    },
		},
		data() {
			return {
				boxx: {},//展示的title和content
				class_boxx: "",//展示的class样式
				list: list,//名人名言数组
				type_boxx_list: type_boxx_list,//type样式数组
				show_content: true,
				show_title: true,
				style_boxx: {},
				style_title: {},
				style_content: {},
				interval: {} //定时器
			}
		},
		mounted() {
			this.checkTitleAndConten();
			this.checkStyleWithTitleAndContenAndBlock();
			this.getShowType(this.type);
			this.dynamicUpdateType(this.changeTime);
		},
	  	watch: {
			changeTime(newValue, oldValue) {
				this.dynamicUpdateType(newValue);
			}
		},
		methods: {
			getShowType(type) {
				if(type == type_boxx_list[2].type) {
					this.class_boxx = type_boxx_list[2].class;
					return;
				}
				if(type == type_boxx_list[1].type) {
					this.class_boxx = type_boxx_list[1].class;
					return;
				}
				//default classs style: if(type == "tip")
				this.class_boxx = type_boxx_list[0].class;
			},
			getboxx() {
				return this.boxx = list[Math.floor(Math.random() * list.length)];
			},
			checkTitleAndConten(){
				if(this.title != '' && this.content == '') {
					this.boxx.title = this.title;
					this.show_content = false;
					return;
				}
				if(this.title == '' && this.content != '') {
					this.boxx.content = this.content;
					this.style_content = { "margin-top": "1rem","margin-bottom": "0.4rem"};
					this.show_title = false;
					return;
				}
				if(this.title == '' || this.content == '') {
					this.getboxx();
				}else {
					this.boxx.title = this.title;
					this.boxx.content = this.content;
				}
			},
			checkStyleWithTitleAndContenAndBlock() {
				if(this.titleStyle != null) {
					this.style_title = this.titleStyle;
				}
				if(this.contentStyle != null) {
					this.style_content = this.contentStyle;
				}
				if(this.blockStyle != null) {
					this.style_boxx = this.blockStyle;
				}
			},
			dynamicUpdateType(time) {
				if(time != '' && time != 'false' && /^\d+$/.test(time)) {
					var index = 0;
					for(var i in type_boxx_list){
			            if(this.type == type_boxx_list[i].type){
			              index = i;
			            };
			        };

					clearInterval(this.interval);//停止

					this.interval = setInterval(() => {	
						index++;
						if(index == type_boxx_list.length) {index=0;}
						this.getShowType(type_boxx_list[index].type);
						this.checkTitleAndConten();
					}, time);

			        
						
				}
			},
			
			
		}
			
	}

	const type_boxx_list = [
		{type:"tip",class:"tip custom-block"},
		{type:"warning",class:"warning custom-block"},
		{type:"danger",class:"danger custom-block"},
	]

	const list = [
	  {title:'佚名',content:"勇敢不是不害怕，而是害怕的时候你还能坚持去做"},
	  {title:'罗素',content:"乞丐并不会妒忌百万富翁，但是他肯定会妒忌收入更高的乞丐"},
	  {title:'叔本华',content:"要么庸俗，要么孤独"},
	  {title:'卢梭',content:"人生而自由，却无往不在枷锁中"},
	  {title:'严歌苓',content:"我发现，一个人在放弃给别人留好印象的负担之后，原来心里会如此踏实"},
	  {title:'苏更生',content:"人表达的永远不是他所说的内容，而是渴望被理解的心情"},
	  {title:'萧伯纳',content:"自由意味着责任，正因为如此，多数人都惧怕自由"},
	  {title:'马尔克斯',content:"一个男人发现他在变老，是因为他开始像他的父亲"},
	  {title:'康德',content:"自由不是让你想做什么就做什么，自由是教你不想做什么，就可以不做什么"},
	  {title:'伏尔泰',content:"使人疲惫的不是远方的高山，而是鞋子里的一粒沙子"},
	  {title:'弗洛伊德',content:"有一天，当回顾自己走过的路时，你会发现这些奋斗不息的岁月，才是最美好的人生"},
	  {title:'三体',content:"给岁月以文明，而不是给文明以岁月"},
	  {title:'《哆啦A梦》',content:"总是依赖别人的话，就永远长不大"},
	  {title:'希腊',content:"最困难的事情就是认识自己"},
	  {title:'梁实秋',content:"没有人不爱惜他的生命，但很少人珍视他的时间"},
	  {title:'鲁迅',content:"改造自己，总比禁止别人来得难"},
	  {title:'唐.杜甫《奉赠韦左丞丈二十二韵》',content:"读书破万卷，下笔如有神"},
	  {title:'《诗经.鹤鸣》 ',content:"它山之石，可以攻玉"},
	  {title:'罗曼·罗兰',content:"先相信自己，然后别人才会相信你"},
	  {title:'居里夫人',content:"我们应该不虚度一生，应该能够说：'我已经做了我能做的事'"},
	  {title:'唐.王之焕《登鹳雀楼》 ',content:"欲穷千里目，更上一层楼"},
	  {title:'唐.孟浩然《江上寄山阴崔少府国辅》 ',content:"草木本无意，荣枯自有时"},
	  {title:'唐.李绅《悯农》 ',content:"春种一粒粟，秋收万颗子"},
	  {title:'德国',content:"只有在人群中间，才能认识自己"},
	  {title:'唐.韩愈《调张籍》 ',content:"蚍蜉撼大树，可笑不自量"},
	  {title:'唐.李绅《答章孝标》',content:"假金方用真金镀，若是真金不镀金"},
	  {title:'唐.刘禹锡《酬乐天扬州初逢席上见赠》 ',content:"沉舟侧畔千帆过，病树前头万木春	"},
	  {title:'杰弗逊	',content:"从不浪费时间的人，没有工夫抱怨时间不够"},
	  {title:'宋.王安石《登飞来峰》 ',content:"不畏浮云遮望眼，只缘身在最高层"},
	  {title:'清.赵翼《论诗》',content:"江山代有才人出，各领风骚数百年"},
	  {title:'张鹏军',content:"知识这种东西，学过一遍和没学过是不一样的，我可能忘了它，但我的骨子里已经有了它"},
	]
</script>

<style lang="stylus" scoped>

	
</style>