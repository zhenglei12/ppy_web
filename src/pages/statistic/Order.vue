<template>
  <div>
    <div class="cus-table-header">
      <list-search
        v-model="search"
        :condition="condition"
        :collection="collection"
      ></list-search>
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
      <template slot="status" slot-scope="data">
        {{ orderStatusMap[data] }}
      </template>
      <template slot="file" slot-scope="data">
        <a v-if="data" @click="toDownload(data)">下载稿件</a>
        <span v-else>未提交</span>
      </template>
    </a-table>
  </div>
</template>

<script>
const condition = [
  {
    key: "subject",
    placeholder: "题目",
  },
  {
    key: "classify_id",
    type: "cascader",
    placeholder: "文档分类",
    changeOnSelect: true,
    options: [],
    labelKey: "name",
    valueKey: "id",
  },
];

const columns = [
  {
    title: "ID",
    dataIndex: "id",
  },
  {
    title: "题目",
    dataIndex: "subject",
  },
  {
    title: "字数",
    dataIndex: "word_number",
  },
  {
    title: "文档分类",
    dataIndex: "classify.name",
  },
  {
    title: "状态",
    dataIndex: "status",
    scopedSlots: { customRender: "status" },
  },
  {
    title: "稿件下载",
    dataIndex: "manuscript",
    scopedSlots: { customRender: "file" },
  },
  {
    title: "创建时间",
    dataIndex: "created_at",
  },
];

import listMixin from "@/mixins/list";
import StatisticApi from "@/apis/statistic";
import PublicApi from "@/apis/public";
import { orderStatusMap } from "../order/mapping";
import Utils from "@/libs/utils";

export default {
  mixins: [listMixin],
  data() {
    return {
      condition,
      columns,
      orderStatusMap,
      amountCount: 0,
      receivedAmountCount: 0,
      download: false,
    };
  },
  created() {
    PublicApi.documentClassify({
      page: 1,
      pageSize: 200,
    }).then((res) => {
      function fmtList(list, level = 1) {
        return list.map((_) => {
          _.level = level;
          if (_.children && _.children.length) {
            _.children = fmtList(_.children, level + 1);
          } else {
            _.isLeaf = true;
            delete _.children;
          }
          return _;
        });
      }
      let temp = this.condition.find((_) => _.key == "classify_id");
      this.classifyList = fmtList(res.list);
      if (temp) {
        temp.options = res.list;
      }
    });
  },
  methods: {
    toDownload(e) {
      if (this.download) {
        return this.$message.warn("正在下载...");
      }
      this.download = true;
      Utils.download(e, e.split("/").pop())
        .then(() => {
          this.$message.success("下载完成");
        })
        .finally(() => (this.download = false));
    },
    _getList() {
      this.collection.loading = true;
      const _search = { ...this.search };
      if (_search && _search.classify_id) {
        _search.classify_id = _search.classify_id.push();
      }
      StatisticApi.order(
        Object.assign(
          {},
          {
            page: this.collection.page,
            pageSize: this.collection.pageSize,
          },
          _search
        )
      ).then((res) => {
        this.collection.list = res.list;
        this.collection.total = res.total;
        this.collection.loading = false;
      });
    },
  },
};
</script>
