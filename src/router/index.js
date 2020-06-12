import Vue from 'vue'
import VueRouter from 'vue-router'
import login from '../components/login.vue'
import home from '../components/home.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' }, // 访问首页时重定向到登录页面
  { path: '/login', component: login },
  { path: '/home', component: home } // home页面的路由
]

const router = new VueRouter({
  routes
})

// 路由导航守卫
router.beforeEach((to, from, next) => {
  // 获取浏览器存储的token值进行判断是否是登录状态
  const loginToken = window.sessionStorage.getItem('token')
  if (loginToken) { // token值存在的情况
    next()
  } else { // token值不存在的情况
    if (to.path === '/login') {
      next() // token值不存在，是在login界面的情况
    } else { // token值不存在，不是在login界面的情况
      next('/login')
    }
  }
})

export default router
