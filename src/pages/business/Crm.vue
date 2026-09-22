<template>
  <div class="business-page crm-page">
    <header class="page-head"><div class="page-title"><h1>电销 CRM</h1><p>微问家电销日报，成员、通话和业务指标独立于本地员工与订单。</p></div><a-input type="date" v-model="date" @change="load" /></header>
    <section class="metric-grid">
      <div v-for="metric in metrics" :key="metric.key" class="metric-card"><span>{{ metric.label }}</span><strong>{{ summary[metric.key] || 0 }}</strong></div>
    </section>
    <section class="panel management-panel">
      <div class="panel-head management-panel-head"><div><h2>成员日报</h2><p>数据日期：{{ date }}</p></div></div>
      <a-table :columns="columns" :data-source="members" :pagination="pagination" :loading="loading" row-key="id" @change="changePage">
        <template slot="member" slot-scope="text,row"><strong>{{ row.user_name }}</strong><small>{{ row.department_name || '未分组' }}</small></template>
        <template slot="progress" slot-scope="text">{{ text || '--' }}</template>
      </a-table>
    </section>
  </div>
</template>

<script>
import BusinessApi from "../../apis/business";
export default { data() { return { date: new Date().toISOString().slice(0, 10), summary: {}, members: [], loading: false, pagination: { current: 1, pageSize: 50, total: 0 }, metrics: [{ key: "effective_calls", label: "有效接通" }, { key: "effective_communications", label: "有效沟通数" }, { key: "wechat_adds", label: "加V" }, { key: "effective_dialogues", label: "有效对话" }, { key: "effective_activations", label: "有效激活" }, { key: "daily_moments", label: "日朋友圈数" }, { key: "ai_reports", label: "AI监测报告" }, { key: "appointments", label: "预约" }, { key: "accompany_visits", label: "陪访" }, { key: "today_deals", label: "今日成交" }], columns: [{ title: "部门成员", scopedSlots: { customRender: "member" } }, { title: "有效接通", dataIndex: "effective_calls" }, { title: "有效沟通数", dataIndex: "effective_communications" }, { title: "加V", dataIndex: "wechat_adds" }, { title: "有效对话", dataIndex: "effective_dialogues" }, { title: "有效激活", dataIndex: "effective_activations" }, { title: "日朋友圈数", dataIndex: "daily_moments" }, { title: "AI监测报告", dataIndex: "ai_reports" }, { title: "预约", dataIndex: "appointments" }, { title: "预约进度", dataIndex: "appointment_progress", scopedSlots: { customRender: "progress" } }, { title: "陪访", dataIndex: "accompany_visits" }, { title: "今日成交", dataIndex: "today_deals" }] }; }, created() { this.load(); }, methods: { load() { this.loading = true; BusinessApi.weiwenjiaCrmDashboard({ date: this.date, page: this.pagination.current, pageSize: this.pagination.pageSize }).then(res => { this.summary = res.summary || {}; const page = res.members || {}; this.members = page.data || []; this.pagination.total = page.total || 0; }).finally(() => { this.loading = false; }); }, changePage(page) { this.pagination.current = page.current; this.load(); } } };
</script>

<style lang="less" scoped>
.crm-page .primary-button { border: 0; cursor: pointer; }
.source-tag { display: inline-block; margin-left: 8px; padding: 2px 7px; border-radius: 10px; color: #0a927c; background: #e6f8f4; font-size: 11px; font-weight: 500; }
.crm-page small { color: #8491a7; }
.crm-page .ant-tag { margin-bottom: 3px; }
.metric-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 16px; margin-bottom: 20px; }
.metric-card { min-height: 108px; padding: 20px 22px; background: #fff; border: 1px solid #e4ebf3; border-radius: 14px; box-shadow: 0 8px 24px rgba(20, 44, 78, .04); }
.metric-card span { display: block; color: #75829a; font-size: 14px; }
.metric-card strong { display: block; margin-top: 12px; color: #0d1930; font-size: 30px; }
.crm-page .ant-table-wrapper { overflow-x: auto; }
@media (max-width: 1200px) { .metric-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
</style>
