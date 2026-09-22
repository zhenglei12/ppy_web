<template>
  <a-modal
    :visible="visible"
    title="稿件评分"
    destroyOnClose
    :maskClosable="false"
    :confirmLoading="loading"
    @cancel="close"
    @ok="submit"
  >
    <a-form-model ref="form" :model="form" :label-col="{ span: 4 }" :wrapper-col="{ span: 19 }">
      <a-form-model-item label="稿件评分" required>
        <a-select v-model="form.manuscript_score" allowClear :dropdownMatchSelectWidth="false">
          <a-select-option v-for="option in options" :key="option" :value="option">
            {{ option }}
          </a-select-option>
        </a-select>
      </a-form-model-item>
    </a-form-model>
  </a-modal>
</template>

<script>
import editMixin from "../../mixins/edit";
import OrderApi from "../../apis/order";

export default {
  mixins: [editMixin],
  data() {
    return {
      loading: false,
      form: {},
      options: ["A", "B", "C", "D"],
    };
  },
  watch: {
    visible(e) {
      if (e) {
        this.form = {
          id: this.R.id,
          manuscript_score: this.R.manuscript_score,
        };
      }
    },
  },
  methods: {
    submit() {
      this.loading = true;
      OrderApi.score({ ...this.form })
        .then((res) => {
          this.$message.success("操作成功");
          this.$emit("refresh", res);
          this.close();
        })
        .finally(() => (this.loading = false));
    },
  },
};
</script>
