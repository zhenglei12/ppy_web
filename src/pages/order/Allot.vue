<template>
  <a-modal
    :visible="visible"
    title="分配编辑"
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
      <a-form-model-item label="编辑">
        <!-- <a-input v-model="form.roles" allow-clear /> -->
        <a-select
          v-model="form.edit_name"
          allowClear
          :dropdownMatchSelectWidth="false"
        >
          <a-select-option
            v-for="(option, index) in R.editorList"
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
import OrderApi from "../../apis/order";

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
        };
      }
    },
  },
  methods: {
    submit() {
      this.loading = true;
      OrderApi.allot({ ...this.form })
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