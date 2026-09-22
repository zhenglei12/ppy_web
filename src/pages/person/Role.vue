<template>
  <a-modal
    :visible="visible"
    title="分配角色"
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
      <a-form-model-item label="角色" prop="roles">
        <!-- <a-input v-model="form.roles" allow-clear /> -->
        <a-select
          v-model="form.roles"
          allowClear
          mode="multiple"
          :dropdownMatchSelectWidth="false"
        >
          <a-select-option
            v-for="(option, index) in allRole"
            :key="index"
            :value="option.name"
          >
            {{ option.name }}
          </a-select-option>
        </a-select>
      </a-form-model-item>
    </a-form-model>
  </a-modal>
</template>

<script>
import editMixin from "../../mixins/edit";
import UserApi from "../../apis/user";
import RoleApi from "../../apis/role";

export default {
  mixins: [editMixin],
  data() {
    return {
      loading: false,
      form: {},
      allRole: [],
    };
  },
  created() {
    this.getAllRole();
  },
  watch: {
    visible(e) {
      if (e) {
        this.form = {
          id: this.R.id,
          roles: this.R.roles,
        };
      }
    },
  },
  methods: {
    getAllRole() {
      RoleApi.all().then((res) => {
        this.allRole = res.list;
      });
    },
    submit() {
      this.loading = true;
      UserApi.allot({ ...this.form })
        .then((res) => {
          this.$message.success("保存成功");
          this.$emit("refresh", res);
          this.close();
        })
        .finally(() => (this.loading = false));
    },
  },
};
</script>
