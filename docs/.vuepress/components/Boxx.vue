<template>
	<div id="boxx">

		<div :class="class_boxx" :style="style_boxx">
			<p class="custom-block-title" :v-if="show_title" :style="style_title">{{boxx.title}}</p>
			<p :v-if="show_content" :style="style_content">{{boxx.content}}</p>
		</div>

	</div>
</template>

<script>
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
		    }
		},
		data() {
			return {
				boxx: {},
				class_boxx: "",
				list: list,
				show_content: true,
				show_title: true,
				style_boxx: {},
				style_title: {},
				style_content: {}
			}
		},
		mounted() {
			this.checkTitleAndConten();
			this.checkStyleWithTitleAndContenAndBlock();
			this.getShowType(this.type);	
		},
		computed: {
			
		},
		methods: {
			getShowType(type) {
				if(type == "danger") {
					this.class_boxx = "danger custom-block";
					return;
				}
				if(type == "warning") {
					this.class_boxx = "warning custom-block";
					return;
				}
				//default classs style: if(type == "tip")
				this.class_boxx = "tip custom-block";
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
			checkStyleWithTitleAndContenAndBlock(){
				if(this.titleStyle != null) {
					this.style_title = this.titleStyle;
				}
				if(this.contentStyle != null) {
					this.style_content = this.contentStyle;
				}
				if(this.blockStyle != null) {
					this.style_boxx = this.blockStyle;
				}
			}
			
		}
			
	}

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
	]
</script>

<style lang="stylus" scoped>
	
</style>