<template>
  <div class="block">
    <span>欢迎：{{ $auth.user().name }}</span>
    <span>邮箱：{{ $auth.user().email }}</span>
  </div>
</template>

<style lang="less" scoped>
.block {
  padding: 15px;
  border-left: 5px solid #009688;
  background-color: #f2f2f2;

  span {
    margin-right: 16px;
  }
}
</style>
