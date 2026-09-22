<template>
  <a-drawer :visible="visible" title="运营账户日志" width="480" @close="close">
    <a-timeline>
      <a-timeline-item v-for="(item, index) in D.list" :key="index">
        <p>{{ item.created_at }}</p>
        <p>{{ item.content }}</p>
      </a-timeline-item>
    </a-timeline>
  </a-drawer>
</template>

<script>
import detailMixin from "../../mixins/detail";
import OperationAccountApi from "../../apis/operationAccount";

export default {
  mixins: [detailMixin],
  methods: {
    _getDetail(operationAccountId) {
      return OperationAccountApi.logs({ operation_account_id: operationAccountId, pageSize: 50 });
    },
  },
};
</script>
