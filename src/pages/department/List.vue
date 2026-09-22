<template>
  <div class="business-page management-page">
    <header class="page-head">
      <div class="page-title">
        <h1>部门管理</h1>
        <p>维护组织架构与上下级部门关系，统一员工归属口径。</p>
      </div>
      <div class="head-actions">
        <button v-acl="'department-create'" class="primary-button" @click="toEdit()">
          <a-icon type="plus" />新增部门
        </button>
      </div>
    </header>

    <section class="panel management-panel">
      <div class="panel-head management-panel-head">
        <div>
          <h2>部门列表</h2>
          <p>支持分级维护部门，并可快速添加下级组织。</p>
        </div>
        <list-search v-model="search" :condition="condition" :collection="collection"></list-search>
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
        rowKey="id"
        @change="listChange"
      >
        <template slot="operate" slot-scope="data">
          <a-button v-if="data.level < 3" v-acl="'department-create'" type="link" @click="toEdit(null, data.id)">
            添加下级
          </a-button>
          <a-button v-acl="'department-update'" type="link" @click="toEdit(data)">编辑</a-button>
          <a-popconfirm v-acl="'department-delete'" title="确认删除？" @confirm="toDelete(data.id)">
            <a-button type="link">删除</a-button>
          </a-popconfirm>
        </template>
      </a-table>
    </section>

    <!-- 编辑 -->
    <cus-edit v-model="editVisible" :data="temp" @refresh="_getList"></cus-edit>
  </div>
</template>

<script>
const condition = [
  {
    key: "name",
    placeholder: "部门名",
  },
];

const columns = [
  {
    title: "ID",
    dataIndex: "id",
  },
  {
    title: "部门名",
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
import { departmentApi } from "../../apis/department";

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
      departmentApi.remove(e).then(() => {
        this.$message.success("操作成功");
        this._getList();
      });
    },
    _getList() {
      this.collection.loading = true;
      departmentApi
        .list(
          Object.assign(
            {},
            {
              page: this.collection.page,
              pageSize: this.collection.pageSize,
            },
            this.search
          )
        )
        .then((res) => {
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
