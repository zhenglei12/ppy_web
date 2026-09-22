<template>
  <a-modal
    :visible="visible"
    title="关联权限"
    wrapClassName="business-edit-modal permission-modal"
    destroyOnClose
    :confirmLoading="loading"
    width="1040px"
    @cancel="close"
    @ok="submit"
  >
    <div class="permission-intro">
      <div>
        <strong>权限配置</strong>
        <span>按左侧菜单模块分组，可整组选择或单独选择操作权限。</span>
      </div>
      <span class="selected-count">已选 {{ selectedNames.length }} 项</span>
    </div>

    <a-spin :spinning="permissionLoading">
      <div v-if="permissionGroups.length" class="permission-groups">
        <section v-for="group in permissionGroups" :key="group.key" class="permission-group">
          <div class="group-header">
            <div class="group-title">
              <span class="group-icon"><a-icon :type="group.icon" /></span>
              <div><strong>{{ group.label }}</strong><small>{{ group.items.length }} 项权限</small></div>
            </div>
            <a-checkbox
              :checked="isGroupChecked(group)"
              :indeterminate="isGroupIndeterminate(group)"
              @change="toggleGroup(group, $event.target.checked)"
            >全选</a-checkbox>
          </div>
          <div class="group-items">
            <label
              v-for="item in group.items"
              :key="item.name"
              class="permission-item"
              :class="{ active: isChecked(item.name) }"
              :title="item.name"
            >
              <a-checkbox :checked="isChecked(item.name)" @change="toggleItem(item.name, $event.target.checked)" />
              <span class="permission-copy">
                <strong>{{ permissionLabel(item) }}</strong>
                <small v-if="item.description">{{ item.description }}</small>
              </span>
            </label>
          </div>
        </section>
      </div>
      <a-empty v-else-if="!permissionLoading" description="暂无可配置权限" />
    </a-spin>

    <template slot="footer">
      <span class="footer-count">已选 {{ selectedNames.length }} 项</span>
      <a-button key="back" @click="close">取消</a-button>
      <a-button key="submit" type="primary" :loading="loading" @click="submit">确定</a-button>
    </template>
  </a-modal>
</template>

<script>
import editMixin from "../../mixins/edit";
import RoleApi from "../../apis/role";
import PermissionApi from "../../apis/permission";

const groupDefinitions = [
  { key: "dashboard", label: "经营总览", icon: "home" },
  { key: "sales", label: "销售入单", icon: "plus-circle" },
  { key: "delivery", label: "优化交付", icon: "compass" },
  { key: "finance", label: "财务看板", icon: "pay-circle" },
  { key: "hr", label: "人事管理", icon: "user" },
  { key: "crm", label: "电销 CRM", icon: "phone" },
  { key: "user", label: "用户管理", icon: "team" },
  { key: "system", label: "系统管理", icon: "setting" },
  { key: "other", label: "其他权限", icon: "appstore" },
];

export default {
  mixins: [editMixin],
  data() {
    return {
      loading: false,
      permissionLoading: false,
      allPermissions: [],
      selectedNames: [],
    };
  },
  computed: {
    permissionGroups() {
      const buckets = {};
      groupDefinitions.forEach(group => { buckets[group.key] = []; });
      this.allPermissions.forEach(item => {
        buckets[this.resolveGroup(item)].push(item);
      });
      return groupDefinitions
        .map(group => ({ ...group, items: buckets[group.key] }))
        .filter(group => group.items.length);
    },
  },
  watch: {
    visible(opened) {
      if (opened) this.syncSelected();
    },
  },
  created() {
    this.getAllPermission();
  },
  methods: {
    getAllPermission() {
      this.permissionLoading = true;
      PermissionApi.all()
        .then(res => {
          this.allPermissions = (res.list || []).filter(item => Number(item.status === undefined ? 1 : item.status) !== 0);
          this.syncSelected();
        })
        .finally(() => { this.permissionLoading = false; });
    },
    syncSelected() {
      if (!this.visible || !this.R) return;
      this.selectedNames = (this.R.permissions || []).map(item => item.name);
    },
    resolveGroup(item) {
      const module = (item.module || "").toLowerCase();
      if (["dashboard", "sales", "delivery", "finance", "hr", "crm", "system"].includes(module)) return module;
      const prefix = (item.name || "").split(/[.-]/)[0];
      if (["user", "role", "department"].includes(prefix)) return "user";
      if (["staff", "order"].includes(prefix)) return "sales";
      if (["device", "operation_account", "classify", "permission", "system"].includes(prefix)) return "system";
      return "other";
    },
    permissionLabel(item) {
      return item.alias || item.description || item.name;
    },
    isChecked(name) {
      return this.selectedNames.includes(name);
    },
    toggleItem(name, checked) {
      if (checked && !this.isChecked(name)) this.selectedNames = [...this.selectedNames, name];
      if (!checked) this.selectedNames = this.selectedNames.filter(item => item !== name);
    },
    isGroupChecked(group) {
      return group.items.length > 0 && group.items.every(item => this.isChecked(item.name));
    },
    isGroupIndeterminate(group) {
      const count = group.items.filter(item => this.isChecked(item.name)).length;
      return count > 0 && count < group.items.length;
    },
    toggleGroup(group, checked) {
      const names = group.items.map(item => item.name);
      if (checked) this.selectedNames = Array.from(new Set([...this.selectedNames, ...names]));
      else this.selectedNames = this.selectedNames.filter(name => !names.includes(name));
    },
    beforeClose() {
      this.selectedNames = [];
    },
    submit() {
      this.loading = true;
      RoleApi.allot({ id: this.R.id, permissions: this.selectedNames })
        .then(res => {
          this.$message.success("保存成功");
          this.$emit("refresh", res);
          this.close();
        })
        .finally(() => { this.loading = false; });
    },
  },
};
</script>

<style lang="less" scoped>
.permission-intro { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 18px; padding: 16px 18px; border: 1px solid #e6ecef; border-radius: 10px; background: #f8fbfa; }
.permission-intro strong { display: block; color: #14233f; font-size: 17px; }
.permission-intro span:not(.selected-count) { display: block; margin-top: 4px; color: #7a879c; }
.selected-count { flex: none; padding: 7px 13px; border-radius: 20px; color: #008f78; background: #e5f8f3; font-weight: 600; }
.permission-groups { max-height: 610px; padding-right: 5px; overflow-y: auto; }
.permission-group { margin-bottom: 15px; overflow: hidden; border: 1px solid #e6ebf1; border-radius: 11px; background: #fff; }
.group-header { min-height: 64px; padding: 12px 18px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #edf1f4; background: #f8fafb; }
.group-title { display: flex; align-items: center; gap: 12px; }
.group-icon { width: 38px; height: 38px; display: grid; place-items: center; border-radius: 9px; color: #009b81; background: #e5f8f3; font-size: 18px; }
.group-title strong { display: block; color: #172641; font-size: 16px; }
.group-title small { display: block; margin-top: 2px; color: #8995a8; }
.group-items { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; padding: 15px 18px 18px; }
.permission-item { min-height: 66px; padding: 11px 12px; display: flex; align-items: flex-start; gap: 10px; border: 1px solid #e8edf2; border-radius: 8px; background: #fff; cursor: pointer; transition: .18s ease; }
.permission-item:hover { border-color: #92d8cb; background: #fbfefd; }
.permission-item.active { border-color: #76cdbd; background: #eefaf7; }
.permission-item /deep/ .ant-checkbox-wrapper { margin-top: 2px; }
.permission-copy { min-width: 0; }
.permission-copy strong { display: block; color: #263653; font-weight: 500; }
.permission-copy small { display: -webkit-box; margin-top: 4px; overflow: hidden; color: #8a96a8; line-height: 1.45; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.footer-count { float: left; margin-top: 8px; color: #76839a; }
@media (max-width: 850px) { .group-items { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
