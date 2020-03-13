<template>
  <div class="project-item">
    <a
      :href="options.html_url"
      target="_blank"
      class="project-item-card-wrap"
    >
      <h3 class="card-title">{{ options.name }}</h3>
      <p class="card-description">{{ options.description }}</p>
      <div class="card-footer">
        <span><i class="iconfont icon-code"></i>{{ options.language }}</span>
        <span><i class="iconfont icon-xingxing"></i>{{ options.stargazers_count }}</span>
        <span><i class="iconfont icon-fork"></i>{{ options.forks_count }}</span>
      </div>
    </a>
  </div>
</template>

<script>
  export default {
    name: "ProjectItem",
    props: {
      options: {
        type: Object,
        default: () => {}
      }
    }
  };
</script>

<style lang="css" scoped>
  a:hover {
    color: #333;
  }
  
  .project-item {
    width: 320px;
    height: 160px;
    margin-bottom: 20px;
    position: relative;
    margin: 10px;
  }

  .project-item-card-wrap {
    box-sizing: border-box;
    height: 100%;
    display: block;
    padding: 20px;
    border: 1px solid #e5e5e5;
    background-color: rgba(237, 246, 247, 0.65);
    border-radius: 4px;
    color: #34495e;
    transition: border-color 0.1s ease-in-out, box-shadow 0.1s ease-in-out;
  }
  .project-item-card-wrap:hover {
    border-color: rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.15);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  .card-title {
    margin-top: 10px;
    margin-bottom: 5px;
    font-size: 1.2em;
  }
  .card-description {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .card-footer {
    box-sizing: border-box;
    position: absolute;
    width: 100%;
    padding: 0 20px;
    bottom: 20px;
    left: 0;
  }
  .card-footer span {
    padding-right: 15px;
  }
  .card-footer span .iconfont {
    padding-right: 5px;
  }
</style>