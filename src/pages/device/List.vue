<template>
  <div>
    <div class="cus-table-header">
      <list-search v-model="search" :condition="condition" :collection="collection"></list-search>
    </div>
    <div class="cus-table-header">
      <a-button v-acl="'device-add'" type="primary" @click="toEdit()">新增</a-button>
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
          <a-icon v-acl="'device-update'" type="edit" title="编辑" @click="toEdit(data)" />
          <a-divider type="vertical" />
          <span v-acl="'device-log.list'">
            <a-icon type="file" title="日志" @click="toLog(data.id)" />
            <a-divider type="vertical" />
          </span>
          <span v-acl="'device-delete'" class="cus-pointer">
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
import DeviceApi from "../../apis/device";
import CusEdit from "./Edit";
import CusLog from "./Log";
import Utils from "../../libs/utils";
import { deviceStatusMap } from "./mapping";

const condition = [
  { key: "id", placeholder: "ID" },
  { key: "device_number", placeholder: "设备编号" },
  { key: "model", placeholder: "型号" },
  { key: "color", placeholder: "颜色" },
  { key: "memory", placeholder: "内存" },
  { key: "purchase_date", type: "date", placeholder: "购买日期" },
  { key: "purchase_channel", placeholder: "购买渠道" },
  { key: "price", placeholder: "价格" },
  { key: "holder", placeholder: "持有人" },
  { key: "status", type: "select", placeholder: "状态", options: Utils.mapToArray(deviceStatusMap) },
];

const columns = [
  { title: "ID", dataIndex: "id" },
  { title: "设备编号", dataIndex: "device_number" },
  { title: "型号", dataIndex: "model" },
  { title: "颜色", dataIndex: "color" },
  { title: "内存", dataIndex: "memory" },
  { title: "购买日期", dataIndex: "purchase_date" },
  { title: "购买渠道", dataIndex: "purchase_channel" },
  { title: "价格", dataIndex: "price" },
  { title: "持有人", dataIndex: "holder" },
  { title: "状态", dataIndex: "status", customRender: (v) => deviceStatusMap[v] || "-" },
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
      this.temp = row ? await DeviceApi.detail(row.id) : null;
      this.editVisible = true;
    },
    toLog(id) {
      this.temp = id;
      this.logVisible = true;
    },
    toDelete(id) {
      DeviceApi.remove(id).then(() => {
        this.$message.success("删除成功");
        this._getList();
      });
    },
    _getList() {
      this.collection.loading = true;
      DeviceApi.list({
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
