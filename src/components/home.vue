<template>
<div>
  <el-button type="info" @click="exit_handle">退出登录</el-button>
</div>
</template>

<script>
export default {
  data () {
    return {

    }
  },
  methods: {
    // 退出登录的处理函数
    exit_handle: function () {
      // 清除token值
      window.sessionStorage.clear()
      // 跳转到登录页面
      this.$router.push('/login')
    }
  }

}
</script>

<style scoped>

</style>
