<template>
  <div class="common-layout">
    <el-container>
      <el-header class="header">
        <h2>微商城后台管理系统</h2>
        <el-dropdown v-if="store.isLogin">
          <div><el-avatar :size="44" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" /></div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="logout">退出</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <router-link to="/login" v-else class="toLogin">登录</router-link>
        
      </el-header>
      <el-container>
        <el-aside class="aside">
          <el-menu class="menu">
            <el-menu-item index="1">
              <router-link to="/">
                <el-icon>
                  <HomeFilled />
                </el-icon>
                <span>首页</span>
              </router-link>
            </el-menu-item>
            <el-menu-item index="2">
              <router-link to="/classify">
                <el-icon>
                  <Histogram />
                </el-icon>
                <span>分类管理</span>
              </router-link>
            </el-menu-item>
            <el-menu-item index="3">
              <router-link to="/commodity">
                <el-icon>
                  <Briefcase />
                </el-icon>
                <span>商品管理</span>
              </router-link>
            </el-menu-item>
            <el-menu-item index="4">
              <router-link to="/person">
                <el-icon>
                  <Setting />
                </el-icon>
                <span>个人中心</span>
              </router-link>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-main class="main">
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import useStore from "../store/index"
import { useRouter } from "vue-router"
const router = useRouter();
const store = useStore()

const logout = () => {
  store.setIsLogin(false)
  router.push("/login")
}
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: space-between;
  color: #fff;
  background-color: #6699ff;
  height: 80px;
  line-height: 40px;
  padding: 20px 30px;
  overflow: hidden;

  h2 {
    font-weight: 400;
    font-size: 20px;
    border-left: 1px solid #fff;
    padding-left: 10px;
  }
  .toLogin {
    color: #fff;
  }
}

.aside {
  width: 180px;

  .menu {
    height: calc(100vh - 80px);
  }
}

.main {
  margin: 20px;
  background-color: #fff;
}
</style>