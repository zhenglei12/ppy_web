<template>
  <div class="business-page management-page user-management-page">
    <header class="page-head">
      <div class="page-title">
        <h1>用户管理</h1>
        <p>统一维护员工账号、任职状态与系统角色。</p>
      </div>
      <div class="head-actions">
        <button v-acl="'user-add'" class="primary-button" @click="toEdit()">
          <a-icon type="plus" />新增员工
        </button>
      </div>
    </header>

    <div class="metric-grid">
      <metric-card v-for="item in metrics" :key="item.label" v-bind="item" />
    </div>

    <section class="panel employee-panel">
      <div class="panel-head management-panel-head employee-panel-head">
        <div>
          <h2>员工管理</h2>
          <p>管理员工基础资料、账号权限和任职信息。</p>
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
        :scroll="{ x: 1740 }"
        rowKey="id"
        @change="listChange"
      >
        <template slot="department" slot-scope="department">
          {{ department ? department.name : "--" }}
        </template>
        <template slot="employmentStatus" slot-scope="status">
          <span class="employment-status" :class="status">{{ employmentStatusMap[status] || "--" }}</span>
        </template>
        <template slot="salary" slot-scope="salary">
          {{ formatSalary(salary) }}
        </template>
        <template slot="certificates" slot-scope="images">
          <div v-if="images && images.length" class="certificate-list-cell">
            <a
              v-for="(url, index) in images.slice(0, 3)"
              :key="url + index"
              :href="url"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img :src="url" alt="证件资料" />
            </a>
            <span v-if="images.length > 3">+{{ images.length - 3 }}</span>
          </div>
          <span v-else>--</span>
        </template>
        <template slot="operate" slot-scope="data">
          <span v-acl="'user-update'">
            <a-icon type="edit" title="编辑" @click="toEdit(data)" />
            <a-divider type="vertical"></a-divider>
          </span>
          <span v-acl="'user-add.role'">
            <a-icon type="api" title="分配角色" @click="toManager(data.id)" />
            <a-divider type="vertical"></a-divider>
          </span>
          <span v-acl="'user-delete'">
            <a-popconfirm title="确认删除？" @confirm="toDelete(data.id)">
              <a-icon type="delete" title="删除" />
            </a-popconfirm>
          </span>
        </template>
      </a-table>
    </section>

    <!-- 编辑 -->
    <cus-edit v-model="editVisible" :data="temp" @refresh="refreshEmployees"></cus-edit>

    <!-- 分配角色 -->
    <cus-role v-model="roleVisible" :data="temp" @refresh="_getList"></cus-role>

    <!-- 详情 -->
    <!-- <cus-detail
      v-model="detailVisible"
      :data="temp"
      @refresh="_getList"
    ></cus-detail> -->
  </div>
</template>

<script>
const condition = [
  {
    key: "username",
    placeholder: "员工姓名",
  },
  {
    key: "employment_status",
    type: "select",
    placeholder: "任职状态",
    options: [
      { label: "试用", value: "probation" },
      { label: "在职", value: "active" },
      { label: "调岗", value: "transferred" },
      { label: "离职", value: "resigned" },
    ],
  },
];

const columns = [
  {
    title: "员工编号",
    dataIndex: "id",
    width: 110,
  },
  {
    title: "员工姓名",
    dataIndex: "name",
    width: 110,
  },
  {
    title: "手机号码",
    dataIndex: "mobile",
    width: 130,
  },
  {
    title: "部门名称",
    dataIndex: "department",
    width: 120,
    scopedSlots: { customRender: "department" },
  },
  {
    title: "岗位名称",
    dataIndex: "position_name",
    width: 120,
  },
  {
    title: "任职状态",
    dataIndex: "employment_status",
    width: 100,
    scopedSlots: { customRender: "employmentStatus" },
  },
  {
    title: "转正日期",
    dataIndex: "regular_date",
    width: 120,
  },
  {
    title: "基本工资",
    dataIndex: "base_salary",
    width: 120,
    scopedSlots: { customRender: "salary" },
  },
  {
    title: "紧急联系人",
    dataIndex: "emergency_contact_name",
    width: 120,
  },
  {
    title: "紧急联系电话",
    dataIndex: "emergency_contact_phone",
    width: 140,
  },
  {
    title: "合同结束日期",
    dataIndex: "contract_end_date",
    width: 130,
  },
  {
    title: "证件资料",
    dataIndex: "certificate_images",
    width: 170,
    scopedSlots: { customRender: "certificates" },
  },
  {
    title: "操作",
    width: 110,
    fixed: "right",
    scopedSlots: { customRender: "operate" },
  },
];

import listMixin from "../../mixins/list";
import CusEdit from "./Edit";
// import CusDetail from "./Detail";
import CusRole from "./Role";
import UserApi from "../../apis/user";
import MetricCard from "../../components/business/MetricCard.vue";

export default {
  components: {
    CusEdit,
    // CusDetail,
    CusRole,
    MetricCard,
  },
  mixins: [listMixin],
  data() {
    return {
      condition,
      columns,
      editVisible: false,
      // detailVisible: false,
      roleVisible: false,
      employmentStatusMap: {
        probation: "试用",
        active: "在职",
        transferred: "调岗",
        resigned: "离职",
      },
      statistics: {
        active_count: null,
        month_hire_count: null,
        probation_count: null,
        resigned_count: null,
        statistics_month: "",
      },
    };
  },
  computed: {
    metrics() {
      return [
        {
          icon: "team",
          tone: "green",
          label: "在职人数",
          value: this.formatCount(this.statistics.active_count),
          compare: "实时统计",
        },
        {
          icon: "user-add",
          tone: "blue",
          label: "本月入职",
          value: this.formatCount(this.statistics.month_hire_count),
          compare: "实时统计",
        },
        {
          icon: "clock-circle",
          tone: "orange",
          label: "试用期",
          value: this.formatCount(this.statistics.probation_count),
          compare: "实时统计",
        },
        {
          icon: "user-delete",
          tone: "red",
          label: "离职",
          value: this.formatCount(this.statistics.resigned_count),
          compare: "实时统计",
        },
      ];
    },
  },
  created() {
    this.getStatistics();
  },
  methods: {
    formatCount(value) {
      return value === null || value === undefined ? "--" : `${value} 人`;
    },
    formatSalary(value) {
      if (value === null || value === undefined || value === "") return "--";
      return `¥${Number(value).toLocaleString("zh-CN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    },
    async refreshEmployees() {
      await Promise.all([this._getList(), this.getStatistics()]);
    },
    getStatistics() {
      return UserApi.statistics().then((res) => {
        this.statistics = Object.assign({}, this.statistics, res || {});
      });
    },
    // toDetail(e) {
    //   this.temp = e;
    //   this.detailVisible = true;
    // },
    toEdit(e) {
      this.temp = e;
      this.editVisible = true;
    },
    toDelete(e) {
      UserApi.remove(e).then(() => {
        this.$message.success("操作成功");
        this.refreshEmployees();
      });
    },
    toManager(e) {
      UserApi.roles(e).then((res) => {
        this.temp = {
          id: e,
          roles: res.list.map((_) => _.name),
        };
        this.roleVisible = true;
      });
    },
    _getList() {
      this.collection.loading = true;
      return UserApi.list(
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

<style lang="less" scoped>
.user-management-page {
  .employee-panel {
    padding: 24px;
  }

  .employee-panel-head {
    align-items: center;
    margin-bottom: 18px;
  }

  /deep/ .ant-table {
    color: #52617c;
  }

  /deep/ .ant-table-thead > tr > th {
    border-bottom: 0;
    background: #f5f7fa;
    color: #71809b;
    font-weight: 500;
  }

  /deep/ .ant-table-tbody > tr > td {
    border-bottom-color: #edf0f4;
  }

  /deep/ .ant-table-tbody > tr:hover > td {
    background: #f8fcfb;
  }

  /deep/ .ant-table-fixed-right {
    box-shadow: -7px 0 18px rgba(22, 42, 78, 0.07);
  }

  /deep/ .ant-pagination-item-active {
    border-color: #08a88d;
  }

  /deep/ .ant-pagination-item-active a {
    color: #08a88d;
  }

  .certificate-list-cell {
    display: flex;
    align-items: center;
    gap: 5px;

    img {
      width: 34px;
      height: 34px;
      border: 1px solid #e4eaf0;
      border-radius: 5px;
      object-fit: cover;
    }

    span {
      color: #7c899d;
      font-size: 12px;
    }
  }

  .employment-status {
    display: inline-flex;
    min-width: 50px;
    justify-content: center;
    padding: 4px 9px;
    border-radius: 6px;
    color: #52617c;
    background: #f1f4f7;

    &.active {
      color: #008f78;
      background: #e5f8f3;
    }

    &.probation {
      color: #e88900;
      background: #fff2df;
    }

    &.resigned {
      color: #ed3838;
      background: #ffe8e8;
    }

    &.transferred {
      color: #1677ff;
      background: #e9f3ff;
    }
  }
}

@media (max-width: 760px) {
  .user-management-page .employee-panel-head {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
