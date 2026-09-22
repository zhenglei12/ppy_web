<template>
  <a-modal
    :visible="visible"
    :title="title"
    wrapClassName="business-edit-modal"
    destroyOnClose
    :maskClosable="false"
    :confirmLoading="loading"
    @cancel="close"
    @ok="submit"
  >
    <a-form-model ref="form" :model="form" :label-col="{ span: 4 }" :wrapper-col="{ span: 19 }">
      <a-form-model-item label="部门名称" required prop="name">
        <a-input v-model="form.name" allow-clear placeholder="请输入部门名称" />
      </a-form-model-item>
    </a-form-model>
  </a-modal>
</template>

<script>
import { departmentApi } from "../../apis/department";
import editMixin from "../../mixins/edit";

export default {
  mixins: [editMixin],
  data() {
    return {
      loading: false,
      form: {},
    };
  },
  watch: {
    visible(e) {
      if (e) {
        this.form = {
          id: this.R.id,
          parent_id: this.R.pid,
          name: this.R.name,
        };
      }
    },
  },
  computed: {
    title() {
      return this.isEdit ? "编辑部门" : "新增部门";
    },
    isEdit() {
      return !!this.data?.id;
    },
  },
  methods: {
    submit() {
      this.loading = true;
      if (this.isEdit) {
        return departmentApi
          .update({ ...this.form })
          .then((res) => {
            this.$message.success("保存成功");
            this.$emit("refresh", res);
            this.close();
          })
          .finally(() => (this.loading = false));
      } else {
        this.form.parent_id = this.form.parent_id ?? 0;
        return departmentApi
          .create({ ...this.form })
          .then((res) => {
            this.$message.success("保存成功");
            this.$emit("refresh", res);
            this.close();
          })
          .finally(() => (this.loading = false));
      }
    },
  },
};
</script>
