import { defineStore } from "pinia";
export default defineStore({
  id: "index",
  state: () => {
    return {
      isLogin: false
    };
  },
  actions: {
    setIsLogin(value) {
      this.isLogin = value;
    }
  }
});