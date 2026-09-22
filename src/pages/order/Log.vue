<template>
  <a-drawer :visible="visible" title="订单日志" @close="close">
    <a-timeline>
      <a-timeline-item v-for="(item, index) in D.list" :key="index">
        <p>{{ item.created_at }}</p>
        <p>{{ item.remark }}</p>
        <p>
          <a v-if="item.url" @click="toDownload(item.url)">下载附件</a>
        </p>
        <p>{{ item.reason }}</p>
      </a-timeline-item>
    </a-timeline>
  </a-drawer>
</template>

<script>
import detailMinxin from "../../mixins/detail";
import OrderApi from "../../apis/order";
import Utils from "../../libs/utils";

export default {
  mixins: [detailMinxin],
  data() {
    return {
      download: false,
    };
  },
  methods: {
    _getDetail(id) {
      return OrderApi.logs({
        id,
        pageSize: 50,
      });
    },
    toDownload(e) {
      if (this.download) {
        return this.$message.warn("正在下载...");
      }
      this.download = true;
      Utils.download(e, e.split("/").pop())
        .then(() => {
          this.$message.success("下载完成");
        })
        .finally(() => (this.download = false));
    },
  },
};
</script>
