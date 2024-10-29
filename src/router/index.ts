import type { App } from "vue";
import { createRouter, createWebHistory } from "vue-router";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      name: "basic",
      path: "/basic",
      component: () => import("/@/views/basic/index.vue"),
      children: []
    },
    {
      name: "china",
      path: "/china",
      component: () => import("/@/views/basic/ChinaMap.vue")
    },
    {
      name: "draw",
      path: "/draw",
      component: () => import("/@/views/basic/DrawMap.vue")
    },
    {
      name: "drawPoint",
      path: "/drawPoint",
      component: () => import("/@/views/basic/DrawPoint.vue")
    },
    {
      name: "drawPolygon",
      path: "/drawPolygon",
      component: () => import("/@/views/basic/DrawPolygon.vue")
    },
    {
      name: "basin1",
      path: "/basin1",
      component: () => import("/@/views/basic/Basin1.vue")
    },
    {
      name: "basin2",
      path: "/basin2",
      component: () => import("/@/views/basic/Basin2.vue")
    },
    {
      name: "basin3",
      path: "/basin3",
      component: () => import("/@/views/basic/Basin3.vue")
    }
  ]
});

export function installRouter(vm: App<Element>) {
  vm.use(router);
}
