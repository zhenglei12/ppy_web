<template>
  <div class="business-page finance-page">
    <header class="page-head">
      <div class="page-title"><h1>财务看板</h1><p>围绕订单到账、应收、发票、退款与异常进行跟进。</p></div>
    </header>

    <div class="metric-grid"><metric-card v-for="item in metrics" :key="item.label" v-bind="item" /></div>

    <div class="finance-grid">
      <section class="panel finance-panel">
        <div class="panel-head"><div><h2>财务提醒</h2><p>集中查看当前需要处理的财务事项。</p></div></div>
        <div class="finance-notices">
          <div v-for="order in pendingOrders" :key="`order-${order.id}`" class="finance-notice finance-order-notice">
            <span class="notice-number finance-order-number">审</span>
            <div><strong>订单待财务审核</strong><p>{{ order.order_no }} · {{ order.customer_legal_name || '--' }} · 待收 {{ money(Number(order.payable_amount || 0) - Number(order.paid_amount || 0)) }}</p></div>
            <a class="finance-order-link" @click="goOrder(order)">查看订单 →</a>
          </div>
          <a-empty v-if="!pendingOrders.length" description="暂无待审核订单" />
        </div>
      </section>

      <section class="panel finance-panel">
        <div class="panel-head"><div><h2>收款状态分布</h2><p>按财务确认状态汇总当前收款记录。</p></div></div>
        <div v-if="Object.keys(paymentStatus).length" class="distribution-list">
          <div class="progress-row" v-for="(value,key) in paymentStatus" :key="key"><strong>{{ paymentMap[key] || key }}</strong><div class="progress-track"><i :style="{width:percent(value, paymentTotal)+'%'}"></i></div><span>{{ value }} 笔</span></div>
        </div>
        <a-empty v-else description="暂无收款数据" />
      </section>
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
      metrics: [], notices: [], pendingOrders: [], paymentStatus: {},
      paymentMap: { confirmed: "已确认", pending: "待确认", rejected: "已驳回", abnormal: "异常" },
    };
  },
  computed: {
    paymentTotal() { return Object.values(this.paymentStatus).reduce((total, value) => total + Number(value || 0), 0); },
  },
  created() { this.load(); },
  methods: {
    money(value) { return `¥${Number(value || 0).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; },
    percent(value, total) { return total ? Math.min(100, Math.round(Number(value) * 100 / total)) : 0; },
    load() {
      BusinessApi.financeDashboard().then(data => {
        this.metrics = [
          { icon: "file-text", tone: "blue", label: "合同金额", value: this.money(data.contract_amount), compare: "当前可见范围" },
          { icon: "clock-circle", tone: "orange", label: "待确认金额", value: this.money(data.pending_amount), compare: `${data.pending_count || 0} 笔待审核` },
          { icon: "pie-chart", tone: "orange", label: "待收金额", value: this.money(data.receivable_amount), compare: `${data.receivable_count || 0} 笔` },
          { icon: "database", tone: "green", label: "已收金额", value: this.money(data.confirmed_amount), compare: `${data.confirmed_count || 0} 笔` },
        ];
        this.paymentStatus = data.payment_status_distribution || {};
        this.pendingOrders = data.pending_review_orders || [];
      });
    },
    goOrder(order) { this.$router.push({ path: "/order", query: { order_id: order.id } }); },
  },
};
</script>

<style lang="less" scoped>
.finance-page {
  .finance-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; margin-bottom: 18px; }
  .finance-panel { min-width: 0; }
  .finance-notices { display: grid; gap: 10px; }
  .finance-notice { min-width: 0; display: grid; grid-template-columns: 38px minmax(0, 1fr); align-items: center; gap: 14px; padding: 15px 16px; border: 1px solid #e9eef2; border-radius: 9px; background: #fafcfd; }
  .notice-number { width: 32px; height: 32px; display: grid; place-items: center; border-radius: 50%; color: #fff; background: #08a88d; font-weight: 600; }
  .notice-number.tone-1 { background: #f3a126; }
  .notice-number.tone-2 { background: #4c82df; }
  .finance-notice strong { color: #172744; font-size: 15px; }
  .finance-notice p { margin: 4px 0 0; color: #71809a; line-height: 1.55; }
  .finance-order-notice { grid-template-columns: 38px minmax(0, 1fr) auto; }
  .finance-order-number { background: #4c82df; font-size: 13px; }
  .finance-order-link { color: #009b81; white-space: nowrap; cursor: pointer; font-size: 13px; font-weight: 600; }
  .distribution-list { padding-top: 5px; }
  .aging-panel { margin-bottom: 0; }
  .aging-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
  .aging-item { padding: 18px; border: 1px solid #e7edf2; border-radius: 10px; background: #fafcfd; }
  .aging-copy { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
  .aging-copy span { color: #687791; }
  .aging-copy strong { color: #14233f; font-size: 18px; white-space: nowrap; }
}
@media (max-width: 1100px) { .finance-page .finance-grid,.finance-page .aging-grid { grid-template-columns: 1fr; } }
</style>
