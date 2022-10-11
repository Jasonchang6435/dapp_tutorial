import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/demo",
    name: "Demo",
    component: () => import("@/views/Dapp/demo.vue"),
  },
  {
    path: "/",
    name: "Entry",
    component: () => import("@/views/Entry/index.vue"),
  },
  {
    path: "/form",
    name: "NFTForm",
    component: () => import("@/views/NFTForm/HomeIndex.vue"),
    props: (route) => ({ query: route.query.email }),
  },
  {
    path: "/:pathMatch(.*)",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach((to, from, next) => {
  if (to.meta.role === "user") {
    if (!sessionStorage.getItem("user-token")) {
      next("/");
      return;
    }
  }
  next();
});

export default router;
