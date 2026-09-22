<template>
  <a-modal
    :visible="visible"
    :title="isEdit ? '编辑设备' : '新增设备'"
    :confirmLoading="loading"
    destroyOnClose
    width="760px"
    @cancel="close"
    @ok="submit"
  >
    <a-form-model ref="form" :model="form" :label-col="{ span: 7 }" :wrapper-col="{ span: 16 }">
      <a-row :gutter="16">
        <a-col :span="12"><a-form-model-item label="设备编号" required><a-input v-model="form.device_number" /></a-form-model-item></a-col>
        <a-col :span="12"><a-form-model-item label="型号"><a-input v-model="form.model" /></a-form-model-item></a-col>
        <a-col :span="12"><a-form-model-item label="颜色"><a-input v-model="form.color" /></a-form-model-item></a-col>
        <a-col :span="12"><a-form-model-item label="内存"><a-input v-model="form.memory" /></a-form-model-item></a-col>
        <a-col :span="12"><a-form-model-item label="购买日期"><a-date-picker v-model="form.purchase_date" valueFormat="YYYY-MM-DD" /></a-form-model-item></a-col>
        <a-col :span="12"><a-form-model-item label="购买渠道"><a-input v-model="form.purchase_channel" /></a-form-model-item></a-col>
        <a-col :span="12"><a-form-model-item label="价格"><a-input-number v-model="form.price" :min="0" :precision="2" /></a-form-model-item></a-col>
        <a-col :span="12"><a-form-model-item label="持有人"><a-input v-model="form.holder" /></a-form-model-item></a-col>
        <a-col :span="12">
          <a-form-model-item label="状态" required>
            <a-select v-model="form.status">
              <a-select-option v-for="item in statusList" :key="item.value" :value="item.value">{{ item.label }}</a-select-option>
            </a-select>
          </a-form-model-item>
        </a-col>
      </a-row>
    </a-form-model>
  </a-modal>
</template>

<script>
import editMixin from "../../mixins/edit";
import DeviceApi from "../../apis/device";
import Utils from "../../libs/utils";
import { deviceStatusMap } from "./mapping";

export default {
  mixins: [editMixin],
  data() {
    return { loading: false, form: {}, statusList: Utils.mapToArray(deviceStatusMap) };
  },
  watch: {
    visible(show) {
      if (show) this.form = this.isEdit ? { ...this.R } : { status: "pending" };
    },
  },
  methods: {
    async submit() {
      if (!this.form.device_number) return this.$message.warning("请输入设备编号");
      this.loading = true;
      try {
        const res = await (this.isEdit ? DeviceApi.update(this.form) : DeviceApi.create(this.form));
        this.$message.success("保存成功");
        this.$emit("refresh", res);
        this.close();
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style lang="less" scoped>
/deep/ .ant-input-number,
/deep/ .ant-calendar-picker {
  width: 100%;
}
</style>
