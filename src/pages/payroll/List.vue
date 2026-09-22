<template>
  <div class="business-page management-page payroll-page">
    <header class="page-head">
      <div class="page-title">
        <h1>工资管理</h1>
        <p>按月管理工资明细，串联人事、上级、财务、终审和员工确认。</p>
      </div>
      <button v-acl="'hr.payroll.hr.manage'" class="primary-button" @click="openCreateSheet">
        <a-icon type="plus" />新建月度工资表
      </button>
    </header>

    <div class="metric-grid">
      <metric-card icon="file-done" tone="green" label="工资表" :value="`${summary.sheetCount} 份`" compare="当前筛选" />
      <metric-card icon="team" tone="blue" label="工资人数" :value="`${summary.peopleCount} 人`" compare="可查范围" />
      <metric-card icon="pay-circle" tone="orange" label="应发合计" :value="money(summary.gross)" compare="可查范围" />
      <metric-card icon="wallet" tone="green" label="实发合计" :value="money(summary.net)" compare="可查范围" />
    </div>

    <section class="panel management-panel">
      <div class="panel-head management-panel-head">
        <div><h2>月度工资表</h2><p>操作按钮会根据当前流程节点和账号权限自动显示。</p></div>
        <a-form-model layout="inline" class="payroll-search">
          <a-form-model-item><a-month-picker v-model="filters.period_month" valueFormat="YYYY-MM-DD" placeholder="工资月份" allowClear /></a-form-model-item>
          <a-form-model-item>
            <a-select v-model="filters.status" placeholder="流程状态" allowClear>
              <a-select-option v-for="(label, value) in sheetStatus" :key="value" :value="value">{{ label }}</a-select-option>
            </a-select>
          </a-form-model-item>
          <a-form-model-item><a-button type="primary" @click="loadSheets(1)">搜索</a-button></a-form-model-item>
        </a-form-model>
      </div>

      <a-table :columns="sheetColumns" :data-source="sheets.list" :loading="sheets.loading" rowKey="id"
        :pagination="{ total: sheets.total, current: sheets.page, pageSize: sheets.pageSize, showSizeChanger: true }" @change="sheetPageChange">
        <template slot="month" slot-scope="value">{{ monthText(value) }}</template>
        <template slot="amount" slot-scope="value"><strong>{{ money(value) }}</strong></template>
        <template slot="status" slot-scope="value"><span class="flow-status" :class="value">{{ sheetStatus[value] || value }}</span></template>
        <template slot="operate" slot-scope="row">
          <a class="table-action" @click="openDetail(row)">查看明细</a>
          <template v-if="hasAction(row, 'submit_manager_review')"><a-divider type="vertical" /><a @click="confirmSheetAction(row, 'submit_manager_review')">提交上级</a></template>
          <template v-if="hasAction(row, 'submit_finance_review')"><a-divider type="vertical" /><a @click="confirmSheetAction(row, 'submit_finance_review')">提交财务</a></template>
          <template v-if="hasAction(row, 'finance_review')"><a-divider type="vertical" /><a @click="openSheetReview(row, 'finance_review')">财务复核</a></template>
          <template v-if="hasAction(row, 'admin_review')"><a-divider type="vertical" /><a @click="openSheetReview(row, 'admin_review')">终审</a></template>
          <template v-if="hasAction(row, 'mark_paid')"><a-divider type="vertical" /><a @click="confirmSheetAction(row, 'mark_paid')">确认发放</a></template>
          <template v-if="hasAction(row, 'delete')"><a-divider type="vertical" /><a-popconfirm title="删除后不可恢复，确认删除？" @confirm="deleteSheet(row)"><a class="danger-link">删除</a></a-popconfirm></template>
        </template>
      </a-table>
    </section>

    <a-modal v-model="createVisible" title="新建月度工资表" wrapClassName="business-edit-modal" :confirmLoading="saving" @ok="createSheet">
      <a-form-model :model="createForm" layout="vertical">
        <a-form-model-item label="工资月份" required><a-month-picker v-model="createForm.period_month" valueFormat="YYYY-MM-DD" style="width:100%" /></a-form-model-item>
        <a-form-model-item label="薪资方案版本" required><a-input v-model="createForm.formula_version" placeholder="例如：2026-V1" /></a-form-model-item>
        <div class="form-tip">默认为全部在职、试用和调岗员工生成工资明细；同月不能重复创建。</div>
      </a-form-model>
    </a-modal>

    <a-modal v-model="detailVisible" :title="detailTitle" width="94%" wrapClassName="business-edit-modal payroll-detail-modal" :footer="null">
      <div v-if="detail" class="detail-summary">
        <div><span>流程状态</span><b><i class="flow-status" :class="detail.status">{{ sheetStatus[detail.status] }}</i></b></div>
        <div><span>工资人数</span><b>{{ detail.items ? detail.items.length : 0 }} 人</b></div>
        <div><span>应发合计</span><b>{{ money(detail.total_gross_amount) }}</b></div>
        <div><span>实发合计</span><b>{{ money(detail.total_net_amount) }}</b></div>
      </div>
      <a-table v-if="detail" class="payroll-items-table" :columns="itemColumns" :data-source="detail.items || []" rowKey="id" :pagination="false" :scroll="{ x: 2240, y: 460 }" size="middle">
        <template slot="amount" slot-scope="value">{{ money(value) }}</template>
        <template slot="managerStatus" slot-scope="value"><span class="flow-status" :class="value">{{ managerStatus[value] || value }}</span></template>
        <template slot="itemStatus" slot-scope="value"><span class="flow-status" :class="value">{{ itemStatus[value] || value }}</span></template>
        <template slot="itemOperate" slot-scope="row">
          <a v-if="hasAction(row, 'update')" @click="openItemAction(row, 'update')">编辑</a>
          <a v-if="hasAction(row, 'manager_review')" @click="openItemAction(row, 'manager_review')">确认业绩</a>
          <a v-if="hasAction(row, 'admin_adjust')" @click="openItemAction(row, 'admin_adjust')">管理员调整</a>
          <a v-if="hasAction(row, 'employee_confirm')" @click="employeeConfirm(row)">确认工资</a>
          <a v-if="hasAction(row, 'employee_appeal')" @click="openItemAction(row, 'employee_appeal')">申诉</a>
          <a v-if="hasAction(row, 'appeal_resolve')" @click="openItemAction(row, 'appeal_resolve')">处理申诉</a>
          <a-popconfirm v-if="hasAction(row, 'delete')" title="确认删除该工资明细？" @confirm="deleteItem(row)"><a class="danger-link">删除</a></a-popconfirm>
          <span v-if="!(row.available_actions || []).length" class="muted">--</span>
        </template>
      </a-table>
    </a-modal>

    <a-modal v-model="reviewVisible" :title="reviewTitle" wrapClassName="business-edit-modal" :confirmLoading="saving" @ok="submitReview">
      <a-form-model layout="vertical">
        <a-form-model-item label="审批结果"><a-radio-group v-model="reviewForm.action"><a-radio value="approved">通过</a-radio><a-radio value="rejected">驳回</a-radio></a-radio-group></a-form-model-item>
        <a-form-model-item label="审批意见" :required="reviewForm.action === 'rejected'"><a-textarea v-model="reviewForm.comment" :rows="4" placeholder="驳回时请填写原因" /></a-form-model-item>
      </a-form-model>
    </a-modal>

    <a-modal v-model="itemActionVisible" :title="itemActionTitle" width="760px" wrapClassName="business-edit-modal" :confirmLoading="saving" @ok="submitItemAction">
      <a-form-model layout="vertical">
        <div v-if="showAmounts" class="amount-grid">
          <a-form-model-item v-for="field in activeAmountFields" :key="field.key" :label="field.label">
            <a-input-number v-model="itemForm[field.key]" :min="0" :precision="2" style="width:100%" />
          </a-form-model-item>
        </div>
        <a-form-model-item v-if="itemAction === 'manager_review'" label="确认结果"><a-radio-group v-model="itemForm.action"><a-radio value="approved">通过</a-radio><a-radio value="rejected">驳回</a-radio></a-radio-group></a-form-model-item>
        <a-form-model-item v-if="itemAction === 'employee_appeal'" label="申诉内容" required><a-textarea v-model="itemForm.appeal_content" :rows="4" /></a-form-model-item>
        <template v-if="itemAction === 'appeal_resolve'">
          <a-form-model-item label="处理结果"><a-radio-group v-model="itemForm.action"><a-radio value="accepted">申诉成立</a-radio><a-radio value="rejected">驳回申诉</a-radio></a-radio-group></a-form-model-item>
          <a-form-model-item label="处理说明" required><a-textarea v-model="itemForm.result" :rows="3" /></a-form-model-item>
          <a-form-model-item v-if="itemForm.action === 'accepted'" label="退回节点" required><a-select v-model="itemForm.return_stage"><a-select-option value="manager_review">上级确认</a-select-option><a-select-option value="finance_review">财务复核</a-select-option></a-select></a-form-model-item>
        </template>
        <a-form-model-item v-if="['manager_review','admin_adjust'].includes(itemAction)" :label="itemAction === 'admin_adjust' ? '调整原因' : '确认意见'" :required="itemAction === 'admin_adjust' || itemForm.action === 'rejected'">
          <a-textarea v-model="itemForm[itemAction === 'admin_adjust' ? 'reason' : 'comment']" :rows="3" />
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </div>
</template>

<script>
import PayrollApi from "../../apis/payroll";
import MetricCard from "../../components/business/MetricCard.vue";

const amountFields = [
  { key: "base_salary", label: "基本工资", scope: ["update", "admin_adjust"] },
  { key: "sales_commission", label: "销售提成", scope: ["manager_review", "admin_adjust"] },
  { key: "performance_bonus", label: "绩效奖金", scope: ["manager_review", "admin_adjust"] },
  { key: "project_bonus", label: "项目奖金", scope: ["manager_review", "admin_adjust"] },
  { key: "management_bonus", label: "管理奖金", scope: ["manager_review", "admin_adjust"] },
  { key: "allowance_amount", label: "补贴", scope: ["update", "admin_adjust"] },
  { key: "refund_clawback", label: "退款冲回", scope: ["admin_adjust"] },
  { key: "attendance_deduction", label: "考勤扣款", scope: ["update", "admin_adjust"] },
  { key: "social_security", label: "社保", scope: ["update", "admin_adjust"] },
  { key: "housing_fund", label: "公积金", scope: ["update", "admin_adjust"] },
  { key: "personal_tax", label: "个税", scope: ["update", "admin_adjust"] },
];

export default {
  components: { MetricCard },
  data() {
    return {
      filters: {}, saving: false, createVisible: false, detailVisible: false, reviewVisible: false, itemActionVisible: false,
      createForm: { period_month: null, formula_version: "2026-V1" }, detail: null, reviewTarget: null, reviewType: "", reviewForm: { action: "approved", comment: "" },
      itemAction: "", itemTarget: null, itemForm: {},
      sheets: { list: [], total: 0, page: 1, pageSize: 10, loading: false },
      sheetStatus: { draft: "人事草稿", manager_review: "上级确认", finance_review: "财务复核", admin_review: "管理员终审", employee_confirmation: "员工确认", completed: "已完成", paid: "已发放" },
      managerStatus: { pending: "待确认", approved: "已通过", rejected: "已驳回" },
      itemStatus: { pending: "待确认", confirmed: "已确认", appealing: "申诉中", paid: "已发放" },
      sheetColumns: [
        { title: "工资单号", dataIndex: "sheet_no", width: 150 }, { title: "工资月份", dataIndex: "period_month", scopedSlots: { customRender: "month" }, width: 120 },
        { title: "人数", dataIndex: "items_count", width: 80 }, { title: "应发合计", dataIndex: "total_gross_amount", scopedSlots: { customRender: "amount" }, width: 140 },
        { title: "实发合计", dataIndex: "total_net_amount", scopedSlots: { customRender: "amount" }, width: 140 }, { title: "方案版本", dataIndex: "formula_version", width: 110 },
        { title: "状态", dataIndex: "status", scopedSlots: { customRender: "status" }, width: 120 }, { title: "操作", scopedSlots: { customRender: "operate" }, width: 330 },
      ],
      itemColumns: [
        { title: "员工", dataIndex: "employee_name", width: 110 }, { title: "部门", dataIndex: "department_name", width: 110 }, { title: "岗位", dataIndex: "position_name", width: 110 },
        ...amountFields.map(field => ({ title: field.label, dataIndex: field.key, width: 110, scopedSlots: { customRender: "amount" } })),
        { title: "应发", dataIndex: "gross_salary", width: 115, scopedSlots: { customRender: "amount" } }, { title: "实发", dataIndex: "net_salary", width: 115, scopedSlots: { customRender: "amount" } },
        { title: "上级确认", dataIndex: "manager_status", width: 110, scopedSlots: { customRender: "managerStatus" } }, { title: "员工状态", dataIndex: "status", width: 100, scopedSlots: { customRender: "itemStatus" } },
        { title: "操作", width: 220, scopedSlots: { customRender: "itemOperate" } },
      ],
    };
  },
  computed: {
    summary() { return this.sheets.list.reduce((sum, row) => ({ sheetCount: sum.sheetCount + 1, peopleCount: sum.peopleCount + Number(row.items_count || 0), gross: sum.gross + Number(row.total_gross_amount || 0), net: sum.net + Number(row.total_net_amount || 0) }), { sheetCount: 0, peopleCount: 0, gross: 0, net: 0 }); },
    detailTitle() { return this.detail ? `${this.monthText(this.detail.period_month)}工资明细` : "工资明细"; },
    reviewTitle() { return this.reviewType === "finance_review" ? "财务复核" : "超级管理员终审"; },
    itemActionTitle() { return { update: "编辑基础工资", manager_review: "上级确认业绩", admin_adjust: "管理员调整工资", employee_appeal: "工资申诉", appeal_resolve: "处理工资申诉" }[this.itemAction] || "工资操作"; },
    activeAmountFields() { return amountFields.filter(field => field.scope.includes(this.itemAction)); },
    showAmounts() { return ["update", "manager_review", "admin_adjust"].includes(this.itemAction); },
  },
  created() { this.loadSheets(); },
  methods: {
    money(value) { return `¥${Number(value || 0).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; },
    monthText(value) { return value ? `${value.slice(0, 4)}年${Number(value.slice(5, 7))}月` : "--"; },
    hasAction(row, action) { return (row.available_actions || []).includes(action); },
    loadSheets(page) { if (page) this.sheets.page = page; this.sheets.loading = true; PayrollApi.sheets({ ...this.filters, page: this.sheets.page, pageSize: this.sheets.pageSize }).then(res => { this.sheets.list = res.list || []; this.sheets.total = res.total || 0; }).finally(() => { this.sheets.loading = false; }); },
    sheetPageChange(pagination) { this.sheets.page = pagination.current; this.sheets.pageSize = pagination.pageSize; this.loadSheets(); },
    openCreateSheet() { this.createForm = { period_month: null, formula_version: "2026-V1" }; this.createVisible = true; },
    createSheet() { if (!this.createForm.period_month || !this.createForm.formula_version) return this.$message.warning("请完整填写工资月份和方案版本"); this.run(PayrollApi.createSheet(this.createForm), () => { this.createVisible = false; this.loadSheets(1); }); },
    openDetail(row) { PayrollApi.sheetDetail(row.id).then(res => { this.detail = res; this.detailVisible = true; }); },
    refreshDetail() {
      if (!this.detail) return Promise.resolve();
      const sheetId = this.detail.id;
      return PayrollApi.sheetDetail(sheetId).then(res => {
        this.detail = { ...res, items: [...(res.items || [])] };
        this.loadSheets();
      });
    },
    confirmSheetAction(row, action) { const labels = { submit_manager_review: "提交上级确认", submit_finance_review: "提交财务复核", mark_paid: "标记已发放" }; this.$confirm({ title: `确认${labels[action]}？`, content: "提交后当前环节将不能继续修改。", onOk: () => { const calls = { submit_manager_review: () => PayrollApi.submitManagerReview({ id: row.id }), submit_finance_review: () => PayrollApi.submitFinanceReview(row.id), mark_paid: () => PayrollApi.markPaid({ id: row.id }) }; return calls[action]().then(() => { this.$message.success("操作成功"); this.loadSheets(); }); } }); },
    openSheetReview(row, type) { this.reviewTarget = row; this.reviewType = type; this.reviewForm = { action: "approved", comment: "" }; this.reviewVisible = true; },
    submitReview() { if (this.reviewForm.action === "rejected" && !this.reviewForm.comment) return this.$message.warning("请填写驳回原因"); const data = { id: this.reviewTarget.id, ...this.reviewForm }; const promise = this.reviewType === "finance_review" ? PayrollApi.financeReview(data) : PayrollApi.adminReview(data); this.run(promise, () => { this.reviewVisible = false; this.loadSheets(); }); },
    deleteSheet(row) { this.run(PayrollApi.deleteSheet(row.id), () => this.loadSheets(1)); },
    openItemAction(row, action) {
      this.itemTarget = row;
      this.itemAction = action;
      const form = {
        id: row.id,
        action: action === "appeal_resolve" ? "accepted" : "approved",
        return_stage: "manager_review",
        comment: row.manager_comment || "",
        appeal_content: row.appeal_content || "",
        result: row.appeal_result || "",
        reason: "",
      };
      amountFields.forEach(field => {
        const value = row[field.key];
        form[field.key] = value === null || value === undefined || value === "" ? 0 : Number(value);
      });
      this.itemForm = form;
      this.itemActionVisible = true;
    },
    submitItemAction() {
      const payload = { id: this.itemTarget.id };
      let promise;
      if (this.itemAction === "update") {
        this.activeAmountFields.forEach(field => { payload[field.key] = this.itemForm[field.key]; });
        promise = PayrollApi.updateItem(payload);
      } else if (this.itemAction === "manager_review") {
        Object.assign(payload, { action: this.itemForm.action, comment: this.itemForm.comment });
        this.activeAmountFields.forEach(field => { payload[field.key] = this.itemForm[field.key]; });
        promise = PayrollApi.managerReview(payload);
      } else if (this.itemAction === "admin_adjust") {
        if (!this.itemForm.reason) return this.$message.warning("请填写调整原因");
        Object.assign(payload, { reason: this.itemForm.reason });
        this.activeAmountFields.forEach(field => { payload[field.key] = this.itemForm[field.key]; });
        promise = PayrollApi.adminAdjust(payload);
      } else if (this.itemAction === "employee_appeal") {
        if (!this.itemForm.appeal_content) return this.$message.warning("请填写申诉内容");
        promise = PayrollApi.employeeAction({ ...payload, action: "appealed", appeal_content: this.itemForm.appeal_content });
      } else {
        if (!this.itemForm.result) return this.$message.warning("请填写处理说明");
        promise = PayrollApi.resolveAppeal({ ...payload, action: this.itemForm.action, result: this.itemForm.result, return_stage: this.itemForm.action === "accepted" ? this.itemForm.return_stage : undefined });
      }
      this.run(promise, updatedItem => {
        this.itemActionVisible = false;
        this.replaceDetailItem(updatedItem);
        return this.refreshDetail();
      });
    },
    replaceDetailItem(updatedItem) {
      if (!updatedItem || !this.detail || !this.detail.items) return;
      const index = this.detail.items.findIndex(item => item.id === updatedItem.id);
      if (index !== -1) this.$set(this.detail.items, index, { ...this.detail.items[index], ...updatedItem });
    },
    employeeConfirm(row) { this.$confirm({ title: "确认本月工资？", content: "确认后工资明细将永久锁定，不能修改。", onOk: () => PayrollApi.employeeAction({ id: row.id, action: "confirmed" }).then(() => { this.$message.success("工资已确认"); this.refreshDetail(); }) }); },
    deleteItem(row) { this.run(PayrollApi.deleteItem(row.id), this.refreshDetail); },
    run(promise, success) {
      this.saving = true;
      return promise
        .then(result => {
          this.$message.success("操作成功");
          return success ? success(result) : result;
        })
        .finally(() => { this.saving = false; });
    },
  },
};
</script>

<style lang="less" scoped>
.payroll-page {
  .payroll-search /deep/ .ant-form-item { margin: 0 0 0 10px; }
  .payroll-search /deep/ .ant-calendar-picker, .payroll-search /deep/ .ant-select { width: 160px; }
  .table-action, a { color: #009b81; white-space: nowrap; }
  .danger-link { color: #ed4d4d; }
  .muted { color: #9aa5b7; }
  .flow-status { display: inline-flex; min-width: 68px; justify-content: center; padding: 4px 9px; border-radius: 6px; color: #596780; background: #f0f3f6; font-style: normal; font-weight: 500; }
  .flow-status.draft, .flow-status.pending { color: #e88900; background: #fff2df; }
  .flow-status.manager_review, .flow-status.finance_review, .flow-status.admin_review { color: #1677ff; background: #e9f3ff; }
  .flow-status.employee_confirmation, .flow-status.appealing { color: #8c55cf; background: #f2eaff; }
  .flow-status.completed, .flow-status.confirmed, .flow-status.approved { color: #008f78; background: #e5f8f3; }
  .flow-status.paid { color: #087f5b; background: #dcf7eb; }
  .flow-status.rejected { color: #ed3838; background: #ffe8e8; }
  .form-tip { padding: 14px; border-radius: 8px; color: #7b6a40; background: #fff8e8; }
}
.amount-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0 18px; }
@media (max-width: 1000px) { .amount-grid { grid-template-columns: repeat(2, 1fr); } }
</style>

<style lang="less">
.payroll-detail-modal {
  .ant-modal { max-width: calc(100vw - 48px); top: 28px; padding-bottom: 28px; }
  .ant-modal-content { max-height: calc(100vh - 56px); display: flex; flex-direction: column; }
  .ant-modal-header { flex: 0 0 auto; }
  .ant-modal-body {
    min-height: 0;
    padding: 22px 24px 26px;
    overflow-x: hidden;
    overflow-y: auto;
  }
  .detail-summary { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-bottom: 18px; }
  .detail-summary > div { min-width: 0; padding: 16px 18px; border: 1px solid #e8edf3; border-radius: 10px; background: #f9fbfc; }
  .detail-summary span { display: block; margin-bottom: 7px; color: #7b879d; }
  .detail-summary b { color: #102044; font-size: 19px; }
  .detail-summary .flow-status { display: inline-flex; min-width: 68px; justify-content: center; padding: 4px 9px; border-radius: 6px; color: #596780; background: #f0f3f6; font-style: normal; font-weight: 500; }
  .detail-summary .flow-status.draft { color: #e88900; background: #fff2df; }
  .detail-summary .flow-status.manager_review,
  .detail-summary .flow-status.finance_review,
  .detail-summary .flow-status.admin_review { color: #1677ff; background: #e9f3ff; }
  .detail-summary .flow-status.employee_confirmation { color: #8c55cf; background: #f2eaff; }
  .detail-summary .flow-status.completed,
  .detail-summary .flow-status.paid { color: #008f78; background: #e5f8f3; }
  .ant-table-wrapper { width: 100%; min-width: 0; }
  .payroll-items-table .ant-table-scroll { overflow: hidden; }
  .payroll-items-table .ant-table-header { overflow: hidden !important; }
  .payroll-items-table .ant-table-body {
    max-height: min(460px, calc(100vh - 300px)) !important;
    overflow: auto !important;
    scrollbar-gutter: stable;
  }
  .payroll-items-table .ant-table-body::-webkit-scrollbar { width: 10px; height: 10px; }
  .payroll-items-table .ant-table-body::-webkit-scrollbar-thumb { border: 2px solid transparent; border-radius: 8px; background: #c6d1dc; background-clip: padding-box; }
  .payroll-items-table .ant-table-body::-webkit-scrollbar-track { background: #f3f6f8; }
  .ant-table-thead > tr > th,
  .ant-table-tbody > tr > td { height: 54px; padding: 12px 10px; vertical-align: middle; white-space: nowrap; }
  .payroll-items-table .ant-table-tbody > tr { height: 54px; }
  .ant-table-thead > tr > th { background: #f5f7fa; }
  .ant-table-tbody > tr > td:last-child a { display: inline-block; margin-right: 12px; }
  .flow-status { display: inline-flex; min-width: 68px; justify-content: center; padding: 4px 9px; border-radius: 6px; color: #596780; background: #f0f3f6; font-style: normal; font-weight: 500; }
  .flow-status.pending { color: #e88900; background: #fff2df; }
  .flow-status.approved,
  .flow-status.confirmed,
  .flow-status.paid { color: #008f78; background: #e5f8f3; }
  .flow-status.appealing { color: #8c55cf; background: #f2eaff; }
  .flow-status.rejected { color: #ed3838; background: #ffe8e8; }
}
@media (max-width: 1000px) {
  .payroll-detail-modal .detail-summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
