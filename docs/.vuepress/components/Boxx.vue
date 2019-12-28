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
	  {title:'黑塞',content:"有勇气承担命运这才是英雄好汉"},
	  {title:'周恩来',content:"与肝胆人共事，无字句处读书"},
	  {title:'培根',content:"阅读使人充实，会谈使人敏捷，写作使人精确"},
	  {title:'笛卡儿',content:"阅读一切好书如同和过去最杰出的人谈话"},
	  {title:'罗素·贝克',content:"一个人即使已登上顶峰，也仍要自强不息"},
	  {title:'马云',content:"最大的挑战和突破在于用人，而用人最大的突破在于信任人"},
	  {title:'雷锋',content:"自己活着，就是为了使别人过得更美好"},
	  {title:'韩愈',content:"业精于勤，荒于嬉；行成于思，毁于随"},
	  {title:'孔子',content:"知之者不如好之者，好之者不如乐之者"},
	  {title:'黑格尔',content:"只有永远躺在泥坑里的人，才不会再掉进坑里	"},
	  {title:'普列姆昌德',content:"希望的灯一旦熄灭，生活刹那间变成了一片黑暗"},
	  {title:'郭沫若',content:"形成天才的决定因素应该是勤奋"},
	  {title:'洛克',content:"学到很多东西的诀窍，就是一下子不要学很多"},
	  {title:'西班牙',content:"自己的鞋子，自己知道紧在哪里"},
	  {title:'亚伯拉罕·林肯',content:"我这个人走得很慢，但是我从不后退"},
	  {title:'孙洙',content:"熟读唐诗三百首，不会作诗也会吟"},
	  {title:'周恩来',content:"为中华之崛起而读书"},
	  {title:'朱熹',content:"问渠哪得清如许，为有源头活水来"},
	  {title:'孔丘',content:"三军可夺帅也，匹夫不可夺志也"},
	  {title:'拉布克',content:"懒人无法享受休息之乐"},
	  {title:'歌德',content:"决定一个人的一生，以及整个命运的，只是一瞬之间"},
	  {title:'屈原',content:"路漫漫其修道远，吾将上下而求索"},
	  {title:'韩非',content:"内外相应，言行相称"},
	  {title:'朱熹',content:"读书有三到，谓心到，眼到，口到"},
	  {title:'苏轼',content:"古之立大事者，不惟有超世之才，亦必有坚忍不拔之志"},
	  {title:'王阳明',content:"故立志者，为学之心也；为学者，立志之事也"},
	  {title:'富兰克林',content:"读书是易事，思索是难事，但两者缺一，便全无用处"},
	  {title:'培根',content:"合理安排时间，就等于节约时间"},
	  {title:'屠格涅夫',content:"你想成为幸福的人吗？但愿你首先学会吃得起苦"},
	  {title:'莎士比亚',content:"抛弃时间的人，时间也抛弃他"},
	  {title:'叔本华',content:"普通人只想到如何度过时间，有才能的人设法利用时间"},
	  {title:'拉罗什夫科',content:"取得成就时坚持不懈，要比遭到失败时顽强不屈更重要"},
	  {title:'莎士比亚',content:"人的一生是短的，但如果卑劣地过这一生，就太长了"},
	  {title:'池田大作',content:"不要回避苦恼和困难，挺起身来向它挑战，进而克服它"},
	  {title:'陆游',content:"天下之事常成于困约，而败于奢靡"},
	  {title:'常建',content:"清晨入古寺，初日照高林"},
		{title:'《易经》',content:"穷则变，变则通"},
		{title:'王勃',content:"城阙辅三秦，风烟望五津"},
		{title:'杜甫',content:"窗含西岭千秋雪，门泊东吴万里船"},
		{title:'孔子',content:"工欲善其事，必先利其器"},
		{title:'《史记》',content:"尺有所短，寸有所长"},
		{title:'《增广贤文》',content:"光阴似箭，日月如梭"},
		{title:'陶渊明',content:"秋月扬明晖，冬岭秀寒松"},
		{title:'苏轼',content:"水光潋滟晴方好，山色空蒙雨亦奇"},
		{title:'王维',content:"草枯鹰眼疾，雪尽马蹄轻"},
		{title:'卢纶',content:"月黑雁飞高，单于夜遁逃"},
		{title:'刘禹锡',content:"自古逢秋悲寂寥，我言秋日胜春朝"},
		{title:'韩愈《进学解》',content:"业精于勤，荒于嬉"},
		{title:'张志和',content:"青箬笠，绿蓑衣，斜风细雨不须归"},
		{title:'《史记》',content:"桃李不言，下自成蹊"},
		{title:'李商隐',content:"相见时难别亦难，东风无力百花残"},
		{title:'《汉书》',content:"失之毫厘，谬以千里"},
		{title:'杜牧',content:"借问酒家何处有，牧童遥指杏花村"},
		{title:'李煜',content:"春花秋月何时了，往事知多少"},
		{title:'陆游',content:"夜阑卧听风吹雨，铁马冰河人梦来"},
		{title:'王维',content:"红豆生南国，春来发几枝"},
		{title:'《史记》',content:"运筹帷幄之中，决胜千里之外"},
		{title:'晏殊',content:"，无可奈何花落去，似曾相识燕归来"},
		{title:'烈士暮年，壮心不已',content:"老骥伏枥，志在千里"},
		{title:'《汉乐府·陌上桑》',content:"日出东南隅，照我秦氏楼"},
		{title:'陆游',content:"南邻更可念，布破冬未赎"},
		{title:'苏轼',content:"人有悲欢离合，月有阴晴圆缺"},
		{title:'《史记》',content:"千羊之皮，不如一狐之腋"},
		{title:'杜甫',content:"仲夏苦夜短，开轩纳微凉"},
		{title:'《论语》',content:"三军可夺帅也，匹夫不可夺志也"},
		{title:'孔子',content:"敏而好学，不耻下问"},
		{title:'《北齐书》',content:"宁为玉碎，不为瓦全"},
		{title:'范成大',content:"连雨不知春去，一晴方觉夏深"},
		{title:'刘禹锝',content:"杨柳青青江水平，闻郎江上唱歌声"},
		{title:'孟郊',content:"谁言寸草心，报得三春晖"},
		{title:'文天祥',content:"臣心一片磁针石，不指南方不肯休"},
		{title:'李白',content:"花间一壶酒，独酌无相亲"},
		{title:'朱熹',content:"百学须先立志"},
		{title:'《荀子》',content:"不登高山，不知天之高也；不临深溪，不知地之厚也"},
		{title:'李白',content:"长风破浪会有时，直挂云帆济沧海"},
		{title:'司马迁',content:"人固有一死，或重于泰山，或轻于鸿毛"},
		{title:'韩愈',content:"闻道有先后，术业有专攻"},
		{title:'王维',content:"山路元无雨，空翠湿人衣"},
		{title:'刘禹锡',content:"山不在高，有仙则名；水不在深，有龙则灵"},
		{title:'王维',content:"大漠孤烟直，长河落日圆"},
		{title:'杜甫',content:"清江一曲抱村流，长夏江村事亭幽"},
		{title:'《后汉书》',content:"不入虎穴，焉得虎子"},
		{title:'辛弃疾',content:"青山遮不住，毕竟东流去"},
		{title:'自居易',content:"邯郸驿里逢冬至，抱膝灯前影伴身"},
		{title:'杜甫',content:"晓看红湿处，花重锦官城"},
		{title:'杜甫',content:"国破山河在，城春草木深入"},
		{title:'《汉书》',content:"临渊羡鱼，不如退而结网"},
		{title:'《晏子春秋》',content:"智者千虑，必有一失；愚者千虑，必有一得"},
		{title:'杜甫',content:"天时人事日相催，冬至阳生春又来"},
		{title:'《论语》',content:"己所不欲，勿施于人"},
		{title:'曹操',content:"秋风萧瑟，洪波涌起"},
		{title:'王之涣',content:"白日依山尽，黄河人海流"},
		{title:'苏轼',content:"博观而约取，厚积而薄发"},
		{title:'李白',content:"举杯邀明月，对影成三人"},
		{title:'孟郊',content:"镜破不改光，兰死不改香"},
		{title:'杜甫',content:"随风潜入夜，滑物细无声"},
		{title:'《史记》',content:"不飞则已，一飞冲天；不鸣则已，一鸣惊人"},
		{title:'王勃',content:"老当益壮，宁知白首之心；穷且益坚，不坠青云之志"},
		{title:'《汉书》',content:"水至清则无鱼，人至察则无徒"},
		{title:'刘基',content:"金玉其外，败絮其中"},
		{title:'龚自珍',content:"落红不是无情物，化作春泥更护花"},
		{title:'贺知章',content:"不知细叶谁裁出，二月春风似剪刀"},
		{title:'《吕氏春秋》',content:"流水不腐，户枢不蠹"},
		{title:'卢纶',content:"林暗草惊风，将军夜引弓"},
		{title:'岑参',content:"北风卷地白草折，胡天八月即飞雪"},
		{title:'王昌龄',content:"青海长云暗雪山，孤城遥望玉门关"},
		{title:'孔子',content:"君子坦荡荡，小人长戚戚"},
		{title:'骆宾王',content:"白毛浮绿水，红掌拨清波"},
		{title:'《汉乐府·长歌行》',content:"常恐秋节至，煜黄华叶衰"},
		{title:'王维',content:"深林人不知，明月来相照"},
		{title:'董思恭',content:"冬尽今宵促，年开明日长"},
		{title:'郑板桥',content:"千磨万击还坚劲，任尔东西南北风"},
		{title:'岑参',content:"残云收夏暑，新雨带秋岚"},
		{title:'杜甫',content:"国破山河在，城春草木深"},
		{title:'《尚书》',content:"满招损，谦受益"},
		{title:'白居易',content:"力尽不知热，但惜夏日长"},
		{title:'王维',content:"渭城朝雨浥轻尘，客舍青青柳色新"},
		{title:'蒲松龄',content:"有志者，事竟成，破釜沉舟，百二秦关终属楚；苦心人，天不负，卧薪尝胆，三千越甲可吞吴"},
		{title:'岳飞',content:"莫等闲，白了少年头，空悲切"},
		{title:'王勃',content:"海内存知己，天涯若比邻"},
		{title:'李白',content:"桃花潭水深千尺，不及汪伦送我情"},
		{title:'《旧唐书》',content:"当局者迷，旁观者清"},
		{title:'王维',content:"空山新雨后，天气晚来秋"},
		{title:'刘禹锅',content:"湖光秋月两相和，潭面无风镜未磨"},
		{title:'卢纶',content:"欲将轻骑逐，大雪满弓刀"},
		{title:'杜甫',content:"且如今年冬，未休关西卒"},
		{title:'诸葛亮',content:"非学无以广才，非志无以成学"},
		{title:'《论语》',content:"发奋忘食，乐以忘优，不知老之将至"},
		{title:'《汉书》',content:"前车之覆，后车之鉴"},
		{title:'《诗经·蒹葭》',content:"所谓伊人，在水一方"},
		{title:'李白',content:"天门中断楚江开，碧水东流至此回"},
		{title:'孟浩然',content:"春眠不觉晓，处处闻啼鸟"},
		{title:'李白',content:"清水出芙蓉，天然去雕饰"},
		{title:'刘彝',content:"读万卷书，行万里路"},
		{title:'罗大经《鹤林玉露》',content:"绳锯木断，水滴石穿"},
		{title:'苏轼',content:"古之立大事者，不惟有超世之才，亦必有坚忍不拔之志"},
		{title:'杨万里',content:"接天莲叶无穷碧，映日荷花另样红"},
		{title:'王昌龄',content:"寒雨连江夜人吴，平明送客楚山孤"},
		{title:'王昌龄',content:"秦时明月汉时关，万里长征人未还"},
		{title:'王缴',content:"鸣笙起秋风，置酒飞冬雪"},
		{title:'李白',content:"明月出天山，苍茫云海间"},
		{title:'屈原',content:"路漫漫其修远今，吾将上下而求索"},
		{title:'柳宗元',content:"孤舟蓑笠翁，独钓寒江雪"},
		{title:'刘禹锡',content:"沉舟侧畔千帆过，病树前头万木春"},
		{title:'杜甫',content:"感时花溅泪，恨别鸟惊心"},
		{title:'孟子',content:"富贵不能淫，贫贱不能移，威武不能屈"},
		{title:'李商隐',content:"深居俯夹城，春去夏犹清"},
		{title:'曹操',content:"水何澹澹，山岛竦峙"},
		{title:'辛弃疾',content:"欲说还休，却道天凉好个秋"},
		{title:'《汉书》',content:"不可同日而语"},
		{title:'杜甫',content:"会当凌绝顶，一览众山小"},
		{title:'《旧唐书》',content:"木秀于林，风必摧之"},
		{title:'白居易',content:"日出江花红胜火，春来江水绿如蓝"},
		{title:'文天祥',content:"人生自古谁无死，留取丹心照汗青"},
		{title:'孟浩然',content:"野旷天低树，江清月近人"},
		{title:'孟浩然',content:"待到重阳日，还来就菊花"},
		{title:'高适',content:"千里黄云白日曛，北风吹雁雪纷纷"},
		{title:'李白',content:"欲渡黄河冰塞川，将登太行雪满山"},
		{title:'白居易',content:"野火烧不尽，春风吹又生"},
		{title:'杨万里',content:"泉眼无声惜细流，树阴照水爱晴柔"},
		{title:'李白',content:"相看两不厌，只有敬亭山"},
		{title:'张谓',content:"不知近水花先发，疑是经冬雪未销"},
		{title:'王之涣',content:"白日依山尽，黄河入海流"},
		{title:'杜甫',content:"迟日江山丽，春风花草香"},
		{title:'陶渊明',content:"种豆南山下，草盛豆苗稀"},
		{title:'《后汉书》',content:"举大事者，不忌小怨"},
		{title:'杜牧',content:"清明时节雨纷纷，路上行人欲断魂"},
		{title:'常建',content:"竹径通幽处，禅房花木深"},
		{title:'王维',content:"空山不见人，但闻人语响"},
		{title:'谢灵运',content:"首夏犹清和，芳草亦未歇"},
		{title:'孟浩然',content:"夜来风雨声，花落知多少"},
		{title:'李白',content:"小时不识月，呼作白玉盘"},
		{title:'杜甫',content:"好雨知时节，当春乃发生"},
		{title:'苏轼',content:"我欲乘风归去，又恐琼楼玉宇；高处不胜寒"},
		{title:'荀子',content:"锲而不舍，金石可镂"},
		{title:'李昂',content:"人皆苦炎热，我爱夏日长"},
		{title:'刘长卿',content:"柴门闻犬吠，风雪夜归人"},
		{title:'王安石',content:"遥知不是雪，为有暗香来"},
		{title:'王维',content:"风劲角弓鸣，将军猎渭城"},
		{title:'张志和',content:"西塞山前白鹭飞；桃花流水鳜鱼肥"},
		{title:'刘长舞',content:"日暮苍山远，天寒白屋贫"},
		{title:'李绅',content:"春种一粒粟，秋收万颗子"},
		{title:'《史记》',content:"失之东隅，收之桑榆"},
		{title:'李白',content:"举头望明月，低头思故乡"},
		{title:'柳宗元',content:"千山鸟飞绝，万径人踪灭"},
		{title:'荀子',content:"学无止境"},
		{title:'苏轼',content:"竹外桃花三两枝，春江水暖鸭先知"},
		{title:'《史记》',content:"风萧萧兮易水寒，壮士一去兮不复还"},
		{title:'《三国志》',content:"读书百遍，其义自现"},
		{title:'秦观',content:"芳菲歇去何须恨，夏木阳阴正可人"},
		{title:'韩婴',content:"树欲静而风不止，子欲养而亲不待也"},
		{title:'《汉书》',content:"百闻不如一见"},
		{title:'王之涣',content:"欲穷千里目，更上一层楼"},
		{title:'叶绍翁',content:"春色满园关不住，一枝红杏出墙来"},
		{title:'王维',content:"明月松间照，清泉石上流"},
		{title:'《孟子》',content:"穷则独善其身，达则兼善天下"},
		{title:'王维',content:"月出惊山鸟，时鸣春涧中"},
		{title:'李峤',content:"解落三秋叶，能开二月花"},
		{title:'陆游',content:"儿童冬学闹比邻，据岸愚懦却子珍"},
		{title:'苏麟',content:"近水楼台先得月，向阳花木易为春"},
		{title:'杜甫',content:"黄四娘家花满蹊，千朵万朵压枝低"},
		{title:'《后汉书》',content:"精诚所至，金石为开"},
		{title:'《吕氏春秋》',content:"察己则可以知人，察今则可以知古"},
		{title:'杜牧',content:"银烛秋光冷画屏，轻罗小扇扑流萤"},
		{title:'陆游',content:"山重水复疑无路，柳暗花明又一村"},
		{title:'《左传》',content:"人谁无过，过而能改，善莫大焉"},
		{title:'自居易',content:"野火烧不尽，春风吹又生"},
		{title:'王安石',content:"千门万户瞳瞳日，总把新桃换旧符"},
		{title:'苏轼',content:"不识庐山真面目，只缘身在此山中"},
		{title:'林则徐',content:"海纳百川，有容乃大；壁立千仞，无欲则刚"},
		{title:'王安石',content:"不畏浮云遮望眼，自缘身在最高层"},
		{title:'曹学',content:"若要功夫深，铁杵磨成针"},
	]
</script>

<style lang="stylus" scoped>

	
</style>