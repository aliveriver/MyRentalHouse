import { defineStore } from "pinia";
export default defineStore({
  id: "index",
  state: () => {
    return {
      isLogin: false,
      routes: [],
    };
  },
  actions: {
    setIsLogin(value) {
      this.isLogin = value;
    },
    setRoutes(route) {
      this.route = route;
    },
  },
  getters: {
    getRoutes() {
      return this.routes;
    },
  },
});
