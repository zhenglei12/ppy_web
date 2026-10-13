<template>
  <div class="business-page crm-page">
    <header class="page-head"><div class="page-title"><h1>电销 CRM</h1><p>微问家电销成员与通话数据，按日期同步并统计。</p></div><div class="head-actions"><a-input type="date" v-model="date" @change="changeDate" /><a-button v-acl="'crm.followup.manage'" type="primary" icon="sync" :loading="syncing" @click="syncData">同步三方最新数据</a-button></div></header>
    <section class="metric-grid">
      <div v-for="metric in metrics" :key="metric.key" class="metric-card"><span>{{ metric.label }}</span><strong>{{ metric.duration ? formatDuration(summary[metric.key]) : `${summary[metric.key] || 0}${metric.suffix || ''}` }}</strong></div>
    </section>
    <section class="panel management-panel">
      <div class="panel-head management-panel-head"><div><h2>成员通话统计</h2><p>数据日期：{{ date }}，未产生通话的成员指标显示为 0</p></div></div>
      <a-table :columns="columns" :data-source="members" :pagination="pagination" :loading="loading" row-key="id" @change="changePage">
        <template slot="member" slot-scope="text,row"><strong>{{ row.user_name }}</strong><small>{{ row.department_name || '未分组' }}</small></template>
        <template slot="rate" slot-scope="text">{{ Number(text || 0).toFixed(1) }}%</template>
        <template slot="duration" slot-scope="text">{{ formatDuration(text) }}</template>
      </a-table>
    </section>
  </div>
</template>

<script>
import BusinessApi from "../../apis/business";
export default { data() { return { date: new Date().toISOString().slice(0, 10), summary: {}, members: [], loading: false, syncing: false, pagination: { current: 1, pageSize: 10, total: 0, showSizeChanger: true, showTotal: total => `共 ${total} 条` }, metrics: [{ key: "total_calls", label: "总通话数" }, { key: "connected_calls", label: "已接通" }, { key: "unconnected_calls", label: "未接通" }, { key: "connection_rate", label: "接通率", suffix: "%" }, { key: "total_duration", label: "总通话时长", duration: true }, { key: "active_members", label: "活跃成员" }], columns: [{ title: "部门成员", scopedSlots: { customRender: "member" } }, { title: "总通话数", dataIndex: "total_calls" }, { title: "已接通", dataIndex: "connected_calls" }, { title: "未接通", dataIndex: "unconnected_calls" }, { title: "接通率", dataIndex: "connection_rate", scopedSlots: { customRender: "rate" } }, { title: "总通话时长", dataIndex: "total_duration", scopedSlots: { customRender: "duration" } }, { title: "平均接通时长", dataIndex: "average_duration", scopedSlots: { customRender: "duration" } }] }; }, created() { this.load(); }, methods: { load() { this.loading = true; BusinessApi.weiwenjiaCrmDashboard({ date: this.date, page: this.pagination.current, pageSize: this.pagination.pageSize }).then(res => { this.summary = res.summary || {}; const page = res.members || {}; this.members = page.data || []; this.pagination.total = page.total || 0; }).finally(() => { this.loading = false; }); }, changeDate() { this.pagination.current = 1; this.load(); }, changePage(page) { this.pagination.current = page.current; this.pagination.pageSize = page.pageSize; this.load(); }, formatDuration(value) { const seconds = Number(value || 0); if (seconds < 60) return `${seconds}秒`; const minutes = Math.floor(seconds / 60); const remain = seconds % 60; return `${minutes}分${remain}秒`; }, syncData() { this.syncing = true; BusinessApi.syncWeiwenjiaCrm({ date: this.date }).then(res => { this.$message.success(`${res.message || '同步完成'}：${res.user_count || 0}名成员，${res.call_count || 0}条通话`); this.pagination.current = 1; return this.load(); }).finally(() => { this.syncing = false; }); } } };
</script>

<style lang="less" scoped>
.crm-page .primary-button { border: 0; cursor: pointer; }
.source-tag { display: inline-block; margin-left: 8px; padding: 2px 7px; border-radius: 10px; color: #0a927c; background: #e6f8f4; font-size: 11px; font-weight: 500; }
.crm-page small { color: #8491a7; }
.crm-page .ant-tag { margin-bottom: 3px; }
.metric-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 16px; margin-bottom: 20px; }
.metric-card { min-height: 108px; padding: 20px 22px; background: #fff; border: 1px solid #e4ebf3; border-radius: 14px; box-shadow: 0 8px 24px rgba(20, 44, 78, .04); }
.metric-card span { display: block; color: #75829a; font-size: 14px; }
.metric-card strong { display: block; margin-top: 12px; color: #0d1930; font-size: 30px; }
.crm-page .ant-table-wrapper { overflow-x: auto; }
.head-actions { display: flex; align-items: center; gap: 12px; }
.head-actions .ant-input { width: 170px; }
@media (max-width: 1200px) { .metric-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
</style>
