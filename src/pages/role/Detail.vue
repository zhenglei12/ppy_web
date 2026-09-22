<template>
  <a-drawer :visible="visible" title="角色详情" @close="close">
    <a-descriptions :column="1">
      <a-descriptions-item label="角色名">{{ R.name }}</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script>
import detailMinxin from "../../mixins/detail";

export default {
  mixins: [detailMinxin],
};
</script>