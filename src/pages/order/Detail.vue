<template>
  <a-drawer :visible="visible" title="订单详情" width="800px" @close="close">
    <a-descriptions :column="2">
      <a-descriptions-item label="用户名">{{ R.name }}</a-descriptions-item>
      <a-descriptions-item label="邮箱">{{ R.email }}</a-descriptions-item>
      <a-descriptions-item label="创建时间">
        {{ R.created_at }}
      </a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script>
import detailMinxin from "../../mixins/detail";

export default {
  mixins: [detailMinxin],
};
</script>