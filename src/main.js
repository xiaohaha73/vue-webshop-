import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'

// 导入全局样式表
import './assets/css/global.css'

// 导入字体图标
import './assets/fonts/iconfont.css'

// 导入axios进行ajax请求
import axios from 'axios'
// 设置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

// 设置axios拦截器为ajax请求添加请求头
axios.interceptors.request.use((config) => {
  console.log(config)

  // 给config添加一个Authorization的请求头
  config.headers.Authorization = window.sessionStorage.getItem('token')

  // 返回出config对象
  return config
})

// 将axios挂载到vue的原形中
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
