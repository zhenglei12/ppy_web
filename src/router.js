import Vue from "vue";
import Router from "vue-router";

import Auth from "./libs/auth";
import Acl from "./libs/acl";

Vue.use(Router);

const originalPush = Router.prototype.push;
Router.prototype.push = function push(location, onResolve, onReject) {
  if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject);
  return originalPush.call(this, location).catch((err) => err);
};

const routes = [
  {
    path: "/",
    component: () => import("./pages/Layout"),
    children: [
      {
        path: "",
        redirect: "home",
      },
      {
        path: "home",
        name: "home",
        component: () => import("./pages/business/Overview"),
        meta: { title: "经营总览", acl: "dashboard.view" },
      },
      {
        path: "sales-entry",
        name: "sales-entry",
        component: () => import("./pages/business/SalesEntry"),
        meta: { title: "销售入单", acl: "sales.order.create" },
      },
      {
        path: "sales",
        name: "sales-dashboard",
        component: () => import("./pages/business/Sales"),
        meta: { title: "销售看板", acl: "sales.dashboard.view" },
      },
      {
        path: "delivery",
        name: "delivery",
        component: () => import("./pages/business/Delivery"),
        meta: { title: "优化交付", acl: "delivery.project.view" },
      },
      {
        path: "finance",
        name: "finance-dashboard",
        component: () => import("./pages/business/Finance"),
        meta: { title: "财务看板", acl: "finance.view" },
      },
      {
        path: "hr",
        name: "hr-dashboard",
        component: () => import("./pages/business/HumanResources"),
        meta: { title: "人事管理" },
      },
      {
        path: "crm",
        name: "crm-dashboard",
        component: () => import("./pages/business/Crm"),
        meta: { title: "电销 CRM", acl: "sales.customer.view" },
      },
      {
        path: "person",
        name: "person",
        component: () => import("./pages/person/List"),
        meta: {
          group: "user",
          acl: "user-list",
        },
      },
      {
        path: "payroll",
        name: "payroll",
        component: () => import("./pages/payroll/List"),
        meta: {
          title: "工资管理",
          group: "user",
          acl: "hr.payroll.view",
        },
      },
      {
        path: "role",
        name: "role",
        component: () => import("./pages/role/List"),
        meta: {
          group: "user",
          acl: "role-list",
        },
      },
      {
        path: "department",
        name: "department",
        component: () => import("./pages/department/List"),
        meta: {
          group: "user",
          acl: "department-list",
        },
      },
      {
        path: "order",
        name: "order",
        component: () => import("./pages/order/List"),
        meta: {
          title: "订单管理",
          acl: "sales.order.view",
        },
      },
      {
        path: "classify",
        name: "classify",
        component: () => import("./pages/classify/List"),
      },
      {
        path: "device",
        name: "comprehensive-device",
        component: () => import("./pages/device/List"),
        meta: {
          acl: "device-list",
        },
      },
      {
        path: "operation-account",
        name: "comprehensive-operation-account",
        component: () => import("./pages/operationAccount/List"),
        meta: {
          acl: "operation_account-list",
        },
      },
      {
        path: "statistic/all",
        name: "statistic-all",
        component: () => import("./pages/statistic/All"),
      },
      {
        path: "statistic/day",
        name: "statistic-day",
        component: () => import("./pages/statistic/Day"),
      },
      {
        path: "statistic/user",
        name: "statistic-user",
        component: () => import("./pages/statistic/User"),
      },
      {
        path: "editorder",
        name: "statistic-order",
        component: () => import("./pages/statistic/Order"),
      },
      {
        path: "manuscript",
        name: "manuscript",
        component: () => import("./pages/manuscript/List.vue"),
      },
      {
        path: "test",
        name: "test",
        component: () => import("./pages/Test"),
      },
      {
        path: "/403",
        name: "403",
        component: () => import("./pages/exception/403"),
      },
      {
        path: "/404",
        name: "404",
        component: () => import("./pages/exception/404"),
      },
      {
        path: "*",
        redirect: "/404",
      },
    ],
  },
  {
    path: "/login",
    name: "login",
    component: () => import("./pages/Login"),
  },
];

const router = new Router({
  mode: "history",
  scrollBehavior(to) {
    if (to.hash) {
      return {
        selector: to.hash,
      };
    } else {
      return {
        x: 0,
        y: 0,
      };
    }
  },
  routes,
});

router.beforeEach((to, _from, next) => {
  document.title = `${(to.meta && to.meta.title) || "经营系统"} - 朴朴鹰`;
  if (to.name != "login") {
    Promise.all([Auth.check(), Acl.check()])
      .then(() => {
        if (to.meta && to.meta.acl && !Acl.verify(to.meta.acl)) {
          next({
            name: "403",
          });
        } else {
          next();
        }
      })
      .catch(() => {
        next({
          name: "login",
        });
      });
  } else {
    next();
  }
});

export default router;
