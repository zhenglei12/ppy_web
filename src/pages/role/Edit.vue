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
    <a-form-model
      ref="form"
      :model="form"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 19 }"
    >
      <a-form-model-item label="角色名称" required prop="name">
        <a-input v-model="form.name" allow-clear placeholder="请输入角色名称" />
      </a-form-model-item>
    </a-form-model>
  </a-modal>
</template>

<script>
import editMixin from "../../mixins/edit";
import RoleApi from "../../apis/role";

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
          name: this.R.name,
        };
      }
    },
  },
  computed: {
    title() {
      return this.isEdit ? "编辑角色" : "新增角色";
    },
  },
  methods: {
    submit() {
      this.loading = true;
      if (this.isEdit) {
        return RoleApi.update({ ...this.form })
          .then((res) => {
            this.$message.success("保存成功");
            this.$emit("refresh", res);
            this.close();
          })
          .finally(() => (this.loading = false));
      } else {
        return RoleApi.create({ ...this.form })
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
