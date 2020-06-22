<template>
  <el-container class="main_container">
    <el-header>
      <div><img src="../assets/logo.png">电商后台管理系统</div>
      <el-button type="info" @click="exit_handle">退出登录</el-button>
    </el-header>
    <el-container>

      <el-aside :width="is_show? '64px':'200px'">
        <div @click="menu_button" class="menu_button">|||</div>
        <!--        下拉框-->
        <div class="menu_main">
          <el-menu unique-opened :collapse="is_show" :collapse-transition="false" router :default-active="active_path">
          <el-submenu :index="item.id+''" v-for="item in menu_list" :key="item.id">
            <template slot="title">
              <i :class="icon_font[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <el-menu-item-group v-for="child in item.children" :key="child.id">
              <el-menu-item :index="'/' + child.path" @click="active_handle('/' + child.path)"><i class="el-icon-menu"></i>{{child.authName}}</el-menu-item>
            </el-menu-item-group>
          </el-submenu>
        </el-menu>
        </div>

      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  data () {
    return {
      menu_list: [], // 存储侧边导航栏的列表
      icon_font: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      is_show: false, // 控制侧边菜单栏的显示与隐藏
      active_path: '' // 用来存储侧边栏选中的地址，实现高亮功能
    }
  },
  created: function () {
    // 调用methods里面的函数加载左侧菜单栏的数据
    this.load_menu()
    // 从sessionStorage中获取active_path并赋值给data的active_path
    this.active_path = window.sessionStorage.getItem('active_path')
  },
  methods: {

    // 退出登录的处理函数
    exit_handle: function () {
      // 清除token值
      window.sessionStorage.clear()
      // 跳转到登录页面
      this.$router.push('/login')
    },

    // 加载左侧菜单列表的函数
    load_menu: async function () {
      const { data } = await this.$http.get('menus')
      if (data.meta.status !== 200) {
        // 状态码不是200,数据获取失败
        return this.$message.error('列表获取失败！')
      }
      // 菜单栏获取成功
      this.menu_list = data.data
    },

    // 菜单显示隐藏按钮
    menu_button: function () {
      this.is_show = !this.is_show
    },

    // 侧边菜单栏选中连接切换函数
    active_handle: function (path) {
      // 将选中的地址存储到sessionStorage中
      window.sessionStorage.setItem('active_path', path)
      this.active_path = path
    }
  }

}
</script>
<style scoped lang="less">
  .main_container {
    height: 100%;
  }

  .el-aside {
    background: #d3dce6;
    height: 100%;
  }

  .el-header {
    background: #b3c0d1;
    display: flex;
    justify-content: space-between;
    align-items: center;

    > div {
      display: flex;
      align-items: center;
      color: white;

      > img {
        height: 51px;
      }
    }
  }

  .el-main {
    background: #e9eef3;
  }

  .iconfont {
    margin-right: 10px;
  }

  .menu_button {
    background: #909399;
    height: 27px;
    text-align: center;
    line-height: 27px;
    letter-spacing: 3px;
    color: white;
    cursor: pointer;
    position: relative;
  }

  .menu_button:hover {
    color:#409eff;
  }
  .el-menu{
    background:#d3dce6;
  }

</style>
