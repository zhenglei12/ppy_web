<template>
  <a-modal
      :visible="visible"
      :title="title"
      destroyOnClose
      :confirmLoading="loading"
      width="800px"
      @cancel="close"
      @ok="submit"
  >
    <a-form-model ref="form" :model="form" :label-col="{ span: 6 }" :wrapper-col="{ span: 17 }">
      <a-row>
        <a-col span="12">
          <a-form-model-item label="任务类型" required>
            <a-select v-model="form.task_type" allowClear :dropdownMatchSelectWidth="false">
              <a-select-option v-for="(option, index) in typeList" :key="index" :value="option.value | string">
                {{ option.label }}
              </a-select-option>
            </a-select>
          </a-form-model-item>
        </a-col>
        <a-col span="12">
          <a-form-model-item label="学历" required>
            <a-select v-model="form.education" allowClear :dropdownMatchSelectWidth="false" :options="eduList"/>
          </a-form-model-item>
        </a-col>
      </a-row>
      <a-row>
        <a-col span="12">
          <a-form-model-item label="专业名称" required>
            <a-input v-model="form.major_name" allow-clear/>
          </a-form-model-item>
        </a-col>
        <a-col span="12">
          <a-form-model-item label="题目" required>
            <a-input v-model="form.subject" allow-clear/>
          </a-form-model-item>
        </a-col>
      </a-row>
      <a-row>
        <a-col span="12">
          <a-form-model-item label="字数要求" required>
            <a-input-number v-model="form.word_number" :min="0" :precision="0"/>
          </a-form-model-item>
        </a-col>
        <a-col span="12">
          <a-form-model-item label="查重" required>
            <a-input v-model="form.duplicate_checking" allow-clear/>
          </a-form-model-item>
        </a-col>
      </a-row>
      <a-row>
        <a-col span="12">
          <a-form-model-item label="客户名称" required>
            <a-input v-model="form.name" allow-clear/>
          </a-form-model-item>
        </a-col>
        <a-col span="12">
          <a-form-model-item label="电话" required>
            <a-input v-model="form.phone" allow-clear/>
          </a-form-model-item>
        </a-col>
      </a-row>
      <a-row></a-row>
      <a-row>
        <a-col span="12">
          <a-form-model-item label="订单总额">
            <a-input-number v-model="form.amount" :min="0" :disabled="!($auth.isFinance || $auth.isAdmin) && isEdit"/>
          </a-form-model-item>
        </a-col>
        <a-col span="12">
          <a-form-model-item label="已收定金">
            <a-input-number
                v-model="form.received_amount"
                :min="0"
                :disabled="!($auth.isFinance || $auth.isAdmin) && isEdit"
            />
          </a-form-model-item>
        </a-col>
      </a-row>
      <a-row>
        <a-col span="12">
          <a-form-model-item label="收款账户">
            <a-select
                v-model="form.receipt_account_new"
                allowClear
                :dropdownMatchSelectWidth="false"
                :options="accountOpts"
            ></a-select>
          </a-form-model-item>
        </a-col>
        <a-col span="12">
          <a-form-model-item label="店铺账号">
            <a-input v-model="form.shop_name" allow-clear/>
          </a-form-model-item>
        </a-col>
      </a-row>
      <a-row>
        <a-col span="12">
          <a-form-model-item label="时间级别" required>
            <a-select v-model="form.time_rank" allowClear :dropdownMatchSelectWidth="false">
              <a-select-option v-for="(option, index) in timeList" :key="index" :value="option.value | string">
                {{ option.label }}
              </a-select-option>
            </a-select>
          </a-form-model-item>
        </a-col>
      </a-row>
      <a-form-model-item class="aligned-wide-field" :label-col="{ span: 3 }" :wrapper-col="{ span: 20 }" label="写作要求">
        <a-textarea
            v-model="form.task_ask"
            :autoSize="{ minRows: 3, maxRows: 5 }"
            :disabled="isEdit && !$auth.hasRoleId(1)"
            placeholder="写作要求"
        />
      </a-form-model-item>
      <a-form-model-item :label-col="{ span: 3 }" :wrapper-col="{ span: 20 }" label="附件" required>
        <a-upload
            :fileList="askList"
            :customRequest="(e) => cusImgUpload('askList', e)"
            :remove="
            () => {
              askList = [];
            }
          "
        >
          <a-button>上传</a-button>
        </a-upload>
      </a-form-model-item>
      <a-row>
        <a-col span="12">
          <a-form-model-item label="交稿日期" required>
            <a-date-picker v-model="form.submission_time" valueFormat="YYYY-MM-DD"/>
          </a-form-model-item>
        </a-col>
      </a-row>
      <a-row>
        <a-col span="12">
          <a-form-model-item label="定金截图">
            <a-upload
                list-type="picture-card"
                :file-list="imgList_1"
                :customRequest="(e) => cusImgUpload('imgList_1', e)"
                :remove="
                () => {
                  imgList_1 = [];
                }
              "
                @preview="toPreview"
            >
              <div v-if="!imgList_1.length">
                <a-icon type="plus"/>
                <div class="ant-upload-text">上传</div>
              </div>
            </a-upload>
            <!-- 图片预览 -->
            <img-preview v-model="previewVisible" :urls="previewUrl"></img-preview>
          </a-form-model-item>
        </a-col>
        <a-col span="12">
          <a-form-model-item label="尾款截图">
            <a-upload
                list-type="picture-card"
                :file-list="imgList_2"
                :customRequest="(e) => cusImgUpload('imgList_2', e)"
                :remove="
                () => {
                  imgList_2 = [];
                }
              "
                @preview="toPreview"
            >
              <div v-if="!imgList_2.length">
                <a-icon type="plus"/>
                <div class="ant-upload-text">上传</div>
              </div>
            </a-upload>
          </a-form-model-item>
        </a-col>
      </a-row>
    </a-form-model>
  </a-modal>
</template>

<script>
import editMixin from "../../mixins/edit";
import OrderApi from "../../apis/order";
import utils from "../../libs/utils";
import {taskTypeMap, payTypeMap, eduMap, TimeTypeMap} from "./mapping";
import upload from "../../libs/upload";

export default {
  mixins: [editMixin],
  data() {
    return {
      accountOpts: [
        {label: "支付宝", value: "支付宝"},
        {label: "企业微信", value: "企业微信"},
        {label: "线上交易", value: "线上交易"},
        {label: "对公账户", value: "对公账户"},
      ],
      loading: false,
      timeList: utils.mapToArray(TimeTypeMap),
      typeList: utils.mapToArray(taskTypeMap),
      payList: utils.mapToArray(payTypeMap),
      eduList: utils.mapToArray(eduMap),
      imgList_1: [],
      imgList_2: [],
      askList: [],
      form: {},
      previewVisible: false,
      previewUrl: "",
    };
  },
  watch: {
    visible(e) {
      if (e) {
        this.form = {
          id: this.R.id,
          subject: this.R.subject,
          word_number: this.R.word_number,
          task_type: this.R.task_type && this.R.task_type.toString(),
          time_rank: this.R.time_rank && this.R.time_rank.toString(),
          task_ask: this.R.task_ask,
          submission_time: this.R.submission_time,
          name: this.R.name,
          phone: this.R.phone,
          shop_name: this.R.shop_name,
          amount: this.R.amount,
          received_amount: this.R.received_amount,
          remark: this.R.remark,
          education: this.R.education && this.R.education.toString(),
          major_name: this.R.major_name,
          duplicate_checking: this.R.duplicate_checking,
          othen_amount: this.R.othen_amount,
          receipt_account_new: this.R.receipt_account_new,
        };
        this.askList = this.R.attachment
            ? [
              {
                uid: utils.uuid(),
                status: "done",
                name: this.R.attachment.split("/").pop(),
                url: this.R.attachment,
              },
            ]
            : [];
        this.imgList_1 = this.R.pay_img
            ? [
              {
                uid: utils.uuid(),
                status: "done",
                name: this.R.pay_img.split("/").pop(),
                url: this.R.pay_img,
              },
            ]
            : [];
        this.imgList_2 = this.R.receipt_account
            ? [
              {
                uid: utils.uuid(),
                status: "done",
                name: this.R.receipt_account.split("/").pop(),
                url: this.R.receipt_account,
              },
            ]
            : [];
      }
    },
  },
  computed: {
    title() {
      return this.isEdit ? "编辑订单" : "新增订单";
    },
  },
  methods: {
    async cusImgUpload(fileList, {file}) {
      file.url = await utils.getBase64(file);
      this[fileList] = [file];
    },
    toPreview(e) {
      this.previewUrl = e.url;
      this.previewVisible = true;
    },
    submit() {
      this.loading = true;
      Promise.all([
        upload.uploadList(this.askList, ["thesiswdw"]),
        upload.uploadList(this.imgList_1, ["thesiswdw"]),
        upload.uploadList(this.imgList_2, ["thesiswdw"]),
      ])
          .then(() => {
            this.form.attachment = upload.getRources(this.askList)[0];
            this.form.pay_img = upload.getRources(this.imgList_1)[0];
            this.form.receipt_account = upload.getRources(this.imgList_2)[0];
            if (this.isEdit) {
              const form = {...this.form};
              if (!this.$auth.hasRoleId(1)) {
                delete form.task_ask;
              }
              return OrderApi.update(form).then((res) => {
                this.$message.success("保存成功");
                this.$emit("refresh", res);
                this.close();
              });
            } else {
              return OrderApi.create({...this.form}).then((res) => {
                this.$message.success("保存成功");
                this.$emit("refresh", res);
                this.close();
              });
            }
          })
          .finally(() => (this.loading = false));
    },
  },
};
</script>

<style lang="less" scoped>
/deep/ .ant-upload-list-text {
  width: 200px;
}

/deep/ .ant-input-number {
  width: 100%;
}

/deep/ .aligned-wide-field .ant-form-item-control-wrapper {
  width: 85.416667%;
  flex: 0 0 85.416667%;
  max-width: 85.416667%;
}
</style>
