<template>
  <div>
    <div class="cus-table-header">
      <list-search v-model="search" :condition="condition" :collection="collection"></list-search>
    </div>
    <div class="cus-table-header">
      <div class="statistic">
        <span>
          <span v-if="!$auth.isEditor">总金额：{{ amountCount }}</span>
          <span v-if="!$auth.isEditor">已回收金额：{{ receivedAmountCount }}</span>
          <span v-if="!$auth.isEditor">总尾款金额：{{ receiptAmountCount }}</span>
          <span v-if="!$auth.isEditor">总退款金额：{{ afterAmountCount }}</span>
          <span>字数：{{ alterWordCount }}</span>
          <span>完成篇数：{{ allFinish }}</span>
        </span>
      </div>
      <a-button v-acl="'staff-statistics.export'" type="primary" @click="toExport()">导出</a-button>
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
      }"
      bordered
      rowKey="id"
      @change="listChange"
    >
    </a-table>
  </div>
</template>

<script>
const condition = [
  {
    key: "name",
    type: "select",
    placeholder: "编辑名称",
    options: [],
    labelKey: "name",
    valueKey: "name",
  },
  {
    key: "_date",
    type: "date-in",
  },
];

const columns = [
  {
    title: "序号",
    dataIndex: "id",
  },
  {
    title: "编辑名称",
    dataIndex: "edit_name",
  },
  {
    title: "总金额",
    hidden: "editor",
    dataIndex: "amount",
  },
  {
    title: "已回收金额",
    hidden: "editor",
    dataIndex: "received_amount",
  },
  {
    title: "尾款金额",
    hidden: "editor",
    dataIndex: "receipt_time",
  },
  {
    title: "退款金额",
    hidden: "editor",
    dataIndex: "after_banlace",
  },
  {
    title: "字数",
    dataIndex: "word_number",
  },
  {
    title: "完成篇数",
    dataIndex: "all_finish",
  },
];

import listMixin from "@/mixins/list";
import StatisticApi from "@/apis/statistic";
import PublicApi from "@/apis/public";
import Utils from "@/libs/utils";

export default {
  mixins: [listMixin],
  data() {
    return {
      condition,
      columns,
      amountCount: 0,
      receivedAmountCount: 0,
      receiptAmountCount: 0,
      afterAmountCount: 0,
      alterWordCount: 0,
      allFinish: 0,
    };
  },
  created() {
    PublicApi.roleUserList("edit").then((res) => {
      let temp = this.condition.find((_) => _.key == "name");
      this.editorList = res.list;
      if (temp) {
        temp.options = res.list;
      }
    });
    if (this.$auth.isEditor) {
      this.columns = this.columns.filter((_) => _.hidden !== "editor");
    }
  },
  methods: {
    toExport() {
      let _search = JSON.parse(JSON.stringify(this.search));
      if (_search && _search._date) {
        _search.created_at = _search._date[0];
        _search.end_time = _search._date[1];
        delete _search._date;
      }
      StatisticApi.export(
        Object.assign(
          {},
          {
            page: this.collection.page,
            pageSize: this.collection.pageSize,
          },
          _search
        )
      ).then((res) => {
        if (res.type === "application/json") {
          try {
            const render = new FileReader();
            render.readAsText(res);
            render.onload = (e) => {
              const json = JSON.parse(e.target.result);
              this.$notification.error({
                message: "业务错误",
                description: json.message,
              });
            };
          } catch {
            // eslint-disable-next-line
          }
          return;
        }
        Utils.export(res, "订单列表").then(() => {
          this.$message.success("下载完成");
        });
      });
    },
    _getList() {
      this.collection.loading = true;
      let _search = JSON.parse(JSON.stringify(this.search));
      if (_search && _search._date) {
        _search.created_at = _search._date[0];
        _search.end_time = _search._date[1];
        delete _search._date;
      }
      StatisticApi.day(
        Object.assign(
          {},
          {
            page: this.collection.page,
            pageSize: this.collection.pageSize,
          },
          _search
        )
      ).then((res) => {
        this.amountCount = res.amount_count;
        this.receivedAmountCount = res.received_amount_count;
        this.receiptAmountCount = res.receipt_amount_count;
        this.afterAmountCount = res.after_amount_count;
        this.alterWordCount = res.alter_word_count;
        this.allFinish = res.all_finish;
        const list = res.list;
        list.data.forEach((_, i) => (_.id = (this.collection.page - 1) * this.collection.pageSize + i + 1));
        this.collection.list = list.data;
        this.collection.total = list.total;
        this.collection.loading = false;
      });
    },
  },
};
</script>

<style lang="less" scoped>
.statistic {
  font-size: 20px;
  color: red;

  span {
    margin-left: 20px;

    &:first-of-type {
      margin: 0;
    }
  }
}
</style>
