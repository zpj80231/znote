<template>
	<div id="todo" class="todo">
		<h4>待办</h4>
		<input type="text" v-model="todo"  @keyup.enter="doAdd($event,0)" />
		<button @click="doAdd($event,1)">增加</button>

		<h4>进行中</h4>
		<ul>
			<li v-for="(item,key) in list" v-if="!item.checked">
				<input type="checkbox" v-if="!item.checked" @click="doUpdate(item)" /> {{item.data}} --- <button @click="doDel(key)">删除</button>
				<br>
			</li>
		</ul>

		<h4>已完成</h4>
		<ul>
			<li v-for="(item,key) in list" v-if="item.checked">
				<input type="checkbox" v-if="item.checked" @click="doUpdate(item)"  /> {{item.data}} --- <button @click="doDel(key)">删除</button>
				<br>
			</li>
		</ul>


	</div>
</template>

<script>
	export default {
		data() {
			return {
				todo: "",
				list: [],
			}
		},
		// 挂载结束
		mounted() {
			this.getLocalStorage("todolist");
		},
		methods: {
			// todolist 的增删改方法
			doAdd(event,flag) {
				if(flag == 0){
					this.list.push({data:this.todo,checked:false});
					this.saveLocalStorage("todolist",this.list);
				}
				if(flag == 1){
					this.list.push({data:this.todo,checked:false});
					this.saveLocalStorage("todolist",this.list);
				}
				this.todo = "";
			},
			doDel(id) {
				this.list.splice(id,1);
				this.saveLocalStorage("todolist",this.list);
			},
			doUpdate(item) {
				item.checked = !item.checked;
				this.saveLocalStorage("todolist",this.list);
			},

			// localStorage 方法
			getLocalStorage(key) {
				var todolist = JSON.parse(localStorage.getItem(key));
				this.list = todolist;
			},
			saveLocalStorage(key,val) {
				localStorage.setItem(key, JSON.stringify(val));
			}
		}
	}
</script>

<style lang="stylus" scoped>
	.todo {
		width: 300px;
		background: #eee;
		margin-left: 68%;
	}
</style>