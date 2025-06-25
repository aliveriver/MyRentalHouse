import { defineStore } from "pinia";
export default defineStore({
  id: "index",
  state: () => {
    return {
      isLogin: false,
      routes: [],
      userInfo: null,
    };
  },
  actions: {
    setIsLogin(value) {
      this.isLogin = value;
    },
    setRoutes(route) {
      this.route = route;
    },
    setUserInfo(userInfo) {
      this.userInfo = userInfo;
    },
    logout() {
      this.isLogin = false;
      this.userInfo = null;
      localStorage.removeItem('token');
    },
  },
  getters: {
    getRoutes() {
      return this.routes;
    },
    getUserInfo() {
      return this.userInfo;
    },
  },
});
