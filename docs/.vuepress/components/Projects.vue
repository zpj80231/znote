<template>
  <div class="">
    <Common
      :sidebar="false"
      :isComment="false"
    >
      <section class="project">
        <h1 class="project-title">My Project</h1>
        <h4 class="project-subtitle">如果你觉得下面的项目可能还不错, 别忘了给个 start 吧！</h4>
        <section
          class="project-loading"
          v-if="loading"
        >
          <img src="./img/loading.svg">
          <span>Loading...</span>
        </section>
        <section
          class="project-container"
          v-else
        >
          <article
            v-for="(item, index) in projects"
            :key="index"
          >
            <project-item :options="item"></project-item>
          </article>
        </section>
      </section>
    </Common>
  </div>
</template>

<script>
  import Common from "@theme/components/Common.vue";
  import { httpGet } from "./utils/fetch.js";
  import ProjectItem from "./ProjectItem";
  import { filter, orderBy } from "lodash";
  export default {
    name: "Projects",
    components: {
      Common,
      ProjectItem
    },
    data() {
      return {
        projects: [],
        loading: true
      };
    },
    mounted() {
      this.getProjects();
    },
    methods: {
      getProjects() {
        this.loading = true;
        httpGet("https://api.github.com/users/zpj80231/repos").then(res => {
          this.loading = false;
          // 过滤掉私有的项目, 暂不过滤掉 fork 项目 && !item.fork
          const projects = filter(res, item => !item.private);
          this.projects = orderBy(
            projects,
            ["stargazers_count", "forks_count", "name", "created_at"],
            ["desc", "desc", "asc", "desc"]
          );
        });
      }
    }
  };
</script>

<style lang="css" scoped>
  .project {
    max-width: 1024px;
    min-height: 300px;
    margin: 4rem auto;
    margin-top: 6rem;
  }
  .project-title,
  .project-subtitle {
    text-align: center;
  }
  .project-loading {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .project-loading img {
    position: relative;
  }
  .project-loading span {
    position: absolute;
  }
  .project-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
  }
</style>