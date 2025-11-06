<template>
  <div class="common-layout">
    <el-container>
      <el-aside class="aside">
        <el-menu
          class="menu"
          background-color="#181818"
          text-color="#fff"
          active-text-color="#ffd04b"
          :default-active="activeMenuIndex"
          mode="vertical"
        >
          <div class="header-left">
            <el-icon><Menu /></el-icon>
            <h2>二手房管理平台</h2>
          </div>
          <router-link
            v-for="(item, index) in store.routes"
            :to="item.path === '' ? '/' : '/' + item.path"
            :key="index"
          >
            <el-menu-item
              :index="item.path === '' ? '/' : '/' + item.path"
              v-if="!item.meta.isHidden"
            >
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
                <el-dropdown-item @click="showFavorites"
                  >我的收藏</el-dropdown-item
                >
                <el-dropdown-item @click="showAppointments"
                  >我的预约</el-dropdown-item
                >
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

    <!-- 我的收藏对话框 -->
    <el-dialog
      v-model="favoritesDialogVisible"
      title="我的收藏"
      width="60%"
      max-width="1200px"
      class="favorites-dialog"
      draggable
    >
      <div class="favorites-content">
        <div class="favorites-header">
          <span class="total-count">共 {{ favoritesTotal }} 个收藏</span>
        </div>

        <div class="favorites-list" v-loading="favoritesLoading">
          <div class="favorites-grid">
            <div
              v-for="house in favoritesList"
              :key="house.propertyid"
              class="favorite-card"
            >
              <div
                class="card-image"
                @click="goToHouseDetail(house.propertyid)"
              >
                <img
                  :src="house.image || defaultHouseImage"
                  :alt="house.title"
                />
                <div class="card-overlay">
                  <el-button type="primary" size="small">查看详情</el-button>
                </div>
              </div>

              <div class="card-content">
                <div class="card-header">
                  <h4
                    class="house-title"
                    @click="goToHouseDetail(house.propertyid)"
                  >
                    {{ house.title }}
                  </h4>
                  <div class="card-actions">
                    <el-button
                      type="success"
                      :icon="Calendar"
                      @click="quickAppointment(house.propertyid)"
                      size="small"
                      circle
                      title="预约看房"
                    />
                    <el-button
                      :type="'danger'"
                      :icon="'StarFilled'"
                      @click="removeFavorite(house.propertyid)"
                      :loading="house.removing"
                      size="small"
                      circle
                      title="取消收藏"
                    />
                  </div>
                </div>

                <div class="house-price">
                  <span class="price">¥{{ house.price }}</span>
                  <span class="unit-price"
                    >{{ (house.price * 10000 / house.area).toFixed(0)













                    }}元/m²</span
                  >
                </div>

                <div class="house-details">
                  <div class="detail-item">
                    <span class="label">户型：</span>
                    <span class="value">{{ house.layout }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">面积：</span>
                    <span class="value">{{ house.area }}m²</span>
                  </div>
                </div>

                <div class="house-address">
                  <el-icon><Location /></el-icon>
                  <span>{{ house.address }}</span>
                </div>

                <div class="house-status">
                  <el-tag
                    :type="house.status === '在售' ? 'success' : 'info'"
                    size="small"
                  >
                    {{ house.status }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>

          <el-empty
            v-if="!favoritesLoading && favoritesList.length === 0"
            description="暂无收藏的房源"
          />
        </div>
      </div>
    </el-dialog>

    <!-- 我的预约对话框 -->
    <el-dialog
      v-model="appointmentsDialogVisible"
      title="我的预约"
      width="60%"
      max-width="1200px"
      draggable
      class="appointments-dialog"
    >
      <div class="appointments-content">
        <div class="appointments-header">
          <span class="total-count">共 {{ appointmentsTotal }} 个预约</span>
        </div>

        <div class="appointments-list" v-loading="appointmentsLoading">
          <div class="appointments-table">
            <el-table :data="appointmentsList" style="width: 100%">
              <el-table-column label="房源信息" min-width="250">
                <template #default="scope">
                  <div class="house-info-cell">
                    <div
                      class="house-title"
                      @click="goToHouseDetail(scope.row.propertyid)"
                    >
                      {{ scope.row.houseTitle || '房源标题' }}
                    </div>
                    <div class="house-address">
                      {{ scope.row.houseAddress || '房源地址' }}
                    </div>
                    <div class="house-price">
                      ¥{{ scope.row.housePrice || '未知' }}
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                prop="appointmenttime"
                label="预约时间"
                width="180"
              >
                <template #default="scope">
                  {{ formatDateTime(scope.row.appointmenttime) }}
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag
                    :type="getStatusTagType(scope.row.status)"
                    size="small"
                  >
                    {{ scope.row.status }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="180">
                <template #default="scope">
                  <div class="action-buttons">
                    <el-button
                      v-if="scope.row.status === '已预约'"
                      type="primary"
                      size="small"
                      @click="signContract(scope.row)"
                      :loading="scope.row.signing"
                    >
                      签合同
                    </el-button>
                    <el-button
                      type="danger"
                      size="small"
                      @click="deleteAppointment(scope.row.appointmentid)"
                      :loading="scope.row.deleting"
                    >
                      删除
                    </el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <el-empty
            v-if="!appointmentsLoading && appointmentsList.length === 0"
            description="暂无预约记录"
          />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import useStore from "../store/index";
import { useRouter, useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from 'element-plus'
import { Location, StarFilled, Calendar } from '@element-plus/icons-vue'
import { usersApi, favoritesApi, propertiesApi, viewingAppointmentsApi, contractsApi } from "../api/index";

const router = useRouter();
const route = useRoute();
const store = useStore();

// 菜单激活状态
const activeMenuIndex = ref('/')

// 根据当前路由设置激活菜单
const setActiveMenu = () => {
  const currentPath = route.path

  // 处理特殊路由匹配
  if (currentPath === '/' || currentPath === '') {
    activeMenuIndex.value = '/'
  } else if (currentPath.startsWith('/house/list') || currentPath.startsWith('/house/add')) {
    activeMenuIndex.value = '/house/list'
  } else if (currentPath.startsWith('/house/info')) {
    activeMenuIndex.value = '/house/info'
  } else if (currentPath.startsWith('/info/list') || currentPath.startsWith('/info/list/add')) {
    activeMenuIndex.value = '/info/list'
  } else if (currentPath.startsWith('/appointments')) {
    activeMenuIndex.value = '/appointments'
  } else if (currentPath.startsWith('/contracts')) {
    activeMenuIndex.value = '/contracts'
  } else if (currentPath.startsWith('/person')) {
    activeMenuIndex.value = '/person'
  } else {
    // 默认匹配
    const matchedRoute = store.routes.find(routeItem => {
      const routePath = routeItem.path === '' ? '/' : '/' + routeItem.path
      return currentPath.startsWith(routePath)
    })
    if (matchedRoute) {
      activeMenuIndex.value = matchedRoute.path === '' ? '/' : '/' + matchedRoute.path
    }
  }
}

// 监听路由变化
watch(() => route.path, () => {
  setActiveMenu()
}, { immediate: true })

// 组件挂载时设置激活菜单
onMounted(() => {
  setActiveMenu()
})

// 收藏相关状态
const favoritesDialogVisible = ref(false)
const favoritesList = ref([])
const favoritesTotal = ref(0)
const favoritesPage = ref(1)
const favoritesPageSize = ref(10)
const favoritesLoading = ref(false)
const defaultHouseImage = 'https://img.zx123.cn/Resources/zx123cn/uploadfile/2020/0507/6bf211145acaf9038e4278f6de6a50eb.jpg'

// 预约相关状态
const appointmentsDialogVisible = ref(false)
const appointmentsList = ref([])
const appointmentsTotal = ref(0)
const appointmentsLoading = ref(false)

// 显示收藏列表
const showFavorites = () => {
  favoritesDialogVisible.value = true
  favoritesPage.value = 1
  loadFavorites()
}

// 加载收藏列表
const loadFavorites = async () => {
  favoritesLoading.value = true
  try {
    const houseAll = await propertiesApi.getAllProperties()
    const favorites = await favoritesApi.getFavorites(favoritesPage.value, favoritesPageSize.value)
    if (houseAll.success && favorites.success) {
      const filterData = houseAll.data.filter(house => {
        return favorites.data.data.some(fav => {
          return fav.propertyId === house.propertyid
        })
      })

      // 将过滤后的数据赋值给收藏列表，并添加额外属性
      favoritesList.value = filterData.map(house => ({
        ...house,
        removing: false // 用于控制取消收藏按钮的loading状态
      }))
      favoritesTotal.value = favorites.data.total || filterData.length
    } else {
      ElMessage.error('获取房源列表失败，请稍后再试。')
    }

  } catch (error) {
    console.error('获取收藏列表失败:', error)
    ElMessage.error('获取收藏列表失败，请稍后再试')
  } finally {
    favoritesLoading.value = false
  }
}

// 分页变化处理
const handlePageChange = (page) => {
  favoritesPage.value = page
  loadFavorites()
}

const handleSizeChange = (size) => {
  favoritesPageSize.value = size
  favoritesPage.value = 1
  loadFavorites()
}

// 跳转到房源详情
const goToHouseDetail = (propertyId) => {
  favoritesDialogVisible.value = false
  router.push(`/house/detail/${propertyId}`)
}

// 取消收藏
const removeFavorite = async (propertyId) => {
  try {
    await ElMessageBox.confirm('确定要取消收藏这个房源吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 设置loading状态
    const house = favoritesList.value.find(h => h.propertyid === propertyId)
    if (house) house.removing = true

    const response = await favoritesApi.removeFavorite(propertyId)
    if (response.success) {
      ElMessage.success('取消收藏成功')
      // 重新加载收藏列表
      loadFavorites()
    } else {
      ElMessage.error(response.errorMsg || '取消收藏失败')
      if (house) house.removing = false
    }
  } catch (error) {
    if (error === 'cancel') {
      return // 用户取消操作
    }
    console.error('取消收藏失败:', error)
    ElMessage.error('取消收藏失败，请稍后再试')
    const house = favoritesList.value.find(h => h.propertyid === propertyId)
    if (house) house.removing = false
  }
}

// 显示预约列表
const showAppointments = () => {
  appointmentsDialogVisible.value = true
  loadAppointments()
}

// 加载预约列表
const loadAppointments = async () => {
  appointmentsLoading.value = true
  try {
    const response = await viewingAppointmentsApi.getAllAppointments()
    if (response.success) {
      // 获取房源信息来丰富预约数据
      const houseResponse = await propertiesApi.getAllProperties()
      if (houseResponse.success) {
        appointmentsList.value = response.data.map(appointment => {
          const house = houseResponse.data.find(h => h.propertyid === appointment.propertyid)
          return {
            ...appointment,
            houseTitle: house?.title || '未知房源',
            houseAddress: house?.address || '未知地址',
            housePrice: house?.price || 0,
            deleting: false,
            signing: false
          }
        })
      } else {
        appointmentsList.value = response.data.map(appointment => ({
          ...appointment,
          deleting: false,
          signing: false
        }))
      }
      appointmentsTotal.value = response.data.length
    } else {
      ElMessage.error(response.errorMsg || '获取预约列表失败')
    }
  } catch (error) {
    console.error('获取预约列表失败:', error)
    ElMessage.error('获取预约列表失败，请稍后再试')
  } finally {
    appointmentsLoading.value = false
  }
}

// 删除预约
const deleteAppointment = async (appointmentId) => {
  try {
    await ElMessageBox.confirm('确定要删除这个预约吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 设置loading状态
    const appointment = appointmentsList.value.find(a => a.appointmentid === appointmentId)
    if (appointment) appointment.deleting = true

    const response = await viewingAppointmentsApi.deleteAppointment(appointmentId)
    if (response.success) {
      ElMessage.success('删除预约成功')
      // 重新加载预约列表
      loadAppointments()
    } else {
      ElMessage.error(response.errorMsg || '删除预约失败')
      if (appointment) appointment.deleting = false
    }
  } catch (error) {
    if (error === 'cancel') {
      return // 用户取消操作
    }
    console.error('删除预约失败:', error)
    ElMessage.error('删除预约失败，请稍后再试')
    const appointment = appointmentsList.value.find(a => a.appointmentid === appointmentId)
    if (appointment) appointment.deleting = false
  }
}

// 格式化日期时间
const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '未知时间'
  try {
    const date = new Date(dateTimeStr)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return '格式错误'
  }
}

// 获取状态标签类型
const getStatusTagType = (status) => {
  switch (status) {
    case '待审批':
      return 'warning'
    case '已预约':
      return 'success'
    case '已取消':
      return 'danger'
    default:
      return 'info'
  }
}

// 快速预约房源
const quickAppointment = (propertyId) => {
  // 跳转到房源详情页并触发预约
  router.push(`/house/detail/${propertyId}`)
  ElMessage.info('已跳转到房源详情页，请点击"预约看房"按钮进行预约')
}

// 签署合同
const signContract = (appointment) => {
  // 关闭预约对话框
  appointmentsDialogVisible.value = false

  // 跳转到签合同页面，传递房源ID和预约ID
  router.push({
    path: `/contract/sign/${appointment.propertyid}`,
  })
}

const logout = async () => {
  try {
    // JWT认证不需要调用后端登出API，直接清除前端token即可
    // 清除前端状态和JWT token
    store.logout();
    ElMessage.success('退出成功');
    router.push("/login");
  } catch (error) {
    console.error('Logout error:', error);
    // 即使出错也清除前端状态
    store.logout();
    ElMessage.warning('登出成功');
    router.push("/login");
  }
};
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: flex-end;
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

/* 对话框样式 */
:deep(.favorites-dialog) {
  .el-dialog__body {
    padding: 20px;
  }
}

/* 收藏列表样式 */
.favorites-content {
  .favorites-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #ebeef5;

    .total-count {
      font-size: 14px;
      color: #666;
    }
  }

  .favorites-list {
    min-height: 400px;

    .favorites-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .favorite-card {
      background: #fff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      }

      .card-image {
        position: relative;
        height: 200px;
        overflow: hidden;
        cursor: pointer;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .card-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        &:hover {
          img {
            transform: scale(1.05);
          }

          .card-overlay {
            opacity: 1;
          }
        }
      }

      .card-content {
        padding: 16px;

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;

          .house-title {
            font-size: 16px;
            font-weight: 600;
            color: #303133;
            margin: 0;
            line-height: 1.4;
            cursor: pointer;
            flex: 1;
            margin-right: 8px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;

            &:hover {
              color: #409eff;
            }
          }

          .card-actions {
            display: flex;
            gap: 8px;
            flex-shrink: 0;

            .el-button {
              transition: all 0.3s ease;

              &.el-button--success {
                color: #67c23a;
                border-color: #67c23a;

                &:hover {
                  background-color: #67c23a;
                  color: white;
                }
              }

              &.el-button--danger {
                color: #f56c6c;
                border-color: #f56c6c;

                &:hover {
                  background-color: #f56c6c;
                  color: white;
                }
              }
            }
          }
        }

        .house-price {
          margin-bottom: 12px;

          .price {
            font-size: 20px;
            font-weight: 700;
            color: #f56c6c;
          }

          .unit-price {
            font-size: 12px;
            color: #909399;
            margin-left: 8px;
          }
        }

        .house-details {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;

          .detail-item {
            .label {
              font-size: 12px;
              color: #909399;
            }

            .value {
              font-size: 14px;
              color: #606266;
              font-weight: 500;
            }
          }
        }

        .house-address {
          display: flex;
          align-items: center;
          font-size: 13px;
          color: #909399;
          margin-bottom: 12px;

          .el-icon {
            margin-right: 4px;
            font-size: 14px;
          }

          span {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        .house-status {
          display: flex;
          justify-content: flex-end;
        }
      }
    }
  }
}

// 预约对话框样式
.appointments-dialog {
  .appointments-content {
    .appointments-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding: 15px 0;
      border-bottom: 1px solid #e4e7ed;

      .total-count {
        font-size: 16px;
        color: #606266;
        font-weight: 500;
      }
    }

    .appointments-table {
      .house-info-cell {
        .house-title {
          font-size: 14px;
          font-weight: 600;
          color: #409eff;
          cursor: pointer;
          margin-bottom: 4px;
          line-height: 1.4;

          &:hover {
            text-decoration: underline;
          }
        }

        .house-address {
          font-size: 12px;
          color: #909399;
          margin-bottom: 4px;
          line-height: 1.3;
        }

        .house-price {
          font-size: 14px;
          color: #f56c6c;
          font-weight: 600;
        }
      }

      .action-buttons {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;

        .el-button {
          margin: 0;
        }
      }

      .el-table .cell {
        padding: 8px 0;
      }
    }

    .el-empty {
      padding: 60px 0;
    }
  }
}
</style>
