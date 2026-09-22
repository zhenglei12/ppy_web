<template>
  <div>
    <div class="cus-table-header">
      <list-search v-model="search" :condition="condition" :collection="collection"></list-search>
    </div>
    <div class="cus-table-header">
      <a-button v-acl="'operation_account-add'" type="primary" @click="toEdit()">新增</a-button>
    </div>
    <a-table
      :columns="columns"
      :data-source="collection.list"
      :loading="collection.loading"
      :pagination="{
        total: collection.total,
        current: collection.page,
        pageSize: collection.pageSize,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 条`,
      }"
      bordered
      rowKey="id"
      @change="listChange"
    >
      <template slot="operate" slot-scope="data">
        <div class="cus-nowrap">
          <a-icon v-acl="'operation_account-update'" type="edit" title="编辑" @click="toEdit(data)" />
          <a-divider type="vertical" />
          <span v-acl="'operation_account-log.list'">
            <a-icon type="file" title="日志" @click="toLog(data.id)" />
            <a-divider type="vertical" />
          </span>
          <span v-acl="'operation_account-delete'" class="cus-pointer">
            <a-popconfirm title="确认删除？" @confirm="toDelete(data.id)">
              <a-icon type="delete" title="删除" />
            </a-popconfirm>
          </span>
        </div>
      </template>
    </a-table>
    <cus-edit v-model="editVisible" :data="temp" @refresh="_getList" />
    <cus-log v-model="logVisible" :data="temp" />
  </div>
</template>

<script>
import listMixin from "../../mixins/list";
import OperationAccountApi from "../../apis/operationAccount";
import CusEdit from "./Edit";
import CusLog from "./Log";
import Utils from "../../libs/utils";
import { accountStatusMap } from "./mapping";

const condition = [
  { key: "id", placeholder: "ID" },
  { key: "platform", placeholder: "运营平台" },
  { key: "name", placeholder: "名称" },
  { key: "platform_account_id", placeholder: "平台账号ID" },
  { key: "device_carrier", placeholder: "设备载体" },
  { key: "bound_phone_card", placeholder: "绑定电话卡" },
  { key: "phone_card_owner", placeholder: "电话卡主人" },
  { key: "other_information", placeholder: "其他信息" },
  { key: "person_in_charge", placeholder: "负责人" },
  { key: "status", type: "select", placeholder: "状态", options: Utils.mapToArray(accountStatusMap) },
];

const columns = [
  { title: "ID", dataIndex: "id" },
  { title: "运营平台", dataIndex: "platform" },
  { title: "名称", dataIndex: "name" },
  { title: "平台账号ID", dataIndex: "platform_account_id" },
  { title: "设备载体", dataIndex: "device_carrier" },
  { title: "绑定电话卡", dataIndex: "bound_phone_card" },
  { title: "电话卡主人", dataIndex: "phone_card_owner" },
  { title: "其他信息", dataIndex: "other_information", width: 240 },
  { title: "负责人", dataIndex: "person_in_charge" },
  { title: "状态", dataIndex: "status", customRender: (v) => accountStatusMap[v] || "-" },
  { title: "创建时间", dataIndex: "created_at" },
  { title: "操作", scopedSlots: { customRender: "operate" } },
];

export default {
  components: { CusEdit, CusLog },
  mixins: [listMixin],
  data() {
    return { condition, columns, editVisible: false, logVisible: false };
  },
  methods: {
    async toEdit(row) {
      this.temp = row ? await OperationAccountApi.detail(row.id) : null;
      this.editVisible = true;
    },
    toLog(id) {
      this.temp = id;
      this.logVisible = true;
    },
    toDelete(id) {
      OperationAccountApi.remove(id).then(() => {
        this.$message.success("删除成功");
        this._getList();
      });
    },
    _getList() {
      this.collection.loading = true;
      OperationAccountApi.list({
        page: this.collection.page,
        pageSize: this.collection.pageSize,
        ...(this.search || {}),
      })
        .then((res) => {
          this.collection.list = res.list;
          this.collection.total = res.total;
        })
        .finally(() => (this.collection.loading = false));
    },
  },
};
</script>
