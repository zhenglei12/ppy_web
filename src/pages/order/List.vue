<template>
  <div class="business-page management-page order-page">
    <header class="page-head">
      <div class="page-title">
        <h1>订单管理</h1>
        <p>统一管理客户订单、销售主管审核、财务确认、技术分单与服务交付。</p>
      </div>
      <button v-acl="'sales.order.create'" class="primary-button" @click="openEdit()"><a-icon type="plus" />新增订单</button>
    </header>

    <div class="metric-grid">
      <metric-card icon="pay-circle" tone="blue" label="合同总额" :value="money(summary.contract)" compare="当前页" />
      <metric-card icon="check-circle" tone="green" label="已收金额" :value="money(summary.paid)" compare="当前页" />
      <metric-card icon="wallet" tone="blue" label="尾款金额" :value="money(summary.finalPayment)" compare="当前页" />
      <metric-card icon="alert" tone="orange" label="待收金额" :value="money(summary.receivable)" compare="当前页" />
    </div>

    <section class="panel management-panel">
      <div class="panel-head management-panel-head">
        <div><h2>订单列表 <span class="order-list-count">{{ orders.total }} 单</span></h2><p>列表范围由部门、上下级关系和角色权限自动确定。</p></div>
        <a-form-model layout="inline" class="order-search">
          <a-form-model-item><a-input v-model="filters.keyword" allowClear placeholder="订单号 / 客户 / 产品" @pressEnter="loadOrders(1)" /></a-form-model-item>
          <a-form-model-item><a-select v-model="filters.current_stage" allowClear placeholder="当前阶段"><a-select-option v-for="(label,key) in stageMap" :key="key" :value="key">{{ label }}</a-select-option></a-select></a-form-model-item>
          <a-form-model-item><a-select v-model="filters.health_status" allowClear placeholder="健康度"><a-select-option value="green">正常</a-select-option><a-select-option value="yellow">关注</a-select-option><a-select-option value="red">风险</a-select-option></a-select></a-form-model-item>
          <a-form-model-item><a-select v-model="filters.business_status" allowClear placeholder="业务状态"><a-select-option value="active">服务中</a-select-option><a-select-option value="completed">已完成</a-select-option><a-select-option value="cancelled">已取消</a-select-option></a-select></a-form-model-item>
          <a-form-model-item><a-range-picker v-model="createdRange" valueFormat="YYYY-MM-DD" @change="createdRangeChanged" /></a-form-model-item>
          <a-form-model-item><a-button type="primary" @click="loadOrders(1)"><a-icon type="search" />搜索</a-button></a-form-model-item>
          <a-form-model-item><a-button @click="resetSearch">重置</a-button></a-form-model-item>
        </a-form-model>
      </div>

      <a-table :columns="columns" :data-source="orders.list" :loading="orders.loading" rowKey="id" :scroll="{ x: 1460 }"
        :pagination="{ total: orders.total, current: orders.page, pageSize: orders.pageSize, showSizeChanger: true, showTotal: total => `共 ${total} 条` }" @change="tableChange">
        <template slot="customerShortName" slot-scope="row">{{ customerShortName(row) }}</template>
        <template slot="industry" slot-scope="value">{{ value || '--' }}</template>
        <template slot="legalName" slot-scope="value">{{ value || "--" }}</template>
        <template slot="creditCode" slot-scope="value">{{ value || "--" }}</template>
        <template slot="paymentVoucher" slot-scope="files">
          <div v-if="files && files.length" class="voucher-cell">
            <a :href="files[0]" target="_blank" rel="noopener noreferrer">
              <img v-if="isImageUrl(files[0])" :src="files[0]" alt="付款凭证" />
              <span v-else><a-icon type="file" /></span>
            </a>
            <small v-if="files.length > 1">共 {{ files.length }} 个</small>
          </div>
          <span v-else>--</span>
        </template>
        <template slot="productType" slot-scope="value">{{ productTypeMap[value] || value || '--' }}</template>
        <template slot="amount" slot-scope="value"><strong>{{ money(value) }}</strong></template>
        <template slot="stage" slot-scope="value"><span class="order-status" :class="value">{{ stageMap[value] || value }}</span></template>
        <template slot="health" slot-scope="value"><span class="health-tag" :class="value"><i />{{ healthMap[value] || value }}</span></template>
        <template slot="optimizer" slot-scope="row">{{ row.optimizer ? row.optimizer.name : "--" }}</template>
        <template slot="currentServiceStatus" slot-scope="value">{{ currentServiceStatus(value) }}</template>
        <template slot="operate" slot-scope="row">
          <div class="row-actions">
            <a @click="openDetail(row)">详情</a>
            <a v-if="hasAction(row,'update')" @click="openEdit(row)">编辑</a>
            <a v-if="hasAction(row,'assign')" v-acl="'sales.order.assign'" @click="openAssign(row)">分配</a>
            <a v-if="hasAction(row,'change_status')" v-acl="'sales.order.status'" @click="openStatus(row)">修改状态</a>
            <a v-acl="'sales.order.health_status'" @click="openHealthStatus(row)">健康状态</a>
            <a v-if="hasAction(row,'refund')" v-acl="'sales.order.refund'" @click="openRefund(row)">退款</a>
            <a v-acl="'sales.order.final_payment'" @click="openFinalPayment(row)">添加尾款</a>
            <a v-acl="'delivery.optimization_report.save'" @click="openReport(row)">填入报告</a>
            <a v-acl="'delivery.optimization_report.list'" @click="openReportList(row)">报告列表</a>
            <a v-for="action in transitionActions(row)" :key="action.key" @click="handleTransition(row, action)">{{ action.label }}</a>
            <a-popconfirm v-if="hasAction(row,'delete')" title="确认删除该草稿订单？" @confirm="removeOrder(row)"><a class="danger-link">删除</a></a-popconfirm>
          </div>
        </template>
      </a-table>
    </section>

    <a-modal v-model="editVisible" :title="editForm.id ? '编辑订单' : '新增订单'" width="960px" wrapClassName="business-edit-modal order-edit-modal" :confirmLoading="saving" :maskClosable="false" @ok="saveOrder">
      <a-form-model :model="editForm" :class="{'finance-paid-only': financePaidOnly}" :label-col="{span:7}" :wrapper-col="{span:16}">
        <div class="form-section-title">客户基本信息</div>
        <a-row :gutter="20">
          <a-col :span="12"><a-form-model-item label="客户主体" required><a-input v-model="editForm.customer_name" placeholder="请输入客户主体全称" /></a-form-model-item></a-col>
          <a-col :span="12"><a-form-model-item label="联系人" required><a-input v-model="editForm.contact_name" placeholder="请输入联系人姓名" /></a-form-model-item></a-col>
          <a-col :span="12"><a-form-model-item label="主体全称" required><a-input v-model="editForm.customer_legal_name" placeholder="请输入客户主体全称" /></a-form-model-item></a-col>
          <a-col :span="12"><a-form-model-item label="统一社会信用代码"><a-input v-model="editForm.customer_credit_code" placeholder="请输入统一社会信用代码" /></a-form-model-item></a-col>
          <a-col :span="12"><a-form-model-item label="手机号"><a-input v-model="editForm.customer_mobile" placeholder="请输入客户手机号" /></a-form-model-item></a-col>
          <a-col :span="12"><a-form-model-item label="微信"><a-input v-model="editForm.customer_wechat" placeholder="请输入客户微信号" /></a-form-model-item></a-col>
          <a-col :span="12"><a-form-model-item label="行业"><a-input v-model="editForm.customer_industry" placeholder="请输入所属行业" /></a-form-model-item></a-col>
        </a-row>

        <div class="form-section-title">合同与收款</div>
        <a-row :gutter="20">
          <a-col :span="12"><a-form-model-item label="产品类型" required><a-select v-model="editForm.product_type"><a-select-option v-for="(label,key) in productTypeMap" :key="key" :value="key">{{ label }}</a-select-option></a-select></a-form-model-item></a-col>
          <a-col :span="12"><a-form-model-item label="合同编号"><a-input v-model="editForm.contract_no" placeholder="请输入合同编号" /></a-form-model-item></a-col>
          <a-col :span="12"><a-form-model-item label="合同金额" required><a-input-number v-model="editForm.contract_amount" :min="0" :precision="2" /></a-form-model-item></a-col>
          <a-col :span="12"><a-form-model-item class="paid-amount-field" label="到账金额"><a-input-number v-model="editForm.paid_amount" :min="0" :precision="2" :disabled="!canEditPaidAmount" placeholder="财务已确认到账金额" /></a-form-model-item></a-col>
          <a-col :span="12"><a-form-model-item label="付款方式"><a-select v-model="editForm.payment_method" allowClear><a-select-option value="bank">银行转账</a-select-option><a-select-option value="wechat">微信</a-select-option><a-select-option value="alipay">支付宝</a-select-option><a-select-option value="cash">现金</a-select-option><a-select-option value="other">其他</a-select-option></a-select></a-form-model-item></a-col>
          <a-col :span="12"><a-form-model-item label="付款日期"><a-date-picker v-model="editForm.payment_due_date" valueFormat="YYYY-MM-DD" /></a-form-model-item></a-col>
          <a-col :span="12"><a-form-model-item label="付款主体"><a-input v-model="editForm.payment_subject" /></a-form-model-item></a-col>
          <a-col :span="12"><a-form-model-item label="公司账户"><a-input v-model="editForm.company_account" /></a-form-model-item></a-col>
          <a-col :span="12"><a-form-model-item label="是否开票"><a-switch v-model="editForm.invoice_required" /></a-form-model-item></a-col>
          <template v-if="editForm.invoice_required">
            <a-col :span="12"><a-form-model-item label="发票类型"><a-select v-model="editForm.invoice_type"><a-select-option value="normal">普通发票</a-select-option><a-select-option value="special">增值税专票</a-select-option><a-select-option value="electronic">电子发票</a-select-option></a-select></a-form-model-item></a-col>
            <a-col :span="12"><a-form-model-item label="发票抬头"><a-input v-model="editForm.invoice_title" /></a-form-model-item></a-col>
            <a-col :span="12"><a-form-model-item label="税号"><a-input v-model="editForm.invoice_tax_no" /></a-form-model-item></a-col>
          </template>
        </a-row>

        <div class="form-section-title">服务启动信息</div>
        <a-row :gutter="20">
          <a-col :span="12"><a-form-model-item label="启动日"><a-date-picker v-model="editForm.actual_start_date" valueFormat="YYYY-MM-DD" /></a-form-model-item></a-col>
          <a-col :span="12"><a-form-model-item label="服务周期"><a-input-number v-model="editForm.service_cycle_days" :min="1" :precision="0" addon-after="天" /></a-form-model-item></a-col>
          <a-col :span="12"><a-form-model-item label="客户负责人"><a-input v-model="editForm.customer_owner_name" /></a-form-model-item></a-col>
          <a-col :span="12"><a-form-model-item label="目标区域"><a-input v-model="editForm.target_region" /></a-form-model-item></a-col>
          <a-col :span="12"><a-form-model-item label="截止时间"><a-date-picker v-model="editForm.expected_end_date" valueFormat="YYYY-MM-DD" /></a-form-model-item></a-col>
        </a-row>
        <a-form-model-item label="主推业务" :label-col="{span:3}" :wrapper-col="{span:20}"><a-input v-model="editForm.primary_business" /></a-form-model-item>

        <div class="form-section-title">承诺与风险</div>
        <a-form-model-item label="销售承诺" :label-col="{span:3}" :wrapper-col="{span:20}"><a-textarea v-model="editForm.sales_commitment" :rows="2" /></a-form-model-item>
        <a-row :gutter="20">
          <a-col :span="12"><a-form-model-item label="企业目标提及率"><a-input-number v-model="editForm.enterprise_target_mention_rate" :min="0" :max="100" :precision="2" addon-after="%" placeholder="请输入0-100" /></a-form-model-item></a-col>
        </a-row>
        <div class="check-grid">
          <a-checkbox v-model="editForm.ranking_commitment">存在排名承诺</a-checkbox><a-checkbox v-model="editForm.acquisition_commitment">存在获客/成交承诺</a-checkbox>
          <a-checkbox v-model="editForm.case_authorized">案例展示已授权</a-checkbox><a-checkbox v-model="editForm.logo_authorized">Logo使用已授权</a-checkbox><a-checkbox v-model="editForm.portrait_authorized">肖像使用已授权</a-checkbox>
        </div>
        <a-row :gutter="20"><a-col :span="12"><a-form-model-item label="资质状态"><a-select v-model="editForm.qualification_status"><a-select-option value="pending">待核验</a-select-option><a-select-option value="verified">已核验</a-select-option><a-select-option value="missing">资料缺失</a-select-option></a-select></a-form-model-item></a-col></a-row>
        <a-row :gutter="20"><a-col :span="12"><a-form-model-item label="客诉历史"><a-textarea v-model="editForm.complaint_history" :rows="2" /></a-form-model-item></a-col></a-row>

        <div class="form-section-title">附件</div>
        <div class="attachment-grid">
          <div v-for="item in attachmentTypes" :key="item.key" class="attachment-item">
            <b>{{ item.label }}<em v-if="item.required">必传</em></b>
            <a-upload multiple :file-list="attachmentLists[item.key]" :customRequest="e => addAttachment(item.key,e)" :remove="file => removeAttachment(item.key,file)">
              <a-button><a-icon type="upload" />上传文件</a-button>
            </a-upload>
            <small>{{ item.tip }}</small>
          </div>
        </div>
      </a-form-model>
    </a-modal>

    <a-drawer :visible="detailVisible" title="订单详情" width="760" @close="detailVisible=false">
      <template v-if="detail">
        <div class="detail-summary">
          <div><span>订单编号</span><b>{{ detail.order_no }}</b></div><div><span>当前阶段</span><b><i class="order-status" :class="detail.current_stage">{{ stageMap[detail.current_stage] }}</i></b></div>
          <div><span>应付金额</span><b>{{ money(detail.payable_amount) }}</b></div><div><span>确认金额</span><b>{{ money(detail.paid_amount) }}</b></div>
          <div><span>尾款金额</span><b>{{ money(detail.final_payment_amount) }}</b></div><div><span>退款金额</span><b>{{ money(detail.refund_amount) }}</b></div>
          <div><span>待收金额</span><b>{{ money(detailReceivable(detail)) }}</b></div>
        </div>
        <a-descriptions bordered :column="2" size="small">
          <a-descriptions-item label="客户">{{ customerName(detail) }}</a-descriptions-item><a-descriptions-item label="联系人">{{ detail.contact ? `${detail.contact.contact_name} ${detail.contact.mobile || ''}` : (detail.contact_name || '--') }}</a-descriptions-item>
          <a-descriptions-item label="主体全称">{{ detail.customer_legal_name || '--' }}</a-descriptions-item><a-descriptions-item label="统一社会信用代码">{{ detail.customer_credit_code || '--' }}</a-descriptions-item>
          <a-descriptions-item label="客户手机号">{{ detail.customer_mobile || (detail.contact && detail.contact.mobile) || '--' }}</a-descriptions-item><a-descriptions-item label="客户微信">{{ detail.customer_wechat || '--' }}</a-descriptions-item>
          <a-descriptions-item label="行业">{{ detail.customer_industry || '--' }}</a-descriptions-item><a-descriptions-item label="合同金额">{{ money(detail.contract_amount) }}</a-descriptions-item>
          <a-descriptions-item label="销售">{{ detail.sales_user ? detail.sales_user.name : '--' }}</a-descriptions-item><a-descriptions-item label="当前负责人">{{ detail.owner ? detail.owner.name : '--' }}</a-descriptions-item>
          <a-descriptions-item label="优化师">{{ detail.optimizer ? detail.optimizer.name : '--' }}</a-descriptions-item><a-descriptions-item label="产品类型">{{ productTypeMap[detail.product_type] || detail.product_type || '--' }}</a-descriptions-item>
          <a-descriptions-item label="截止时间">{{ detail.next_action_at || '--' }}</a-descriptions-item>
          <a-descriptions-item label="企业目标提及率">{{ rate(detail.enterprise_target_mention_rate) }}</a-descriptions-item>
          <a-descriptions-item label="客诉历史" :span="2">{{ detail.complaint_history || '--' }}</a-descriptions-item>
          <a-descriptions-item label="退款原因" :span="2">{{ detail.refund_reason || '--' }}</a-descriptions-item>
        </a-descriptions>
        <h3 class="drawer-title">订单附件</h3>
        <div v-if="detailAttachments.length" class="detail-attachments">
          <section v-for="group in detailAttachments" :key="group.key" class="detail-attachment-group">
            <h4>{{ group.label }}</h4>
            <div class="detail-file-list">
              <a v-for="(url,index) in group.files" :key="url + index" :href="url" target="_blank" rel="noopener noreferrer" class="detail-file">
                <img v-if="isImageUrl(url)" :src="url" :alt="group.label" />
                <span v-else><a-icon type="file" /><small>{{ fileName(url) }}</small></span>
              </a>
            </div>
          </section>
        </div>
        <a-empty v-else description="暂无附件" />
        <h3 class="drawer-title">流程记录</h3>
        <a-timeline><a-timeline-item v-for="log in detail.stage_logs || []" :key="log.id" color="green"><b>{{ stageMap[log.to_stage] || log.to_stage }}</b><p>{{ log.operated_at }} {{ log.evidence_note || '' }}</p></a-timeline-item></a-timeline>
      </template>
    </a-drawer>

    <a-modal v-model="assignVisible" title="分配优化师" width="520px" wrapClassName="business-edit-modal" :confirmLoading="saving" @ok="saveAssign">
      <a-form-model layout="vertical">
        <a-form-model-item label="优化师" required><user-select v-model="assignForm.optimizer_id" :users="optimizerUsers" /></a-form-model-item>
      </a-form-model>
    </a-modal>

    <a-modal v-model="financeVisible" title="财务确认" width="520px" wrapClassName="business-edit-modal" :confirmLoading="saving" :maskClosable="false" @ok="saveFinanceConfirm">
      <a-form-model layout="vertical">
        <a-form-model-item label="财务已确认到账金额" required>
          <a-input-number v-model="financeForm.paid_amount" :min="0" :max="financeForm.payable_amount" :precision="2" style="width:100%" placeholder="请输入实际到账金额" />
        </a-form-model-item>
        <div class="finance-confirm-tip">应付金额：{{ money(financeForm.payable_amount) }}，确认后订单进入技术分单阶段。</div>
      </a-form-model>
    </a-modal>

    <a-modal v-model="statusVisible" title="修改订单状态" width="520px" wrapClassName="business-edit-modal" :confirmLoading="saving" @ok="saveStatus">
      <a-form-model layout="vertical">
        <a-form-model-item label="订单状态" required>
          <a-select v-model="statusForm.status" placeholder="请选择订单状态">
            <a-select-option value="renewal">续费中</a-select-option>
            <a-select-option v-if="statusForm.current_stage !== 'completed'" value="completed">已完成</a-select-option>
            <a-select-option value="cancelled">已取消</a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item label="操作说明"><a-textarea v-model="statusForm.remark" :rows="3" placeholder="可填写状态变更说明" /></a-form-model-item>
      </a-form-model>
    </a-modal>

    <a-modal v-model="healthStatusVisible" title="修改健康状态" width="520px" wrapClassName="business-edit-modal" :confirmLoading="saving" @ok="saveHealthStatus">
      <a-form-model layout="vertical">
        <a-form-model-item label="健康状态" required>
          <a-select v-model="healthStatusForm.health_status" placeholder="请选择健康状态">
            <a-select-option value="green">正常</a-select-option>
            <a-select-option value="yellow">预警</a-select-option>
            <a-select-option value="red">风险</a-select-option>
          </a-select>
        </a-form-model-item>
      </a-form-model>
    </a-modal>

    <a-modal v-model="refundVisible" title="订单售后退款" width="560px" wrapClassName="business-edit-modal" :confirmLoading="saving" :maskClosable="false" @ok="saveRefund">
      <a-form-model layout="vertical">
        <a-form-model-item label="退款金额" required><a-input-number v-model="refundForm.refund_amount" :min="0.01" :precision="2" style="width:100%" /></a-form-model-item>
        <a-form-model-item label="退款原因" required><a-textarea v-model="refundForm.refund_reason" :rows="4" placeholder="请填写售后退款原因" /></a-form-model-item>
        <a-form-model-item label="退款截图" required>
          <a-upload multiple accept="image/*" :file-list="refundFiles" :customRequest="addRefundFile" :remove="removeRefundFile">
            <a-button><a-icon type="upload" />上传退款截图</a-button>
          </a-upload>
        </a-form-model-item>
      </a-form-model>
    </a-modal>

    <a-modal v-model="finalPaymentVisible" title="添加订单尾款" width="560px" wrapClassName="business-edit-modal" :confirmLoading="saving" :maskClosable="false" @ok="saveFinalPayment">
      <a-form-model layout="vertical">
        <a-form-model-item label="尾款金额" required><a-input-number v-model="finalPaymentForm.final_payment_amount" :min="0.01" :precision="2" style="width:100%" placeholder="请输入尾款金额" /></a-form-model-item>
        <a-form-model-item label="尾款截图" required>
          <a-upload accept="image/*" :file-list="finalPaymentFiles" :customRequest="addFinalPaymentFile" :remove="removeFinalPaymentFile">
            <a-button><a-icon type="upload" />上传尾款截图</a-button>
          </a-upload>
        </a-form-model-item>
      </a-form-model>
    </a-modal>

    <a-modal v-model="reportVisible" :title="reportForm.id ? '编辑优化报告' : '填入优化报告'" width="820px" wrapClassName="business-edit-modal" :confirmLoading="saving" :maskClosable="false" @ok="saveReport">
      <a-form-model :model="reportForm" layout="vertical" class="optimization-report-form">
        <a-row :gutter="20">
          <a-col :span="12"><a-form-model-item label="项目名称" required><a-input v-model="reportForm.project_name" placeholder="请输入项目名称" /></a-form-model-item></a-col>
          <a-col :span="12"><a-form-model-item label="服务周期" required><a-select v-model="reportForm.service_cycle" placeholder="请选择服务周期"><a-select-option value="one_month">一个月服务</a-select-option><a-select-option value="three_months">三个月服务</a-select-option><a-select-option value="annual">年度服务</a-select-option></a-select></a-form-model-item></a-col>
          <a-col :span="12"><a-form-model-item label="当前优化阶段" required><a-select v-model="reportForm.optimization_stage" placeholder="请选择优化阶段"><a-select-option value="first">第一阶段</a-select-option><a-select-option value="second">第二阶段</a-select-option><a-select-option value="third">第三阶段</a-select-option></a-select></a-form-model-item></a-col>
          <a-col :span="12"><a-form-model-item label="目前提及率"><a-input-number v-model="reportForm.current_mention_rate" :min="0" :max="100" :precision="0" addon-after="%" /></a-form-model-item></a-col>
          <a-col :span="12"><a-form-model-item label="半月数据汇报时间"><a-date-picker v-model="reportForm.semi_monthly_report_at" showTime valueFormat="YYYY-MM-DD HH:mm:ss" /></a-form-model-item></a-col>
          <a-col :span="12"><a-form-model-item label="数据报告时间"><a-date-picker v-model="reportForm.data_report_at" showTime valueFormat="YYYY-MM-DD HH:mm:ss" /></a-form-model-item></a-col>
          <a-col :span="12"><a-form-model-item label="发文人（优化师）" required><user-select v-model="reportForm.publisher_user_id" :users="reportPublisherUsers" :disabled="isOptimizerRole" /></a-form-model-item></a-col>
        </a-row>
        <a-form-model-item label="核心工作内容"><a-textarea v-model="reportForm.core_work_content" :rows="3" placeholder="请输入核心工作内容" /></a-form-model-item>
        <a-form-model-item label="优化难点及解决办法"><a-textarea v-model="reportForm.optimization_difficulties_and_solutions" :rows="4" placeholder="请输入目前优化难点及解决办法" /></a-form-model-item>
      </a-form-model>
    </a-modal>

    <a-modal v-model="reportListVisible" :title="`${reportOrderName} · 报告列表`" width="1100px" wrapClassName="business-edit-modal report-list-modal" :footer="null">
      <a-table :columns="reportColumns" :data-source="reports.list" :loading="reports.loading" rowKey="id" :scroll="{x:1250}"
        :pagination="{total:reports.total,current:reports.page,pageSize:reports.pageSize,showTotal:total => `共 ${total} 条`}" @change="reportTableChange">
        <template slot="serviceCycle" slot-scope="value">{{ serviceCycleMap[value] || value || '--' }}</template>
        <template slot="optimizationStage" slot-scope="value">{{ optimizationStageMap[value] || value || '--' }}</template>
        <template slot="mentionRate" slot-scope="value">{{ reportRate(value) }}</template>
        <template slot="reportPublisher" slot-scope="row">{{ row.publisher ? row.publisher.name : '--' }}</template>
      </a-table>
    </a-modal>

    <a-modal v-model="transitionVisible" :title="transitionTarget.label" wrapClassName="business-edit-modal" :confirmLoading="saving" @ok="saveTransition">
      <a-form-model layout="vertical">
        <a-form-model-item label="下一负责人" required><user-select v-model="transitionForm.owner_user_id" :users="users" /></a-form-model-item>
        <a-form-model-item label="下一步动作"><a-input v-model="transitionForm.next_action" /></a-form-model-item>
        <a-form-model-item label="截止时间"><a-date-picker v-model="transitionForm.next_action_at" showTime valueFormat="YYYY-MM-DD HH:mm:ss" style="width:100%" /></a-form-model-item>
        <a-form-model-item label="操作说明"><a-textarea v-model="transitionForm.evidence_note" :rows="3" /></a-form-model-item>
      </a-form-model>
    </a-modal>
  </div>
</template>

<script>
import OrderApi from "../../apis/order";
import MetricCard from "../../components/business/MetricCard.vue";
import upload from "../../libs/upload";
import utils from "../../libs/utils";

const attachmentTypes = [
  { key: "contract_files", label: "合同 / 订单确认书", tip: "正式合同或订单确认文件" },
  { key: "payment_voucher_files", label: "付款凭证", tip: "转账、微信或支付宝付款凭证", required: true },
  { key: "license_files", label: "营业执照", tip: "客户营业执照或主体证明" },
  { key: "authorization_files", label: "授权文件", tip: "案例、Logo、肖像或素材授权" },
  { key: "sales_handover_files", label: "销售交付清单", tip: "销售向交付团队的交接材料" },
  { key: "approval_files", label: "报价 / 特殊条款审批", tip: "特殊折扣或条款审批文件" },
];
const emptyAttachmentLists = () => attachmentTypes.reduce((result, item) => ({ ...result, [item.key]: [] }), {});
const emptyOrderForm = () => ({
  customer_legal_name: "", customer_credit_code: "", customer_mobile: "", customer_wechat: "", customer_industry: "",
  product_type: "annual", contract_amount: 0, invoice_required: false,
  invoice_status: "not_applied", qualification_status: "pending", ranking_commitment: false,
  acquisition_commitment: false, case_authorized: false, logo_authorized: false, portrait_authorized: false,
  enterprise_target_mention_rate: undefined,
});

const emptyReportForm = () => ({
  project_name: "", service_cycle: undefined, optimization_stage: undefined,
  core_work_content: "", current_mention_rate: undefined, semi_monthly_report_at: undefined,
  optimization_difficulties_and_solutions: "", publisher_user_id: undefined, data_report_at: undefined,
});

const UserSelect = { functional: true, props: ["value", "users", "disabled"], render(h, ctx) { return h("a-select", { props: { value: ctx.props.value, disabled: ctx.props.disabled, allowClear: !ctx.props.disabled, showSearch: true, optionFilterProp: "children", placeholder: "请选择员工" }, on: { change: value => ctx.listeners.input(value) } }, (ctx.props.users || []).map(user => h("a-select-option", { key: user.id, props: { value: user.id } }, `${user.name}${user.position_name ? `（${user.position_name}）` : ""}`))); } };

export default {
  components: { MetricCard, UserSelect },
  data() {
    return {
      filters: {}, createdRange: [], saving: false, editVisible: false, detailVisible: false, assignVisible: false, financeVisible: false, statusVisible: false, healthStatusVisible: false, refundVisible: false, finalPaymentVisible: false, reportVisible: false, reportListVisible: false, transitionVisible: false,
      editForm: emptyOrderForm(), assignForm: {}, financeForm: {}, statusForm: {}, healthStatusForm: {}, refundForm: {}, refundFiles: [], finalPaymentForm: {}, finalPaymentFiles: [], reportForm: emptyReportForm(), reportOrder: null, transitionForm: {}, transitionTarget: {}, detail: null, customers: [], contacts: [], users: [], optimizerUsers: [],
      attachmentTypes, attachmentLists: emptyAttachmentLists(),
      orders: { list: [], total: 0, page: 1, pageSize: 10, loading: false },
      reports: { list: [], total: 0, page: 1, pageSize: 10, loading: false },
      stageMap: { draft: "草稿", sales_review: "销售主管审核", finance_confirm: "财务确认", tech_assign: "技术分单", service: "服务中", renewal: "续费跟进", completed: "已完成", cancelled: "已取消" },
      productTypeMap: { trial: "体验版", annual: "年度服务", other: "其他" }, healthMap: { green: "正常", yellow: "关注", red: "风险" },
      serviceCycleMap: { one_month: "一个月服务", three_months: "三个月服务", annual: "年度服务" },
      optimizationStageMap: { first: "第一阶段", second: "第二阶段", third: "第三阶段" },
      columns: [
        { title: "订单编号", dataIndex: "order_no", width: 170 },
        { title: "客户简称", scopedSlots: { customRender: "customerShortName" }, width: 180 },
        { title: "行业", dataIndex: "customer_industry", scopedSlots: { customRender: "industry" }, width: 150 },
        { title: "产品类型", dataIndex: "product_type", scopedSlots: { customRender: "productType" }, width: 120 },
        { title: "当前阶段", dataIndex: "current_stage", scopedSlots: { customRender: "stage" }, width: 120 },
        { title: "销售", dataIndex: "sales_user.name", width: 110 },
        { title: "优化师", scopedSlots: { customRender: "optimizer" }, width: 110 },
        { title: "当前服务状态", dataIndex: "current_service_status", scopedSlots: { customRender: "currentServiceStatus" }, width: 140 },
        { title: "操作", scopedSlots: { customRender: "operate" }, fixed: "right", width: 440 },
      ],
      reportColumns: [
        { title: "项目名称", dataIndex: "project_name", width: 170 },
        { title: "服务周期", dataIndex: "service_cycle", scopedSlots: { customRender: "serviceCycle" }, width: 120 },
        { title: "优化阶段", dataIndex: "optimization_stage", scopedSlots: { customRender: "optimizationStage" }, width: 110 },
        { title: "目前提及率", dataIndex: "current_mention_rate", scopedSlots: { customRender: "mentionRate" }, width: 110 },
        { title: "半月汇报时间", dataIndex: "semi_monthly_report_at", width: 170 },
        { title: "数据报告时间", dataIndex: "data_report_at", width: 170 },
        { title: "发文人", scopedSlots: { customRender: "reportPublisher" }, width: 100 },
        { title: "创建时间", dataIndex: "created_at", width: 170 },
        { title: "核心工作内容", dataIndex: "core_work_content", ellipsis: true, width: 200 },
      ],
    };
  },
  computed: {
    canEditPaidAmount() { return !!this.editForm.id && !!(this.$auth.isFinance || this.$auth.isAdmin); },
    financePaidOnly() { return !!this.editForm.id && !!this.$auth.isFinance && !this.$auth.isAdmin; },
    isOptimizerRole() { const user = this.$auth.user(); return !!(user && user.roles && user.roles.some(role => role.alias === "optimizer")); },
    reportPublisherUsers() { const user = this.$auth.user(); return this.isOptimizerRole && user ? [user] : this.optimizerUsers; },
    summary() { return this.orders.list.reduce((s, row) => ({ contract: s.contract + Number(row.contract_amount || 0), paid: s.paid + Number(row.paid_amount || 0), finalPayment: s.finalPayment + Number(row.final_payment_amount || 0), receivable: s.receivable + Math.max(0, Number(row.receivable_amount || 0) - Number(row.final_payment_amount || 0)) }), { contract: 0, paid: 0, finalPayment: 0, receivable: 0 }); },
    selectedCustomer() { return this.customers.find(item => item.id === this.editForm.customer_id); },
    customerRegion() { const item = this.selectedCustomer || {}; return [item.province, item.city, item.district].filter(Boolean).join(" / ") || "--"; },
    detailAttachments() { if (!this.detail) return []; return attachmentTypes.concat([{ key: "final_payment_screenshot_files", label: "尾款截图", single: true }, { key: "refund_screenshot_files", label: "退款截图" }]).map(item => { const value = this.detail[item.key]; return { ...item, files: item.single ? (value ? [value] : []) : (value || []) }; }).filter(item => item.files.length); },
    reportOrderName() { return this.reportOrder ? (this.reportOrder.customer_legal_name || this.reportOrder.order_no || "订单") : "订单"; },
  },
  created() { this.loadOrders(); this.loadOptions(); const orderId = Number(this.$route.query.order_id || 0); if (orderId) this.openDetail({ id: orderId }); },
  methods: {
    money(value) { return `¥${Number(value || 0).toFixed(2)}`; },
    rate(value) { return value === undefined || value === null || value === "" ? "--" : `${Number(value).toFixed(2)}%`; },
    reportRate(value) { return value === undefined || value === null || value === "" ? "--" : `${Math.round(Number(value))}%`; },
    hasAction(row, action) { return (row.available_actions || []).includes(action); },
    customerName(row) { return row.customer ? (row.customer.brand_name || row.customer.legal_name) : "--"; },
    customerShortName(row) { return row.customer ? (row.customer.brand_name || row.customer.legal_name || row.customer_legal_name || "--") : (row.customer_legal_name || "--"); },
    currentServiceStatus(value) { return value === undefined || value === null || value === "" ? "0" : `${Math.round(Number(value))}%`; },
    detailReceivable(order) { return Math.max(0, Number(order.receivable_amount || 0) - Number(order.final_payment_amount || 0)); },
    isImageUrl(url) { return /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(url || ""); },
    fileName(url) { return decodeURIComponent((url || "").split("?")[0].split("/").pop() || "查看文件"); },
    loadOrders(page) { if (page) this.orders.page = page; this.orders.loading = true; OrderApi.list({ ...this.filters, page: this.orders.page, pageSize: this.orders.pageSize }).then(res => { this.orders.list = res.list || []; this.orders.total = res.total || 0; }).finally(() => { this.orders.loading = false; }); },
    loadOptions() {
      if (this.$acl.verify("sales.customer.view")) OrderApi.customers({ pageSize: 1000 }).then(res => { this.customers = res.list || []; });
      OrderApi.optimizers().then(res => { this.optimizerUsers = Array.isArray(res) ? res : (res.list || []); });
      const aliases = ["sales_director", "sales_manager", "sales", "finance", "technical_director", "optimizer"];
      Promise.all(aliases.map(alias => OrderApi.roleUsers(alias).catch(() => []))).then(groups => {
        const unique = {};
        groups.reduce((all, group) => all.concat(group || []), []).forEach(user => { unique[user.id] = user; });
        this.users = Object.values(unique);
      });
    },
    tableChange(pagination) { this.orders.page = pagination.current; this.orders.pageSize = pagination.pageSize; this.loadOrders(); },
    resetSearch() { this.filters = {}; this.createdRange = []; this.loadOrders(1); },
    createdRangeChanged(range) { this.filters.created_start = range && range[0]; this.filters.created_end = range && range[1]; },
    customerChanged(id) { this.editForm.contact_id = undefined; this.loadContacts(id); },
    loadContacts(id, selected) { if (!id) { this.contacts = []; return Promise.resolve(); } return OrderApi.customerDetail(id).then(res => { this.contacts = res.contacts || []; if (selected) this.editForm.contact_id = selected; }); },
    openEdit(row) {
      this.contacts = [];
      this.attachmentLists = emptyAttachmentLists();
      if (!row) {
        this.editForm = emptyOrderForm();
        this.editVisible = true;
        return;
      }
      OrderApi.detail(row.id).then(detail => {
        this.editForm = { ...emptyOrderForm(), ...detail, customer_name: detail.customer ? (detail.customer.legal_name || detail.customer.brand_name || '') : (detail.customer_name || ''), contact_name: detail.contact ? detail.contact.contact_name : (detail.contact_name || ''), customer_legal_name: detail.customer_legal_name || (detail.customer ? (detail.customer.legal_name || detail.customer.brand_name || '') : ''), contract_amount: Number(detail.contract_amount || 0), paid_amount: Number(detail.paid_amount || 0), enterprise_target_mention_rate: detail.enterprise_target_mention_rate === null ? undefined : Number(detail.enterprise_target_mention_rate) };
        attachmentTypes.forEach(type => {
          this.attachmentLists[type.key] = (detail[type.key] || []).map(url => ({ uid: utils.uuid(), status: "done", name: url.split("/").pop(), url }));
        });
        this.loadContacts(detail.customer_id, detail.contact_id);
        this.editVisible = true;
      });
    },
    async addAttachment(type, { file, onSuccess, onError }) {
      file.status = "uploading";
      const current = this.attachmentLists[type] || [];
      if (!current.some(item => item.uid === file.uid)) this.$set(this.attachmentLists, type, current.concat(file));
      try {
        file.url = await utils.getBase64(file);
        file.status = "done";
        this.$set(this.attachmentLists, type, (this.attachmentLists[type] || []).slice());
        if (onSuccess) onSuccess({}, file);
      } catch (error) {
        this.$set(this.attachmentLists, type, (this.attachmentLists[type] || []).filter(item => item.uid !== file.uid));
        if (onError) onError(error);
        this.$message.error("附件读取失败，请重新上传");
      }
    },
    removeAttachment(type, file) { this.attachmentLists[type] = this.attachmentLists[type].filter(item => item.uid !== file.uid); return true; },
    async saveOrder() {
      const f = this.editForm;
      if (this.financePaidOnly) {
        if (f.paid_amount === undefined || f.paid_amount === null) return this.$message.warning("请输入到账金额");
        if (Number(f.paid_amount) > Number(f.contract_amount || 0)) return this.$message.warning("到账金额不能大于合同金额");
        this.saving = true;
        try {
          await OrderApi.update({ id: f.id, paid_amount: f.paid_amount });
          this.$message.success("到账金额已更新");
          this.editVisible = false;
          this.loadOrders();
        } finally { this.saving = false; }
        return;
      }
      if (!f.customer_name || !f.contact_name || !f.customer_legal_name || !f.product_type || f.contract_amount === undefined) return this.$message.warning("请完整填写客户、联系人、主体全称、产品类型和合同金额");
      const uploading = Object.values(this.attachmentLists).some(list => (list || []).some(file => file.status === "uploading"));
      if (uploading) return this.$message.warning("附件正在处理中，请稍后再保存");
      const missingFiles = attachmentTypes.filter(item => item.required && !(this.attachmentLists[item.key] || []).length);
      if (missingFiles.length) return this.$message.warning(`请上传：${missingFiles.map(item => item.label).join("、")}`);
      this.saving = true;
      try {
        await Promise.all(Object.values(this.attachmentLists).map(list => upload.uploadList(list, ["thesiswdw", "order"])));
        Object.keys(this.attachmentLists).forEach(type => { f[type] = upload.getRources(this.attachmentLists[type]).filter(Boolean); });
        await (f.id ? OrderApi.update({ ...f }) : OrderApi.create({ ...f }));
        this.$message.success("保存成功");
        this.editVisible = false;
        this.loadOrders(f.id ? undefined : 1);
      } finally { this.saving = false; }
    },
    openDetail(row) { OrderApi.detail(row.id).then(res => { this.detail = res; this.detailVisible = true; }); },
    openAssign(row) { this.assignForm = { id: row.id, optimizer_id: row.optimizer_id }; this.assignVisible = true; },
    saveAssign() { if (!this.assignForm.optimizer_id) return this.$message.warning("请选择优化师"); this.run(OrderApi.assign(this.assignForm), () => { this.assignVisible = false; this.loadOrders(); }); },
    openStatus(row) { this.statusForm = { id: row.id, current_stage: row.current_stage, status: row.current_stage === "renewal" ? "completed" : undefined, remark: "" }; this.statusVisible = true; },
    saveStatus() { if (!this.statusForm.status) return this.$message.warning("请选择订单状态"); this.run(OrderApi.updateStatus(this.statusForm), () => { this.statusVisible = false; this.loadOrders(); }); },
    openHealthStatus(row) { this.healthStatusForm = { order_id: row.id, health_status: row.health_status || "green" }; this.healthStatusVisible = true; },
    saveHealthStatus() { if (!this.healthStatusForm.health_status) return this.$message.warning("请选择健康状态"); this.run(OrderApi.updateHealthStatus(this.healthStatusForm), () => { this.healthStatusVisible = false; this.loadOrders(); }); },
    openRefund(row) { this.refundForm = { id: row.id, refund_amount: undefined, refund_reason: "" }; this.refundFiles = []; this.refundVisible = true; },
    async addRefundFile({ file, onSuccess, onError }) {
      file.status = "uploading";
      if (!this.refundFiles.some(item => item.uid === file.uid)) this.refundFiles = this.refundFiles.concat(file);
      try { file.url = await utils.getBase64(file); file.status = "done"; this.refundFiles = this.refundFiles.slice(); if (onSuccess) onSuccess({}, file); }
      catch (error) { this.refundFiles = this.refundFiles.filter(item => item.uid !== file.uid); if (onError) onError(error); this.$message.error("退款截图读取失败"); }
    },
    removeRefundFile(file) { this.refundFiles = this.refundFiles.filter(item => item.uid !== file.uid); return true; },
    async saveRefund() {
      if (!this.refundForm.refund_amount || !this.refundForm.refund_reason) return this.$message.warning("请填写退款金额和退款原因");
      if (!this.refundFiles.length) return this.$message.warning("请上传退款截图");
      if (this.refundFiles.some(file => file.status === "uploading")) return this.$message.warning("退款截图正在处理中");
      this.saving = true;
      try {
        await upload.uploadList(this.refundFiles, ["thesiswdw", "order-refund"]);
        await OrderApi.refund({ ...this.refundForm, refund_screenshot_files: upload.getRources(this.refundFiles).filter(Boolean) });
        this.$message.success("退款申请已提交"); this.refundVisible = false; this.loadOrders();
      } finally { this.saving = false; }
    },
    openFinalPayment(row) {
      this.finalPaymentForm = { order_id: row.id, payable_amount: Number(row.payable_amount || 0), final_payment_amount: row.final_payment_amount ? Number(row.final_payment_amount) : undefined };
      this.finalPaymentFiles = row.final_payment_screenshot_files ? [{ uid: utils.uuid(), status: "done", name: this.fileName(row.final_payment_screenshot_files), url: row.final_payment_screenshot_files }] : [];
      this.finalPaymentVisible = true;
    },
    async addFinalPaymentFile({ file, onSuccess, onError }) {
      file.status = "uploading";
      this.finalPaymentFiles = [file];
      try { file.url = await utils.getBase64(file); file.status = "done"; this.finalPaymentFiles = this.finalPaymentFiles.slice(); if (onSuccess) onSuccess({}, file); }
      catch (error) { this.finalPaymentFiles = this.finalPaymentFiles.filter(item => item.uid !== file.uid); if (onError) onError(error); this.$message.error("尾款截图读取失败"); }
    },
    removeFinalPaymentFile(file) { this.finalPaymentFiles = this.finalPaymentFiles.filter(item => item.uid !== file.uid); return true; },
    async saveFinalPayment() {
      const f = this.finalPaymentForm;
      if (!f.final_payment_amount) return this.$message.warning("请输入尾款金额");
      if (Number(f.payable_amount || 0) > 0 && Number(f.final_payment_amount) > Number(f.payable_amount)) return this.$message.warning("尾款金额不能大于订单应付金额");
      if (!this.finalPaymentFiles.length) return this.$message.warning("请上传尾款截图");
      if (this.finalPaymentFiles.some(file => file.status === "uploading")) return this.$message.warning("尾款截图正在处理中");
      this.saving = true;
      try {
        await upload.uploadList(this.finalPaymentFiles, ["thesiswdw", "order-final-payment"]);
        await OrderApi.finalPayment({ order_id: f.order_id, final_payment_amount: f.final_payment_amount, final_payment_screenshot_files: upload.getRources(this.finalPaymentFiles).filter(Boolean)[0] });
        this.$message.success("尾款已添加"); this.finalPaymentVisible = false; this.loadOrders();
      } finally { this.saving = false; }
    },
    openReport(order, report) {
      this.reportOrder = order;
      const currentUser = this.$auth.user();
      this.reportForm = {
        ...emptyReportForm(),
        ...(report || {}),
        order_id: order.id,
        publisher_user_id: this.isOptimizerRole && currentUser ? currentUser.id : (report ? report.publisher_user_id : order.optimizer_id),
        current_mention_rate: report && report.current_mention_rate !== null ? Number(report.current_mention_rate) : undefined,
      };
      this.reportVisible = true;
    },
    async saveReport() {
      const f = this.reportForm;
      if (!f.project_name || !f.service_cycle || !f.optimization_stage || !f.publisher_user_id) return this.$message.warning("请填写项目名称、服务周期、优化阶段和发文人");
      this.saving = true;
      try {
        await OrderApi.saveOptimizationReport({ ...f });
        this.$message.success(f.id ? "报告已更新" : "报告已保存");
        this.reportVisible = false;
        if (this.reportListVisible) this.loadReports();
      } finally { this.saving = false; }
    },
    openReportList(row) {
      this.reportOrder = row;
      this.reports.page = 1;
      this.reportListVisible = true;
      this.loadReports();
    },
    loadReports() {
      if (!this.reportOrder) return;
      this.reports.loading = true;
      OrderApi.optimizationReports({ order_id: this.reportOrder.id, page: this.reports.page, pageSize: this.reports.pageSize })
        .then(res => { this.reports.list = res.list || []; this.reports.total = res.total || 0; })
        .finally(() => { this.reports.loading = false; });
    },
    reportTableChange(pagination) { this.reports.page = pagination.current; this.reports.pageSize = pagination.pageSize; this.loadReports(); },
    transitionActions(row) { const map = [{ key: "submit_sales_review", label: "提交审核", to: "sales_review" }, { key: "approve_sales", label: "审核通过", to: "finance_confirm" }, { key: "return_draft", label: "退回草稿", to: "draft" }, { key: "confirm_finance", label: "财务确认", to: "tech_assign" }]; return map.filter(item => this.hasAction(row, item.key)); },
    handleTransition(row, action) {
      if (action.key === "confirm_finance") {
        this.financeForm = { id: row.id, to_stage: action.to, owner_user_id: row.owner_user_id, next_action: row.next_action, next_action_at: row.next_action_at, payable_amount: Number(row.payable_amount || 0), paid_amount: Number(row.paid_amount || 0) };
        this.financeVisible = true;
        return;
      }
      if (action.key === "approve_sales") {
        this.$confirm({
          title: "确定审核通过吗？",
          content: "审核通过后订单将进入财务确认阶段。",
          okText: "审核通过",
          cancelText: "取消",
          onOk: () => this.run(OrderApi.transition({ id: row.id, to_stage: action.to, owner_user_id: row.owner_user_id, next_action: row.next_action, next_action_at: row.next_action_at }), () => this.loadOrders()),
        });
        return;
      }
      if (action.key !== "submit_sales_review") return this.openTransition(row, action);
      this.$confirm({
        title: "确定提交审核吗？",
        content: "提交后订单将进入销售主管审核阶段。",
        okText: "确定提交",
        cancelText: "取消",
        onOk: () => this.run(OrderApi.transition({ id: row.id, to_stage: action.to, owner_user_id: row.owner_user_id, next_action: row.next_action, next_action_at: row.next_action_at }), () => this.loadOrders()),
      });
    },
    saveFinanceConfirm() {
      if (this.financeForm.paid_amount === undefined || this.financeForm.paid_amount === null) return this.$message.warning("请输入财务已确认到账金额");
      if (Number(this.financeForm.paid_amount) > Number(this.financeForm.payable_amount || 0)) return this.$message.warning("到账金额不能大于应付金额");
      const payload = { ...this.financeForm };
      delete payload.payable_amount;
      this.run(OrderApi.transition(payload), () => { this.financeVisible = false; this.loadOrders(); });
    },
    openTransition(row, action) { this.transitionTarget = action; this.transitionForm = { id: row.id, to_stage: action.to, owner_user_id: row.owner_user_id, next_action: row.next_action, next_action_at: row.next_action_at }; this.transitionVisible = true; },
    saveTransition() { if (!this.transitionForm.owner_user_id) return this.$message.warning("请选择下一负责人"); this.run(OrderApi.transition(this.transitionForm), () => { this.transitionVisible = false; this.loadOrders(); }); },
    removeOrder(row) { this.run(OrderApi.remove(row.id), () => this.loadOrders(1)); },
    run(promise, success) { this.saving = true; return promise.then(result => { this.$message.success("操作成功"); return success ? success(result) : result; }).finally(() => { this.saving = false; }); },
  },
};
</script>

<style lang="less" scoped>
.order-page {
  .order-search /deep/ .ant-form-item { margin: 0 0 0 10px; }
  .order-search /deep/ .ant-input { width: 210px; }
  .order-search /deep/ .ant-select { width: 135px; }
  .cell-sub { display: block; margin-top: 4px; color: #8b97aa; font-size: 12px; }
  .cell-lines { display: flex; flex-direction: column; gap: 5px; color: #52617c; font-size: 14px; font-weight: 400; line-height: 1.45; }
  .cell-lines span { color: inherit; font-size: inherit; font-weight: inherit; white-space: nowrap; }
  .voucher-cell { display: flex; align-items: center; gap: 8px; }
  .voucher-cell a { width: 52px; height: 42px; overflow: hidden; display: grid; place-items: center; border: 1px solid #e1e8ee; border-radius: 6px; color: #08a88d; background: #f8fbfb; }
  .voucher-cell img { width: 100%; height: 100%; object-fit: cover; }
  .voucher-cell small { color: #8290a5; white-space: nowrap; }
  .row-actions { display: flex; flex-wrap: wrap; gap: 6px 12px; }
  .row-actions a { color: #009b81; white-space: nowrap; }
  .row-actions .danger-link { color: #ed4d4d; }
  .order-status { display: inline-flex; min-width: 66px; justify-content: center; padding: 4px 9px; border-radius: 6px; color: #596780; background: #f0f3f6; font-style: normal; }
  .order-status.draft { color: #e88900; background: #fff2df; }
  .order-status.sales_review,.order-status.finance_confirm,.order-status.tech_assign { color: #1677ff; background: #e9f3ff; }
  .order-status.service,.order-status.renewal { color: #8c55cf; background: #f2eaff; }
  .order-status.completed { color: #008f78; background: #e5f8f3; }
  .order-status.cancelled { color: #ed3838; background: #ffe8e8; }
  .health-tag { display: inline-flex; align-items: center; gap: 6px; }.health-tag i { width: 8px; height: 8px; border-radius: 50%; }.health-tag.green i { background: #08a88d; }.health-tag.yellow i { background: #f5a623; }.health-tag.red i { background: #ef4d4d; }
  /deep/ .ant-input-number,/deep/ .ant-calendar-picker { width: 100%; }
  /deep/ .finance-paid-only .form-section-title,
  /deep/ .finance-paid-only .ant-form-item:not(.paid-amount-field),
  /deep/ .finance-paid-only .check-grid,
  /deep/ .finance-paid-only .attachment-grid { display: none; }
  /deep/ .finance-paid-only .paid-amount-field { margin-top: 8px; }
  .finance-confirm-tip { padding: 12px 14px; border-radius: 8px; color: #627089; background: #f5f8fa; }
  .order-list-count { margin-left: 8px; color: #08a88d; font-size: 14px; font-weight: 500; }
}
.modal-grid { gap: 0 22px; }
.form-section-title { margin: 6px 0 18px; padding-left: 10px; border-left: 3px solid #08a88d; color: #172744; font-size: 16px; font-weight: 600; }
.form-section-title:not(:first-child) { margin-top: 18px; }
.customer-summary { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin: -4px 0 20px; padding: 13px 16px; border-radius: 8px; color: #60708a; background: #f7fafb; }
.check-grid { display: flex; flex-wrap: wrap; gap: 14px 24px; margin: 0 0 18px 12.5%; padding: 14px 16px; border: 1px solid #e8eef2; border-radius: 8px; background: #f9fbfc; }
.attachment-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 12px 18px; }
.attachment-item { min-height: 112px; padding: 14px 16px; border: 1px solid #e6ecf1; border-radius: 9px; background: #fafcfd; }
.attachment-item b { display: block; margin-bottom: 10px; color: #23334f; }
.attachment-item b em { margin-left: 8px; padding: 2px 6px; border-radius: 4px; color: #e5484d; background: #fff0f0; font-size: 11px; font-style: normal; font-weight: 500; }
.attachment-item small { display: block; margin-top: 7px; color: #8b97a8; }
.detail-summary { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin-bottom: 20px; }.detail-summary > div { padding: 13px; border: 1px solid #e7edf2; border-radius: 9px; background: #f8fafb; }.detail-summary span { display: block; margin-bottom: 6px; color: #7c899d; }.detail-summary b { color: #102044; }.drawer-title { margin: 26px 0 14px; color: #132344; }
.detail-attachments { display: grid; gap: 14px; }
.detail-attachment-group { padding: 14px; border: 1px solid #e6ecf1; border-radius: 9px; background: #fafcfd; }
.detail-attachment-group h4 { margin: 0 0 10px; color: #243553; font-weight: 600; }
.detail-file-list { display: flex; flex-wrap: wrap; gap: 10px; }
.detail-file { width: 104px; height: 82px; overflow: hidden; display: flex; align-items: center; justify-content: center; border: 1px solid #dfe7ed; border-radius: 8px; color: #66758e; background: #fff; }
.detail-file img { width: 100%; height: 100%; object-fit: cover; }
.detail-file > span { min-width: 0; padding: 8px; text-align: center; }
.detail-file .anticon { display: block; margin-bottom: 6px; color: #08a88d; font-size: 24px; }
.detail-file small { overflow: hidden; display: block; white-space: nowrap; text-overflow: ellipsis; }
@media (max-width: 1100px) { .detail-summary,.customer-summary,.attachment-grid { grid-template-columns: repeat(2,1fr); } }
</style>
