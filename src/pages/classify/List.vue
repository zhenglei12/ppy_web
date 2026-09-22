<template>
  <div>
    <div class="cus-table-header">
      <list-search
        v-model="search"
        :condition="condition"
        :collection="collection"
      ></list-search>
      <a-button v-acl="'classify-add'" type="primary" @click="toEdit()"
        >新增分类</a-button
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
      <template slot="operate" slot-scope="data">
        <span v-if="data.level < 3" v-acl="'classify-add'">
          <a-icon type="plus" title="添加下级" @click="toEdit(null, data.id)" />
          <a-divider type="vertical"></a-divider>
        </span>
        <span v-acl="'classify-update'">
          <a-icon type="edit" title="编辑" @click="toEdit(data)" />
          <a-divider type="vertical"></a-divider>
        </span>
        <span v-acl="'classify-delete'" class="cus-pointer">
          <a-popconfirm title="确认删除？" @confirm="toDelete(data.id)">
            <a-icon type="delete" title="删除" />
          </a-popconfirm>
        </span>
      </template>
    </a-table>

    <!-- 编辑 -->
    <cus-edit v-model="editVisible" :data="temp" @refresh="_getList"></cus-edit>
  </div>
</template>

<script>
const condition = [
  {
    key: "name",
    placeholder: "分类名",
  },
];

const columns = [
  {
    title: "ID",
    dataIndex: "id",
  },
  {
    title: "分类名",
    dataIndex: "name",
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

import listMixin from "../../mixins/list";
import CusEdit from "./Edit";
import ClassifyApi from "../../apis/classify";

export default {
  components: {
    CusEdit,
  },
  mixins: [listMixin],
  data() {
    return {
      condition,
      columns,
      editVisible: false,
      aclVisible: false,
    };
  },
  methods: {
    toEdit(e, pid) {
      this.temp = { ...e, pid };
      this.editVisible = true;
    },
    toDelete(e) {
      ClassifyApi.remove(e).then(() => {
        this.$message.success("操作成功");
        this._getList();
      });
    },
    toManager(e) {
      ClassifyApi.permissions(e).then((res) => {
        this.temp = {
          id: e,
          permissions: res.list,
        };
        this.aclVisible = true;
      });
    },
    _getList() {
      this.collection.loading = true;
      ClassifyApi.list(
        Object.assign(
          {},
          {
            page: this.collection.page,
            pageSize: this.collection.pageSize,
          },
          this.search
        )
      ).then((res) => {
        function fmtList(list, level = 1) {
          return list.map((_) => {
            _.level = level;
            if (_.children && _.children.length) {
              _.children = fmtList(_.children, level + 1);
            } else {
              delete _.children;
            }
            return _;
          });
        }

        this.collection.list = fmtList(res.list);
        this.collection.total = res.total;
        this.collection.loading = false;
      });
    },
  },
};
</script>
