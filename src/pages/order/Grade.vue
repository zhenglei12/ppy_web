<template>
  <a-modal
    :visible="visible"
    title="难度"
    destroyOnClose
    :maskClosable="false"
    :confirmLoading="loading"
    @cancel="close"
    @ok="submit"
  >
    <a-form-model
      ref="form"
      :model="form"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 19 }"
    >
      <a-form-model-item label="难度等级" required>
        <a-select
          v-model="form.hard_grade"
          allowClear
          :dropdownMatchSelectWidth="false"
        >
          <a-select-option
            v-for="(option, index) in options"
            :key="index"
            :value="option"
          >
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
      options: ["C1", "C2", "B1", "B2", "A1", "A2", "S1", "S2", "S3"],
    };
  },
  watch: {
    visible(e) {
      if (e) {
        this.form = {
          id: this.R.id,
          hard_grade: this.R.hard_grade,
        };
      }
    },
  },
  methods: {
    submit() {
      this.loading = true;
      OrderApi.grade({ ...this.form })
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
