<template>
  <a-modal
    :visible="visible"
    :title="title"
    :width="920"
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
      :rules="rules"
      :label-col="{ span: 7 }"
      :wrapper-col="{ span: 16 }"
    >
      <div class="form-section-title">账号与任职信息</div>
      <a-row :gutter="20">
        <a-col :span="12">
          <a-form-model-item label="员工姓名" prop="username">
            <a-input v-model="form.username" allow-clear placeholder="请输入员工姓名" />
          </a-form-model-item>
        </a-col>
        <a-col :span="12">
          <a-form-model-item label="登录密码" prop="password">
            <a-input-password
              v-model="form.password"
              allow-clear
              :placeholder="isEdit ? '不修改请留空' : '请输入登录密码'"
            />
          </a-form-model-item>
        </a-col>
        <a-col :span="12">
          <a-form-model-item label="手机号码" prop="mobile">
            <a-input v-model="form.mobile" allow-clear placeholder="请输入手机号码" />
          </a-form-model-item>
        </a-col>
        <a-col :span="12">
          <a-form-model-item label="所属部门" prop="department_id">
            <a-cascader
              v-model="departmentPath"
              :options="allDepartment"
              :fieldNames="{
                label: 'name',
                value: 'id',
                children: 'children',
              }"
              changeOnSelect
              placeholder="请选择所属部门"
              @change="changeDepartment"
            />
          </a-form-model-item>
        </a-col>
        <a-col :span="12">
          <a-form-model-item label="岗位名称" prop="position_name">
            <a-input v-model="form.position_name" allow-clear placeholder="请输入岗位名称" />
          </a-form-model-item>
        </a-col>
        <a-col :span="12">
          <a-form-model-item label="任职状态" prop="employment_status">
            <a-select v-model="form.employment_status" placeholder="请选择任职状态">
              <a-select-option value="probation">试用</a-select-option>
              <a-select-option value="active">在职</a-select-option>
              <a-select-option value="transferred">调岗</a-select-option>
              <a-select-option value="resigned">离职</a-select-option>
            </a-select>
          </a-form-model-item>
        </a-col>
        <a-col :span="12">
          <a-form-model-item label="转正日期" prop="regular_date">
            <a-date-picker
              v-model="form.regular_date"
              valueFormat="YYYY-MM-DD"
              placeholder="请选择转正日期"
              style="width: 100%"
            />
          </a-form-model-item>
        </a-col>
        <a-col :span="12">
          <a-form-model-item label="基本工资" prop="base_salary">
            <a-input-number
              v-model="form.base_salary"
              :min="0"
              :precision="2"
              placeholder="请输入基本工资"
              style="width: 100%"
            />
          </a-form-model-item>
        </a-col>
      </a-row>

      <div class="form-section-title">紧急联系人与合同</div>
      <a-row :gutter="20">
        <a-col :span="12">
          <a-form-model-item label="联系人姓名" prop="emergency_contact_name">
            <a-input
              v-model="form.emergency_contact_name"
              allow-clear
              placeholder="请输入紧急联系人姓名"
            />
          </a-form-model-item>
        </a-col>
        <a-col :span="12">
          <a-form-model-item label="联系人电话" prop="emergency_contact_phone">
            <a-input
              v-model="form.emergency_contact_phone"
              allow-clear
              placeholder="请输入紧急联系人电话"
            />
          </a-form-model-item>
        </a-col>
        <a-col :span="12">
          <a-form-model-item label="合同结束日期" prop="contract_end_date">
            <a-date-picker
              v-model="form.contract_end_date"
              valueFormat="YYYY-MM-DD"
              placeholder="请选择合同结束日期"
              style="width: 100%"
            />
          </a-form-model-item>
        </a-col>
      </a-row>

      <div class="form-section-title">证件资料</div>
      <a-form-model-item
        class="certificate-field"
        label="证件图片"
        :label-col="{ span: 3 }"
        :wrapper-col="{ span: 20 }"
      >
        <a-upload
          list-type="picture-card"
          accept="image/*"
          multiple
          :file-list="certificateList"
          :customRequest="addCertificate"
          :remove="removeCertificate"
          @preview="previewCertificate"
        >
          <div v-if="certificateList.length < 9">
            <a-icon type="plus" />
            <div class="ant-upload-text">上传图片</div>
          </div>
        </a-upload>
        <div class="upload-tip">支持多张图片，最多上传 9 张。</div>
      </a-form-model-item>
    </a-form-model>

    <img-preview v-model="previewVisible" :urls="previewUrl"></img-preview>
  </a-modal>
</template>

<script>
import editMixin from "../../mixins/edit";
import UserApi from "../../apis/user";
import PublicApi from "../../apis/public";
import upload from "../../libs/upload";
import utils from "../../libs/utils";

const emptyForm = () => ({
  id: undefined,
  username: "",
  password: "",
  department_id: undefined,
  mobile: "",
  position_name: "",
  employment_status: "active",
  regular_date: undefined,
  base_salary: 0,
  emergency_contact_name: "",
  emergency_contact_phone: "",
  contract_end_date: undefined,
  certificate_images: [],
});

export default {
  mixins: [editMixin],
  data() {
    return {
      loading: false,
      allDepartment: [],
      form: emptyForm(),
      departmentPath: [],
      certificateList: [],
      previewVisible: false,
      previewUrl: "",
      rules: {
        username: [{ required: true, message: "请输入员工姓名", trigger: "blur" }],
        password: [
          {
            validator: (rule, value, callback) => {
              if (!this.isEdit && !value) callback(new Error("请输入登录密码"));
              else callback();
            },
            trigger: "blur",
          },
        ],
        department_id: [{ required: true, message: "请选择所属部门", trigger: "change" }],
      },
    };
  },
  created() {
    this.getAllDepartment();
  },
  watch: {
    visible(e) {
      if (!e) return;
      this.initForm();
    },
  },
  computed: {
    title() {
      return this.isEdit ? "编辑员工" : "新增员工";
    },
  },
  methods: {
    initForm() {
      this.form = Object.assign(emptyForm(), {
        id: this.R.id,
        username: this.R.name || "",
        department_id: this.R.department_id,
        mobile: this.R.mobile || "",
        position_name: this.R.position_name || "",
        employment_status: this.R.employment_status || "active",
        regular_date: this.R.regular_date || undefined,
        base_salary: Number(this.R.base_salary || 0),
        emergency_contact_name: this.R.emergency_contact_name || "",
        emergency_contact_phone: this.R.emergency_contact_phone || "",
        contract_end_date: this.R.contract_end_date || undefined,
        certificate_images: this.R.certificate_images || [],
      });
      this.departmentPath = this.findDepartmentPath(this.allDepartment, this.R.department_id) || [];
      this.certificateList = (this.R.certificate_images || []).map((url) => ({
        uid: utils.uuid(),
        status: "done",
        name: url.split("/").pop(),
        url,
      }));
    },
    findDepartmentPath(list, id, parents = []) {
      if (!id) return [];
      for (const item of list || []) {
        const currentPath = parents.concat(item.id);
        if (item.id == id) return currentPath;
        const childPath = this.findDepartmentPath(item.children, id, currentPath);
        if (childPath.length) return childPath;
      }
      return [];
    },
    getAllDepartment() {
      PublicApi.departmentAll().then((res) => {
        this.allDepartment = res.list || [];
        if (this.visible) {
          this.departmentPath = this.findDepartmentPath(this.allDepartment, this.form.department_id);
        }
      });
    },
    changeDepartment(value) {
      this.form.department_id = value.length ? value[value.length - 1] : undefined;
    },
    async addCertificate({ file, onSuccess }) {
      if (this.certificateList.length >= 9) return;
      file.url = await utils.getBase64(file);
      file.status = "done";
      this.certificateList = this.certificateList.concat(file);
      if (onSuccess) onSuccess({}, file);
    },
    removeCertificate(file) {
      this.certificateList = this.certificateList.filter((item) => item.uid !== file.uid);
      return true;
    },
    previewCertificate(file) {
      this.previewUrl = file.url || file.thumbUrl;
      this.previewVisible = true;
    },
    submit() {
      this.$refs.form.validate(async (valid) => {
        if (!valid) return;
        this.loading = true;
        try {
          await upload.uploadList(this.certificateList, ["thesiswdw", "employee-certificate"]);
          this.form.certificate_images = upload.getRources(this.certificateList).filter(Boolean);
          const action = this.isEdit ? UserApi.update : UserApi.create;
          const res = await action({ ...this.form });
          this.$message.success("保存成功");
          this.$emit("refresh", res);
          this.close();
        } finally {
          this.loading = false;
        }
      });
    },
  },
};
</script>

<style lang="less" scoped>
.form-section-title {
  margin: 4px 0 18px;
  padding-left: 10px;
  border-left: 3px solid #08a88d;
  color: #172744;
  font-size: 16px;
  font-weight: 600;
}

.form-section-title:not(:first-child) {
  margin-top: 10px;
  padding-top: 0;
}

.certificate-field {
  margin-bottom: 0;
}

.upload-tip {
  margin-top: -4px;
  color: #8995a8;
  font-size: 12px;
}
</style>
