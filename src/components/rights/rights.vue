<template>
<div>
  <el-breadcrumb separator="/" class="nav_bar">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>权限管理</el-breadcrumb-item>
    <el-breadcrumb-item>权限列表</el-breadcrumb-item>
  </el-breadcrumb>

  <el-card>
    <el-table :data="dataList" stripe border>
      <el-table-column type="index" label="#"></el-table-column>
      <el-table-column label="权限说明" prop="authName"></el-table-column>
      <el-table-column label="路径" prop="path"></el-table-column>
      <el-table-column label="权限等级" prop="level">
        <template slot-scope="scope">
          <el-tag type="success" v-if="scope.row.level === '1'">1级</el-tag>
          <el-tag type="warning" v-else-if="scope.row.level === '2'">2级</el-tag>
          <el-tag type="danger" v-else>3级</el-tag>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</div>
</template>

<script>
export default {
  data () {
    return {
      dataList: []
    }
  },
  created () {
    // 初始化数据列表
    this.getData()
  },
  methods: {
    // 获取数据的函数
    getData: async function () {
      const { data: res } = await this.$http.get('/rights/list')
      if (res.meta.status !== 200) {
        // 请求失败
        return this.$message.error('数据获取失败！')
      }
      // 获取成功

      this.dataList = res.data
      // console.log(this.dataList)
    }
  }
}
</script>

<style scoped lang="less">
.el-card{
  margin-top:20px;
}
</style>
