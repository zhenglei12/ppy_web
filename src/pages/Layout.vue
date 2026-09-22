<template>
  <a-layout class="app-shell">
    <a-layout-sider class="app-sidebar" :width="282" :collapsed-width="78" v-model="collapsed" :trigger="null" collapsible>
      <div class="brand" @click="goto('/home')">
        <img class="brand-logo" src="~@/assets/logo.png" alt="朴朴鹰" />
        <div v-if="!collapsed" class="brand-copy">
          <strong>朴朴鹰</strong>
          <span>总部经营系统</span>
        </div>
      </div>

      <a-menu mode="inline" :selected-keys="[$route.name]" class="business-menu">
        <a-menu-item v-acl="'dashboard.view'" key="home" @click="goto('/home')"><a-icon type="home" /><span>经营总览</span></a-menu-item>
        <a-menu-item v-acl="'sales.dashboard.view'" key="sales-dashboard" @click="goto('/sales')"><a-icon type="line-chart" /><span>销售看板</span></a-menu-item>
        <a-menu-item v-acl="'sales.order.view'" key="order" @click="goto('/order')"><a-icon type="file-done" /><span>订单管理</span></a-menu-item>
        <a-menu-item v-acl="'delivery.project.view'" key="delivery" @click="goto('/delivery')"><a-icon type="compass" /><span>优化交付</span></a-menu-item>
        <a-menu-item v-acl="'finance.view'" key="finance-dashboard" @click="goto('/finance')"><a-icon type="pay-circle" /><span>财务看板</span></a-menu-item>
        <a-menu-item v-acl="'sales.customer.view'" key="crm-dashboard" @click="goto('/crm')"><a-icon type="phone" /><span>电销 CRM</span></a-menu-item>
        <a-sub-menu key="user" v-acl:one="['user-list', 'role-list', 'department-list', 'hr.payroll.view']">
          <span slot="title"><a-icon type="team" /><span>用户管理</span></span>
          <a-menu-item v-acl="'user-list'" key="person" @click="goto('/person')"><a-icon type="idcard" /><span>员工管理</span></a-menu-item>
          <a-menu-item v-acl="'role-list'" key="role" @click="goto('/role')"><a-icon type="safety-certificate" /><span>角色管理</span></a-menu-item>
          <a-menu-item v-acl="'department-list'" key="department" @click="goto('/department')"><a-icon type="apartment" /><span>部门管理</span></a-menu-item>
          <a-menu-item v-acl="'hr.payroll.view'" key="payroll" @click="goto('/payroll')"><a-icon type="account-book" /><span>工资管理</span></a-menu-item>
        </a-sub-menu>
      </a-menu>

      <div class="sidebar-footer">
        <button class="collapse-button" @click="collapsed = !collapsed"><a-icon :type="collapsed ? 'menu-unfold' : 'menu-fold'" /></button>
        <div class="admin-avatar">总</div>
        <div v-if="!collapsed" class="admin-copy">
          <strong>{{ userName }}</strong>
          <span>按岗位查看权限</span>
        </div>
        <a-dropdown v-if="!collapsed" placement="topRight">
          <a class="admin-more" @click.prevent><a-icon type="ellipsis" /></a>
          <a-menu slot="overlay"><a-menu-item @click="$auth.logout()">退出登录</a-menu-item></a-menu>
        </a-dropdown>
      </div>
    </a-layout-sider>

    <a-layout class="app-main">
      <a-layout-content class="app-content"><router-view /></a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script>
export default {
  data() {
    return { collapsed: false };
  },
  computed: {
    userName() {
      const user = this.$auth && this.$auth.user ? this.$auth.user() : null;
      return (user && user.name) || "总部管理员";
    },
  },
  methods: {
    goto(path) {
      this.$router.push(path);
    },
  },
};
</script>

<style lang="less" scoped>
.app-shell { min-height: 100vh; background: #f7f9fc; }
.app-sidebar { position: fixed; z-index: 20; left: 0; top: 0; bottom: 0; background: #fff; border-right: 1px solid #e7ecf2; }
.app-sidebar /deep/ .ant-layout-sider-children { display: flex; flex-direction: column; }
.brand { height: 128px; padding: 37px 30px; display: flex; align-items: center; gap: 18px; cursor: pointer; overflow: hidden; }
.brand-logo { flex: 0 0 58px; width: 58px; height: 58px; border-radius: 14px; object-fit: cover; }
.brand-copy { white-space: nowrap; display: flex; flex-direction: column; }
.brand-copy strong { color: #0e1c3b; font-size: 27px; letter-spacing: 2px; }
.brand-copy span { color: #8693aa; margin-top: 3px; }
.business-menu { flex: 1; min-height: 0; border: 0; padding: 0 16px 22px; overflow-x: hidden; overflow-y: auto; background: transparent; color: #132344; font-size: 17px; }
.business-menu /deep/ .ant-menu-item, .business-menu /deep/ .ant-menu-submenu-title { height: 62px; line-height: 62px; margin: 3px 0; border-radius: 10px; padding-left: 22px !important; }
.business-menu /deep/ .ant-menu-item .anticon, .business-menu /deep/ .ant-menu-submenu-title .anticon { font-size: 23px; margin-right: 22px; }
.business-menu /deep/ .ant-menu-item-selected { color: #102044; font-weight: 600; background: linear-gradient(90deg,#e8f8f5,#eef9f8); }
.business-menu /deep/ .ant-menu-item-selected::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 5px; background: #08a98f; border-radius: 5px; }
.business-menu /deep/ .ant-menu-item::after { display: none; }
.business-menu /deep/ .ant-menu-submenu { margin-top: 3px; }
.business-menu /deep/ .ant-menu-submenu-selected > .ant-menu-submenu-title { color: #132344; font-weight: 600; background: #f8fafc; }
.business-menu /deep/ .ant-menu-submenu-open > .ant-menu-submenu-title { margin-bottom: 6px; color: #102044; background: #f5f9f8; }
.business-menu /deep/ .ant-menu-submenu-arrow { right: 18px; color: #78869c; }
.business-menu /deep/ .ant-menu-sub.ant-menu-inline { margin: 0 0 8px; padding: 6px 8px 7px; border: 1px solid #edf1f4; border-radius: 10px; background: #fafcfc; box-shadow: none; }
.business-menu /deep/ .ant-menu-sub.ant-menu-inline .ant-menu-item { height: 45px; line-height: 45px; margin: 2px 0; padding-left: 43px !important; border-radius: 8px; color: #57657b; font-size: 16px; font-weight: 400; }
.business-menu /deep/ .ant-menu-sub.ant-menu-inline .ant-menu-item .anticon { width: 18px; margin-right: 12px; color: #7c899b; font-size: 16px; text-align: center; transition: color .18s ease; }
.business-menu /deep/ .ant-menu-sub.ant-menu-inline .ant-menu-item span { font-size: 15px; letter-spacing: .2px; }
.business-menu /deep/ .ant-menu-sub.ant-menu-inline .ant-menu-item::before { top: 7px; bottom: 7px; width: 4px; }
.business-menu /deep/ .ant-menu-sub.ant-menu-inline .ant-menu-item-selected { color: #102044; font-weight: 600; background: linear-gradient(90deg,#e5f7f3,#f0faf8); }
.business-menu /deep/ .ant-menu-sub.ant-menu-inline .ant-menu-item-selected .anticon { color: #009b81; }
.business-menu /deep/ .ant-menu-sub.ant-menu-inline .ant-menu-item:hover { color: #008f78; background: #f0f8f6; }
.business-menu /deep/ .ant-menu-sub.ant-menu-inline .ant-menu-item:hover .anticon { color: #008f78; }
.business-menu::-webkit-scrollbar { width: 4px; }
.business-menu::-webkit-scrollbar-thumb { border-radius: 4px; background: #dfe7e6; }
.sidebar-footer { margin-top: 0; min-height: 132px; padding: 45px 24px 22px; border-top: 1px solid #edf0f5; display: flex; align-items: center; gap: 14px; position: relative; background: #fff; }
.collapse-button { position: absolute; right: 16px; top: 10px; width: 32px; height: 32px; border: 0; background: #f3f6fa; border-radius: 8px; color: #71809a; cursor: pointer; }
.admin-avatar { flex: 0 0 48px; height: 48px; display: grid; place-items: center; border-radius: 50%; color: #173052; font-size: 19px; font-weight: 700; background: #ffd6b5; }
.admin-copy { min-width: 0; white-space: nowrap; display: flex; flex-direction: column; color: #112242; }
.admin-copy strong { font-size: 16px; }
.admin-copy span { font-size: 13px; color: #8490a7; margin-top: 4px; }
.admin-more { margin-left: auto; color: #74819a; font-size: 22px; }
.app-main { margin-left: 282px; min-height: 100vh; background: #f8fafc; transition: margin-left .2s; }
.ant-layout-sider-collapsed + .app-main { margin-left: 78px; }
.app-content { min-width: 0; }
@media (max-width: 900px) { .app-sidebar { position: relative; } .app-main { margin-left: 0 !important; } }
</style>
