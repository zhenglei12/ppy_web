<template>
  <div class="business-page sales-dashboard-page">
    <header class="page-head">
      <div class="page-title"><h1>销售看板</h1><p>聚焦客户、订单、回款和销售团队推进情况。</p></div>
    </header>

    <div class="metric-grid"><metric-card v-for="item in metrics" :key="item.label" v-bind="item" /></div>

    <div class="content-grid sales-main-grid">
      <section class="panel">
        <div class="panel-head"><div><h2>销售人员排行</h2><p>按订单数量排序，金额为应付金额。</p></div><a class="link-action" @click="$router.push('/order')">查看订单 →</a></div>
        <div class="ranking-scroll">
          <table class="data-table">
            <thead><tr><th>销售</th><th>订单数</th><th>应付金额</th></tr></thead>
            <tbody>
              <tr v-for="item in ranking" :key="item.sales_user_id"><td><strong>{{ item.sales_user ? item.sales_user.name : '--' }}</strong></td><td>{{ item.order_count }} 单</td><td>{{ money(item.payable_amount) }}</td></tr>
              <tr v-if="!ranking.length"><td colspan="3" class="empty-cell">暂无数据</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="panel pending-panel">
        <div class="panel-head"><div><h2>待推进订单</h2><p>草稿和销售主管审核阶段的订单。</p></div></div>
        <div class="notice-list pending-list">
          <div class="notice-item pending-item" :class="{'needs-review':item.current_stage === 'sales_review'}" v-for="item in pendingOrders" :key="item.id">
            <div class="notice-copy">
              <strong>{{ customerName(item) }}</strong>
              <span>{{ productTypeMap[item.product_type] || item.product_type || '其他服务' }} · <em class="pending-stage">{{ stageMap[item.current_stage] || item.current_stage }}</em></span>
            </div>
            <div class="pending-actions"><span class="notice-time">{{ item.sales_user ? item.sales_user.name : '--' }}</span><a @click="goOrder(item)">查看订单 →</a></div>
          </div>
          <div v-if="!pendingOrders.length" class="empty-cell">暂无待推进订单</div>
        </div>
      </section>
    </div>

    <div class="content-grid equal">
      <section class="panel"><div class="panel-head"><h2>订单阶段分布</h2></div><div class="progress-row" v-for="(value,key) in stageDistribution" :key="key"><strong>{{ stageMap[key] || key }}</strong><div class="progress-track"><i :style="{width:percent(value, orderCount)+'%'}"></i></div><span>{{ value }} 单</span></div></section>
      <section class="panel"><div class="panel-head"><h2>订单健康度</h2></div><div class="progress-row" v-for="(value,key) in healthDistribution" :key="key"><strong>{{ healthMap[key] || key }}</strong><div class="progress-track"><i :style="{width:percent(value, orderCount)+'%'}"></i></div><span>{{ value }} 单</span></div></section>
    </div>
  </div>
</template>

<script>
import BusinessApi from "../../apis/business";
import MetricCard from "../../components/business/MetricCard.vue";

export default {
  components: { MetricCard },
  data() {
    return {
      metrics: [], ranking: [], pendingOrders: [], stageDistribution: {}, healthDistribution: {}, orderCount: 0,
      stageMap: { draft: "草稿", sales_review: "销售主管审核", finance_confirm: "财务确认", tech_assign: "技术分单", service: "服务中", renewal: "续费跟进", completed: "已完成", cancelled: "已取消" },
      healthMap: { green: "正常", yellow: "关注", red: "风险" },
      productTypeMap: { trial: "体验版", annual: "年度服务", other: "其他服务" },
    };
  },
  created() { this.load(); },
  methods: {
    money(value) { return `¥${Number(value || 0).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; },
    percent(value, total) { return total ? Math.min(100, Math.round(Number(value) * 100 / total)) : 0; },
    customerName(item) { return item.customer_legal_name || (item.customer && (item.customer.brand_name || item.customer.legal_name)) || "--"; },
    goOrder(item) { this.$router.push({ path: "/order", query: { order_id: item.id } }); },
    load() {
      BusinessApi.salesDashboard().then(data => {
        this.orderCount = Number(data.order_count || 0);
        this.ranking = data.ranking || [];
        this.pendingOrders = data.pending_orders || [];
        this.stageDistribution = data.stage_distribution || {};
        this.healthDistribution = data.health_distribution || {};
        this.metrics = [
          { icon: "file-done", tone: "green", label: "订单总数", value: `${data.order_count || 0} 单`, compare: "当前可见范围" },
          { icon: "calendar", tone: "blue", label: "本月新增订单", value: `${data.month_order_count || 0} 单`, compare: "本月" },
          { icon: "pay-circle", tone: "green", label: "应付金额", value: this.money(data.payable_amount), compare: "当前可见范围" },
          { icon: "clock-circle", tone: "orange", label: "待推进订单", value: `${data.pending_review_count || 0} 单`, compare: `超期 ${data.stalled_count || 0} 单` },
        ];
      });
    },
  },
};
</script>

<style lang="less" scoped>
.sales-dashboard-page {
  .sales-main-grid { grid-template-columns: minmax(0, 1.7fr) minmax(360px, 1fr); }
  .pending-panel { min-width: 0; }
  .ranking-scroll { max-height: 285px; overflow-y: auto; }
  .ranking-scroll .data-table thead th { position: sticky; z-index: 1; top: 0; }
  .pending-list { max-height: 365px; overflow-x: hidden; overflow-y: auto; }
  .pending-item { grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 18px; }
  .pending-item .notice-copy { min-width: 0; }
  .pending-item .notice-copy strong,
  .pending-item .notice-copy span { overflow: hidden; display: block; white-space: nowrap; text-overflow: ellipsis; }
  .pending-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 7px; white-space: nowrap; }
  .pending-actions a { color: #009b81; font-size: 13px; }
  .pending-item.needs-review { margin: 0 -10px; padding-right: 10px; padding-left: 10px; border-left: 3px solid #ed4d4d; border-radius: 6px; background: #fff7f7; }
  .pending-item.needs-review .notice-copy strong,
  .pending-item.needs-review .pending-stage { color: #e43d43; }
  .pending-stage { font-style: normal; }
}
@media (max-width: 1200px) { .sales-dashboard-page .sales-main-grid { grid-template-columns: 1fr; } }
</style>
