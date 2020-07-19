<template>
  <div>
    <el-breadcrumb separator="/" class="nav_bar">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <div id="main" style="width: 800px;height:400px;"></div>
    </el-card>
  </div>
</template>

<script>
  // 导入echarts
  import echarts from 'echarts'
  // 导入lodash合并对象
  import lodash from 'lodash'
  export default {
    data () {
      return {
        // 需要合并的options数据
        options: {
          title: {
            text: '用户来源'
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              label: {
                backgroundColor: '#E9EEF3'
              }
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: [
            {
              boundaryGap: false
            }
          ],
          yAxis: [
            {
              type: 'value'
            }
          ]
        }
      }
    },
    created () {},
    async mounted () {
      // 生成表格需要在dom加载完成后的mouted生命周期函数中进行，否则会报错
      // 基于准备好的dom，初始化echarts实例
      const myChart = echarts.init(document.getElementById('main'))

      // 指定图表的配置项和数据
      // 请求数据
      const {data:res} = await this.$http.get('reports/type/1')
      if (res.meta.status !== 200) {
        // 数据获取失败
        return this.$message.error('数据获取失败！')
      }

      // 合并options对象
      const result = lodash.merge(res.data,this.options)

      // 使用刚指定的配置项和数据显示图表。
      myChart.setOption(result)
    },
    methods: {}
  }
</script>

<style scoped lang="less">
  .el-card {
    margin-top: 15px
  }
</style>
