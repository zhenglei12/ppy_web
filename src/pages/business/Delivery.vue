<template>
  <div class="business-page">
    <header class="page-head">
      <div class="page-title"><h1>优化师看板</h1><p>按项目节点、任务进度和风险状态推进交付。</p></div>
    </header>
    <div class="metric-grid"><metric-card v-for="m in metrics" :key="m.label" v-bind="m" /></div>
    <div class="content-grid">
      <section class="panel">
        <div class="panel-head"><h2>项目交付列表</h2></div>
        <table class="data-table">
          <thead><tr><th>项目</th><th>客户</th><th>当前节点</th><th>任务数</th><th>里程碑</th></tr></thead>
          <tbody>
            <tr v-for="p in projects" :key="p.id"><td><strong>{{ p.project_no }}</strong></td><td>{{ p.order && p.order.customer ? (p.order.customer.brand_name || p.order.customer.legal_name) : '--' }}</td><td>{{ p.current_node || '--' }}</td><td>{{ p.tasks_count || 0 }}</td><td>{{ p.milestones_count || 0 }}</td></tr>
            <tr v-if="!projects.length"><td colspan="5" class="empty-cell">暂无项目</td></tr>
          </tbody>
        </table>
      </section>
      <section class="panel">
        <div class="panel-head"><div><h2>项目风险分布</h2><p>当前可见项目的健康状态。</p></div></div>
        <div class="progress-row" v-for="(value,key) in risk" :key="key"><strong>{{ riskMap[key] || key }}</strong><div class="progress-track"><i :style="{width:percent(value, projectCount)+'%'}"></i></div><span>{{ value }} 项</span></div>
      </section>
    </div>
    <section v-if="!isOptimizer && pendingOrders.length" class="panel pending-orders-panel">
      <div class="panel-head"><div><h2>待推进订单</h2><p>技术总监需要分配优化师的订单。</p></div></div>
      <div class="delivery-pending-list"><div v-for="order in pendingOrders" :key="order.id" class="delivery-pending-item"><div><strong>{{ order.order_no }}</strong><span>{{ order.customer_legal_name || '--' }} · {{ order.customer_industry || '未填写行业' }}</span></div><a @click="goOrder(order)">查看订单 →</a></div></div>
    </section>
  </div>
</template>

<script>
import BusinessApi from "../../apis/business";
import MetricCard from "../../components/business/MetricCard.vue";

export default {
  components: { MetricCard },
  data() {
    return {
      metrics: [], projects: [], risk: {}, pendingOrders: [], projectCount: 0,
      riskMap: { green: "健康", yellow: "预警", red: "风险" },
    };
  },
  computed: { isOptimizer() { const user = this.$auth.user(); return !!(user && user.roles && user.roles.some(role => role.alias === "optimizer")); } },
  created() { this.load(); },
  methods: {
    percent(value, total) { return total ? Math.min(100, Math.round(Number(value) * 100 / total)) : 0; },
    load() {
      Promise.all([BusinessApi.deliveryDashboard(), BusinessApi.deliveryProjects({ pageSize: 10 })]).then(([data, projects]) => {
        this.projectCount = Number(data.active_project_count || 0) + Number(data.completed_project_count || 0);
        this.risk = data.risk_distribution || {};
        this.pendingOrders = data.pending_orders || [];
        this.projects = projects.list || [];
        this.metrics = [
          { icon: "file-text", tone: "green", label: "待技术分单", value: `${data.pending_assign_count || 0} 单`, compare: "待处理" },
          { icon: "setting", tone: "blue", label: "服务中项目", value: `${data.active_project_count || 0} 个`, compare: "当前可见范围" },
          { icon: "check-circle", tone: "green", label: "已完成项目", value: `${data.completed_project_count || 0} 个`, compare: "累计" },
          { icon: "file-done", tone: "orange", label: "待推进订单", value: `${data.pending_assign_count || 0} 单`, compare: "需要分配" },
        ];
      });
    },
    goOrder(order) { this.$router.push({ path: "/order", query: { order_id: order.id } }); },
  },
};
</script>

<style lang="less" scoped>
.pending-orders-panel { margin-top: 18px; }
.delivery-pending-list { display: grid; gap: 10px; }
.delivery-pending-item { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 15px 16px; border: 1px solid #e9eef2; border-radius: 9px; background: #fafcfd; }
.delivery-pending-item strong, .delivery-pending-item span { display: block; }
.delivery-pending-item strong { color: #172744; margin-bottom: 4px; }
.delivery-pending-item span { color: #71809a; font-size: 13px; }
.delivery-pending-item a { color: #009b81; white-space: nowrap; cursor: pointer; font-size: 13px; font-weight: 600; }
</style>
