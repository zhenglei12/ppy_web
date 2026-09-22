<template>
  <a-modal
    :visible="visible"
    title="修改状态"
    destroyOnClose
    :maskClosable="false"
    :confirmLoading="loading"
    @cancel="close"
    @ok="submit"
  >
    <a-form-model ref="form" :model="form" :label-col="{ span: 4 }" :wrapper-col="{ span: 19 }">
      <a-form-model-item label="状态">
        <!-- <a-input v-model="form.roles" allow-clear /> -->
        <a-select v-model="form.status" allowClear :dropdownMatchSelectWidth="false">
          <a-select-option v-for="(option, index) in statusList" :key="index" :value="option.value">
            {{ option.label }}
          </a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item v-if="form.status == 2" label="打回原因">
        <a-textarea v-model="form.reason" :autoSize="{ minRows: 3, maxRows: 5 }" placeholder="打回原因" />
      </a-form-model-item>
      <a-form-model-item label="文件上传" v-if="form.status == 2" required>
        <a-upload
          :fileList="fileList"
          :customRequest="cusUpload"
          :remove="
            () => {
              fileList = [];
            }
          "
        >
          <a-button>上传</a-button>
        </a-upload>
      </a-form-model-item>
      <a-form-model-item label="交稿时间" v-if="form.status == 2" required>
        <a-date-picker v-model="form.submission_time" valueFormat="YYYY-MM-DD" />
      </a-form-model-item>
    </a-form-model>
  </a-modal>
</template>

<script>
import editMixin from "../../mixins/edit";
import OrderApi from "../../apis/order";
import upload from "../../libs/upload";

export default {
  mixins: [editMixin],
  data() {
    return {
      loading: false,
      statusList: [
        { label: "等待安排", value: "-1" },
        { label: "写作进行", value: "1" },
        { label: "已经交稿", value: "5" },
        { label: "收款中", value: "6" },
        { label: "提交客户", value: "4" },
        { label: "打回修改", value: "2" },
        { label: "订单完成", value: "3" },
      ],
      form: {},
      fileList: [],
    };
  },
  watch: {
    visible(e) {
      if (e) {
        this.form = {
          id: this.R.id,
          status: this.R.status,
        };
      }
    },
  },
  methods: {
    submit() {
      this.loading = true;
      upload
        .uploadList(this.fileList, ["thesiswdw"])
        .then(() => {
          this.form.manuscript = upload.getRources(this.fileList)[0];
          return OrderApi.status({ ...this.form }).then((res) => {
            this.$message.success("保存成功");
            this.$emit("refresh", res);
            this.close();
          });
        })
        .finally(() => (this.loading = false));
    },
    cusUpload({ file }) {
      this.fileList = [file];
    },
  },
};
</script>
