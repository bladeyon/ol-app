import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { installRouter } from "/@/router";

const vm = createApp(App);

installRouter(vm);

vm.mount("#app");
