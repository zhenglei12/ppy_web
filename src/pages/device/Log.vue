<template>
  <a-drawer :visible="visible" title="设备日志" width="480" @close="close">
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
import DeviceApi from "../../apis/device";

export default {
  mixins: [detailMixin],
  methods: {
    _getDetail(deviceId) {
      return DeviceApi.logs({ device_id: deviceId, pageSize: 50 });
    },
  },
};
</script>
