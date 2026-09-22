<template>
  <a-config-provider :locale="locale">
    <router-view></router-view>
  </a-config-provider>
</template>

<script>
import zhCN from "ant-design-vue/lib/locale-provider/zh_CN";

export default {
  data() {
    return {
      locale: zhCN,
    };
  },
};
</script>

<style lang="less">
@import "./styles/index";
</style>