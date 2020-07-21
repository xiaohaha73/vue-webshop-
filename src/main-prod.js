import Vue from 'vue'
import App from './App.vue'
import router from './router'

// 导入全局样式表
import './assets/css/global.css'

// 导入字体图标
import './assets/fonts/iconfont.css'

// 导入table-tree
import TreeTable from 'vue-table-with-tree-grid'

// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'

Vue.use(VueQuillEditor) // 导入富文本编辑器

// 导入nprogress请求进度条模块
import NProgress from 'nprogress'

// 导入axios进行ajax请求
import axios from 'axios'

// 设置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

// 设置axios拦截器为ajax请求添加请求头
// request请求
axios.interceptors.request.use((config) => {
  // console.log(config)

  // 设置nprogess进度条开始
  NProgress.start()

  // 给config添加一个Authorization的请求头
  config.headers.Authorization = window.sessionStorage.getItem('token')

  // 返回出config对象
  return config
})

// response请求
axios.interceptors.response.use((config) => {

  // 设置nprogess进度条结束
  NProgress.done()

  return config
})

// 将axios挂载到vue的原形中
Vue.prototype.$http = axios

Vue.config.productionTip = false

// 挂载树形表格
Vue.component('tree-table', TreeTable)

// 挂载格式化时间的函数
Vue.filter('format', function (value, arg) {
  function dateFormat (date, format) {
    if (typeof date === 'string') {
      var mts = date.match(/(\/Date\((\d+)\)\/)/)
      if (mts && mts.length >= 3) {
        date = parseInt(mts[2])
      }
    }
    date = new Date(date)
    if (!date || date.toUTCString() === 'Invalid Date') {
      return ''
    }
    var map = {
      M: date.getMonth() + 1, // 月份
      d: date.getDate(), // 日
      h: date.getHours(), // 小时
      m: date.getMinutes(), // 分
      s: date.getSeconds(), // 秒
      q: Math.floor((date.getMonth() + 3) / 3), // 季度
      S: date.getMilliseconds() // 毫秒
    }

    format = format.replace(/([yMdhmsqS])+/g, function (all, t) {
      var v = map[t]
      if (v !== undefined) {
        if (all.length > 1) {
          v = '0' + v
          v = v.substr(v.length - 2)
        }
        return v
      } else if (t === 'y') {
        return (date.getFullYear() + '').substr(4 - all.length)
      }
      return all
    })
    return format
  }

  return dateFormat(value, arg)
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
