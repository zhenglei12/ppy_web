<template>
  <a-modal
    :visible="visible"
    :title="isEdit ? '编辑运营账户' : '新增运营账户'"
    :confirmLoading="loading"
    destroyOnClose
    width="760px"
    @cancel="close"
    @ok="submit"
  >
    <a-form-model ref="form" :model="form" :label-col="{ span: 7 }" :wrapper-col="{ span: 16 }">
      <a-row :gutter="16">
        <a-col :span="12"><a-form-model-item label="运营平台" required><a-input v-model="form.platform" /></a-form-model-item></a-col>
        <a-col :span="12"><a-form-model-item label="名称" required><a-input v-model="form.name" /></a-form-model-item></a-col>
        <a-col :span="12"><a-form-model-item label="平台账号ID" required><a-input v-model="form.platform_account_id" /></a-form-model-item></a-col>
        <a-col :span="12"><a-form-model-item label="设备载体"><a-input v-model="form.device_carrier" /></a-form-model-item></a-col>
        <a-col :span="12"><a-form-model-item label="绑定电话卡"><a-input v-model="form.bound_phone_card" /></a-form-model-item></a-col>
        <a-col :span="12"><a-form-model-item label="电话卡主人"><a-input v-model="form.phone_card_owner" /></a-form-model-item></a-col>
        <a-col :span="12"><a-form-model-item label="负责人"><a-input v-model="form.person_in_charge" /></a-form-model-item></a-col>
        <a-col :span="12">
          <a-form-model-item label="状态" required>
            <a-select v-model="form.status">
              <a-select-option v-for="item in statusList" :key="item.value" :value="item.value">{{ item.label }}</a-select-option>
            </a-select>
          </a-form-model-item>
        </a-col>
        <a-col :span="24">
          <a-form-model-item class="aligned-wide-field" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }" label="其他信息">
            <a-textarea v-model="form.other_information" :autoSize="{ minRows: 3, maxRows: 6 }" />
          </a-form-model-item>
        </a-col>
      </a-row>
    </a-form-model>
  </a-modal>
</template>

<script>
import editMixin from "../../mixins/edit";
import OperationAccountApi from "../../apis/operationAccount";
import Utils from "../../libs/utils";
import { accountStatusMap } from "./mapping";

export default {
  mixins: [editMixin],
  data() {
    return { loading: false, form: {}, statusList: Utils.mapToArray(accountStatusMap) };
  },
  watch: {
    visible(show) {
      if (show) this.form = this.isEdit ? { ...this.R } : { status: "enabled" };
    },
  },
  methods: {
    async submit() {
      if (!this.form.platform || !this.form.name || !this.form.platform_account_id) {
        return this.$message.warning("请填写运营平台、名称和平台账号ID");
      }
      this.loading = true;
      try {
        const res = await (this.isEdit
          ? OperationAccountApi.update(this.form)
          : OperationAccountApi.create(this.form));
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
/deep/ .aligned-wide-field .ant-form-item-label {
  width: 14.583333%;
  flex: 0 0 14.583333%;
  max-width: 14.583333%;
}

/deep/ .aligned-wide-field .ant-form-item-control-wrapper {
  width: 85.416667%;
  flex: 0 0 85.416667%;
  max-width: 85.416667%;
}
</style>
