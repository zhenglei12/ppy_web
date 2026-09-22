<template>
  <div>
    <div class="cus-table-header">
      <list-search
        v-model="search"
        :condition="condition"
        :collection="collection"
      >
      </list-search>
      <a-button
        v-acl="'manuscript_bank-create'"
        type="primary"
        @click="toEdit()"
        >新增稿件</a-button
      >
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
      <template slot="file" slot-scope="data">
        <a v-if="data" @click="toDownload(data)">下载稿件</a>
        <span v-else>未提交</span>
      </template>
      <template slot="operate" slot-scope="data">
        <div class="cus-nowrap">
          <span v-acl="'manuscript_bank-update'">
            <a-icon type="edit" title="编辑" @click="toEdit(data)" />
            <a-divider type="vertical"></a-divider>
          </span>
          <span v-acl="'manuscript_bank-delete'" class="cus-pointer">
            <a-popconfirm title="确认删除？" @confirm="toDelete(data.id)">
              <a-icon type="delete" title="删除" />
            </a-popconfirm>
          </span>
        </div>
      </template>
    </a-table>

    <!-- 上传稿件 -->
    <cus-edit
      v-model="editVisible"
      :data="temp"
      :classifyList="classifyList"
      @refresh="_getList"
    ></cus-edit>
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
    title: "稿件下载",
    dataIndex: "manuscript",
    scopedSlots: { customRender: "file" },
  },
  {
    title: "创建时间",
    dataIndex: "created_at",
  },
  {
    title: "操作",
    scopedSlots: { customRender: "operate" },
  },
];

import listMixin from "@/mixins/list";
import ManuscriptApi from "@/apis/manuscript";
import PublicApi from "@/apis/public";
import { orderStatusMap } from "../order/mapping";
import CusEdit from "./Edit.vue";
import Utils from "../../libs/utils";

export default {
  components: {
    CusEdit,
  },
  mixins: [listMixin],
  data() {
    return {
      condition,
      columns,
      orderStatusMap,
      amountCount: 0,
      receivedAmountCount: 0,
      editVisible: false,
      classifyList: [],
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
    toEdit(e) {
      this.temp = e;
      this.editVisible = true;
    },
    toDelete(e) {
      ManuscriptApi.remove(e).then(() => {
        this.$message.success("操作成功");
        this._getList();
      });
    },
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
      const _search = JSON.parse(JSON.stringify(this.search));
      if (_search && _search.classify_id) {
        _search.classify_id = _search.classify_id.pop();
      }
      ManuscriptApi.list(
        Object.assign(
          {},
          {
            page: this.collection.page,
            pageSize: this.collection.pageSize,
          },
          _search
        )
      ).then((res) => {
        res.list.forEach((_) => {
          _.classify_id =
            _.classify_id && _.classify_id.split(",").map((_) => +_);
        });
        this.collection.list = res.list;
        this.collection.total = res.total;
        this.collection.loading = false;
      });
    },
  },
};
</script>
