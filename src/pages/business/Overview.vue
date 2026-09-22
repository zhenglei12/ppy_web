<template><div class="business-page overview-page"><header class="page-head"><div class="page-title"><h1>经营总览</h1><p>以人员、客户与订单数据快速了解总部经营情况。</p></div><span class="page-index">01 / 08</span></header><div class="overview-summary-grid"><section class="panel overview-card"><div class="overview-card-head"><span class="overview-card-icon green"><a-icon type="team" /></span><h2>人员主数据</h2></div><div class="overview-visual"><div class="overview-donut green-donut"><strong>{{people.active_count || 0}}</strong><span>在职人数</span></div><div class="overview-legend"><div><i class="dot green"></i><span>在职人数</span><b>{{people.active_count || 0}} 人</b></div><div><i class="dot blue"></i><span>本月入职</span><b>{{people.month_hire_count || 0}} 人</b></div><div><i class="dot orange"></i><span>试用期人员</span><b>{{people.probation_count || 0}} 人</b></div></div></div><p class="overview-note">员工、部门、岗位与权限统一维护</p></section><section class="panel overview-card"><div class="overview-card-head"><span class="overview-card-icon blue"><a-icon type="file-done" /></span><h2>客户与订单</h2></div><div class="overview-visual"><div class="overview-donut blue-donut"><strong>{{orders.count || 0}}</strong><span>有效订单</span></div><div class="overview-legend"><div><i class="dot blue"></i><span>有效订单</span><b>{{orders.count || 0}} 单</b></div><div><i class="dot green"></i><span>新增客户</span><b>{{metrics.new_customer_count || 0}} 家</b></div><div><i class="dot orange"></i><span>合同金额</span><b>{{money(orders.payable_amount)}}</b></div><div><i class="dot purple"></i><span>待收金额</span><b>{{money(orders.receivable_amount)}}</b></div></div></div><p class="overview-note">客户主体、合同金额与收款状态统一维护</p></section></div></div></template>
<script>
import OverviewApi from "../../apis/overview";

export default {
  data() {
    return { flow: [], metrics: {}, people: {}, orders: {}, finance: {}, delivery: {}, summaryMetrics: [] };
  },
  created() {
    OverviewApi.dashboard().then(d => {
      this.flow = d.flow || [];
      this.metrics = d.metrics || {};
      this.people = d.people || {};
      this.orders = d.orders || {};
      this.finance = d.finance || {};
      this.delivery = d.delivery || {};
      this.summaryMetrics = [
        { icon: "team", tone: "green", label: "在职人数", value: `${this.people.active_count || 0} 人`, compare: `本月入职 ${this.people.month_hire_count || 0} 人` },
        { icon: "file-done", tone: "blue", label: "有效订单", value: `${this.orders.count || 0} 单`, compare: `新增客户 ${this.metrics.new_customer_count || 0} 家` },
        { icon: "pay-circle", tone: "green", label: "确认回款", value: this.money(this.metrics.confirmed_amount), compare: "本月经营结果" },
        { icon: "warning", tone: "orange", label: "经营风险", value: `${this.metrics.renewal_risk_count || 0} 项`, compare: `逾期应收 ${this.money(this.finance.overdue_amount)}` },
      ];
    });
  },
  methods: {
    money(v) { return "¥" + Number(v || 0).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); },
  },
};
</script>
