<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import HelloWorld from "./components/HelloWorld.vue";
import { useRouter } from "vue-router";
import { ref } from "vue";
const router = useRouter();

const menuRef = ref();
const routes = router.getRoutes();
menuRef.value = routes.map((item) => ({ path: item.path, label: item.name }));
</script>

<template>
  <!-- <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld msg="Vite + Vue" /> -->
  <div class="page">
    <ul class="menu">
      <li v-for="item in menuRef">
        <router-link :to="item.path">{{ item.label }}</router-link>
      </li>
    </ul>
    <div class="main">
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
    </div>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

.page {
  display: flex;
  width: 100%;
  height: 100%;
}

.menu {
  width: 15vw;
  height: 100%;
}

.page {
  flex: 1;
}
</style>
