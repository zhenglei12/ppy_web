<template>
  <div class="business-page management-page">
    <header class="page-head">
      <div class="page-title">
        <h1>角色管理</h1>
        <p>维护系统角色，并为不同岗位配置对应的操作权限。</p>
      </div>
      <div class="head-actions">
        <button v-acl="'role-add'" class="primary-button" @click="toEdit()">
          <a-icon type="plus" />新增角色
        </button>
      </div>
    </header>

    <section class="panel management-panel">
      <div class="panel-head management-panel-head">
        <div>
          <h2>角色列表</h2>
          <p>管理角色名称以及角色所拥有的系统权限。</p>
        </div>
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
        rowKey="id"
        @change="listChange"
      >
        <template slot="operate" slot-scope="data">
          <span v-acl="'role-update'">
            <a-icon type="edit" title="编辑" @click="toEdit(data)" />
            <a-divider type="vertical"></a-divider>
          </span>
          <span v-acl="'role-add.permission'">
            <a-icon type="api" title="关联权限" @click="toManager(data.id)" />
            <a-divider type="vertical"></a-divider>
          </span>
          <span v-acl="'role-delete'">
            <a-popconfirm title="确认删除？" @confirm="toDelete(data.id)">
              <a-icon type="delete" title="删除" />
            </a-popconfirm>
          </span>
        </template>
      </a-table>
    </section>

    <!-- 编辑 -->
    <cus-edit v-model="editVisible" :data="temp" @refresh="_getList"></cus-edit>

    <!-- 详情 -->
    <!-- <cus-detail
      v-model="detailVisible"
      :data="temp"
      @refresh="_getList"
    ></cus-detail> -->

    <!-- 权限 -->
    <cus-permission v-model="aclVisible" :data="temp"></cus-permission>
  </div>
</template>

<script>
const condition = [
  {
    key: "name",
    placeholder: "角色名",
  },
];

const columns = [
  {
    title: "角色名",
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
// import CusDetail from "./Detail";
import CusPermission from "./Permission";
import RoleApi from "../../apis/role";

export default {
  components: {
    CusEdit,
    // CusDetail,
    CusPermission,
  },
  mixins: [listMixin],
  data() {
    return {
      condition,
      columns,
      editVisible: false,
      // detailVisible: false,
      aclVisible: false,
    };
  },
  methods: {
    // toDetail(e) {
    //   this.temp = e;
    //   this.detailVisible = true;
    // },
    toEdit(e) {
      this.temp = e;
      this.editVisible = true;
    },
    toDelete(e) {
      RoleApi.remove(e).then(() => {
        this.$message.success("操作成功");
        this._getList();
      });
    },
    toManager(e) {
      RoleApi.permissions(e).then((res) => {
        this.temp = {
          id: e,
          permissions: res.list,
        };
        this.aclVisible = true;
      });
    },
    _getList() {
      this.collection.loading = true;
      RoleApi.list(
        Object.assign(
          {},
          {
            page: this.collection.page,
            pageSize: this.collection.pageSize,
          },
          this.search
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
