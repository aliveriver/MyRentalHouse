<template>
  <div class="common-layout">
    <el-container>
      <el-aside class="aside">
        <el-menu
          class="menu"
          background-color="#181818"
          text-color="#fff"
          active-text-color="#ffd04b"
        >
          <div class="header-left">
            <el-icon><Menu /></el-icon>
            <h2>二手房管理平台</h2>
          </div>
          <router-link
            v-for="(item, index) in store.routes"
            :to="item.path"
            :key="index"
          >
            <el-menu-item :index="index" v-if="!item.meta.isHidden">
              <el-icon>
                <component :is="item.meta.icon"></component>
              </el-icon>
              <span>{{ item.meta.title }}</span>
            </el-menu-item>
          </router-link>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header class="header">
          <el-dropdown v-if="store.isLogin">
            <div>
              <el-avatar
                :size="44"
                src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
              />
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="logout">退出</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <router-link to="/login" v-else class="toLogin">登录</router-link>
        </el-header>
        <el-main class="main">
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import useStore from "../store/index";
import { useRouter } from "vue-router";
const router = useRouter();
const store = useStore();

const logout = () => {
  store.logout();
  router.push("/login");
};
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;
  padding: 20px 30px;
  overflow: hidden;
}

.header-left {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  height: 60px;
  background-color: #0052D9;

  .el-icon {
    font-size: 24px;
  }

  h2 {
    font-weight: 400;
    font-size: 15px;
    padding-left: 10px;
  }
}

.aside {
  width: 180px;
  .menu {
    height: 100vh;
  }
}

.main {
  margin: 20px;
  background-color: #fff;
  max-height: calc(100vh - 100px);
  overflow: auto;
}
</style>
