<template>
  <a-modal
    :visible="visible"
    title="售后"
    destroyOnClose
    :maskClosable="false"
    :confirmLoading="loading"
    @cancel="close"
    @ok="submit"
  >
    <a-form-model ref="form" :model="form" :label-col="{ span: 4 }" :wrapper-col="{ span: 19 }">
      <a-form-model-item label="退款金额" required>
        <a-input-number v-model="form.after_banlace"  style="width: 200px" />
      </a-form-model-item>
      <a-form-model-item label="退款凭证">
        <a-upload
          list-type="picture-card"
          :file-list="fileList"
          :customRequest="(e) => cusUpload(e)"
          :remove="
            () => {
              fileList = [];
            }
          "
          @preview="toPreview"
        >
          <div v-if="!fileList.length">
            <a-icon type="plus" />
            <div class="ant-upload-text">上传</div>
          </div>
        </a-upload>
      </a-form-model-item>
    </a-form-model>
    <img-preview v-model="previewVisible" :urls="previewUrl"></img-preview>
  </a-modal>
</template>

<script>
import editMixin from "../../mixins/edit";
import OrderApi from "../../apis/order";
import utils from "../../libs/utils";
import upload from "../../libs/upload";

export default {
  mixins: [editMixin],
  data() {
    return {
      loading: false,
      form: {},
      fileList: [],
      previewVisible: false,
      previewUrl: "",
    };
  },
  watch: {
    visible(e) {
      if (e) {
        this.form = {
          id: this.R.id,
          after_banlace: this.R.after_banlace,
          after_reason: this.R.after_reason,
        };

        this.fileList = this.R.after_img
          ? [
              {
                uid: utils.uuid(),
                status: "done",
                name: this.R.after_img.split("/").pop(),
                url: this.R.after_img,
              },
            ]
          : [];
      }
    },
  },
  methods: {
    async cusUpload({ file }) {
      file.url = await utils.getBase64(file);
      this.fileList = [file];
    },
    toPreview(e) {
      this.previewUrl = e.url || e.thumbUrl;
      this.previewVisible = true;
    },
    async submit() {
      this.loading = true;
      try {
        await upload.uploadList(this.fileList, ["thesiswdw"]);
        this.form.after_img = upload.getRources(this.fileList)[0];
        const res = await OrderApi.after({ ...this.form });
        this.$message.success("操作成功");
        this.$emit("refresh", res);
        this.close();
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
