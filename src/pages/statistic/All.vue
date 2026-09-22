<template>
  <div>
    <div class="cus-table-header">
      <list-search v-model="search" :condition="condition" :collection="collection"></list-search>
    </div>
    <a-table
      :columns="columns"
      :data-source="collection.list"
      :loading="collection.loading"
      :pagination="false"
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
    key: "_date",
    type: "date-in",
  },
];

const columns = [
  {
    title: "总销售额",
    dataIndex: "amount_count",
  },
  {
    title: "已收回金额",
    dataIndex: "received_amount_count",
  },
  {
    title: "未收回金额",
    dataIndex: "receipt_amount_count",
  },
  {
    title: "退款金额",
    dataIndex: "after_amount_count",
  },
];

import listMixin from "@/mixins/list";
import StatisticApi from "@/apis/statistic";
import PublicApi from "@/apis/public";

export default {
  mixins: [listMixin],
  data() {
    return {
      condition,
      columns,
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
  },
  methods: {
    _getList() {
      this.collection.loading = true;
      let _search = JSON.parse(JSON.stringify(this.search));
      if (_search && _search._date) {
        _search.created_at = _search._date[0];
        _search.end_time = _search._date[1];
        delete _search._date;
      }
      StatisticApi.all(
        Object.assign(
          {},
          {
            page: this.collection.page,
            pageSize: this.collection.pageSize,
          },
          _search
        )
      ).then((res) => {
        this.collection.list = [res];
        this.collection.total = res.total;
        this.collection.loading = false;
      });
    },
  },
};
</script>
