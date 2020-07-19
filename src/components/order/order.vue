<template>
  <div>
    <el-breadcrumb separator="/" class="nav_bar">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row>
        <el-col :span="7">
          <el-input placeholder="请输入内容" class="input-with-select" v-model="params.query" clearable @clear="searchHandler">
            <el-button slot="append" icon="el-icon-search" @click="searchHandler"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!--    数据表格-->
      <el-table :data="dataList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status === 1">已付款</el-tag>
            <el-tag type="warning" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template slot-scope="scope">
            {{scope.row.create_time | format('yyyy-MM-dd')}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template>
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="openEditDialog"></el-button>
            <el-button type="success" size="mini" icon="el-icon-location" @click="openLocationDialog"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--    分页功能-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="params.pagenum"
        :page-sizes="[10, 15, 20, 25]"
        :page-size="params.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
      <!--      编辑弹窗-->
      <el-dialog title="收货地址" :visible.sync="editDialogVisible" width="30%" @close="editDialogVisibleClose">
        <el-form :model="location" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
          <el-form-item label="选择收货城市" prop="city">
            <el-cascader
              expand-trigger="hover"
              :options="cascaderOptions"
              :props="cascaderProps"
              v-model="location.city"
              @change="cascaderChange">
            </el-cascader>
          </el-form-item>
          <el-form-item label="详细收货地址" prop="address">
            <el-input v-model="location.address"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editDialogVisibleSubmit">确 定</el-button>
        </div>
      </el-dialog>

      <!--      位置消息弹窗-->
      <el-dialog title="物流信息" :visible.sync="locationDialogVisible" width="50%">
        <el-timeline reverse="reverse">
          <el-timeline-item
            v-for="(activity, index) in expressInformation"
            :key="index"
            :timestamp="activity.time">
            {{activity.context}}
          </el-timeline-item>
        </el-timeline>
      </el-dialog>

    </el-card>
  </div>
</template>

<script>
  import citydata from './citydata'

  export default {
    data () {
      return {
        // 请求数据的参数
        params: {
          query: '',
          pagenum: 1,
          pagesize: 10
        },

        // 获取到的数据总条数
        total: 0,

        // 存放接收到的数据列表
        dataList: [],

        // 编辑弹窗控制
        editDialogVisible: false,

        // 表单验证规则
        rules: {
          city: [
            {
              required: true,
              message: '城市不能为空',
              trigger: 'blur'
            }
          ],
          address: [
            {
              required: true,
              message: '地址不能为空',
              trigger: 'blur'
            }

          ]
        },

        // 级联选择器参数
        cascaderProps: {
          label: 'label', // 显示标签
          value: 'value',
          children: 'children'
        },

        // 级联选择器数据源
        cascaderOptions: citydata,

        // 存放收货地址
        location: {
          city: '',
          address: ''
        },

        // 控制位置信息查询的弹窗
        locationDialogVisible: false,

        // 查询到的物流信息
        expressInformation: []

      }
    },
    created () {
      // 调用获取数据的函数
      this.getData()
    },
    methods: {
      // 定义获取数据的函数
      async getData () {
        const { data: res } = await this.$http.get('/orders', { params: this.params })
        if (res.meta.status !== 200) {
          // 数据请求失败
          return this.$message.error('数据请求失败！')
        }

        // 请求数据成功
        this.total = res.data.total
        this.dataList = res.data.goods
        // console.log(this.total)
      },

      // 搜索功能函数
      searchHandler () {
        this.getData()
        // console.log(this.params.query)
      },

      // 页面选中函数
      handleCurrentChange (page) {
        this.params.pagenum = page
        this.getData()
      },

      // 页面显示条数改变函数
      handleSizeChange (num) {
        this.params.pagesize = num
        this.getData()
      },

      // 编辑弹窗打开函数
      openEditDialog () {
        this.editDialogVisible = true
      },

      // 级联选择器选择函数
      cascaderChange () {
      },

      // 编辑弹窗关闭函数
      editDialogVisibleClose () {
        this.location.city = this.location.address = ''
      },

      // 编辑弹窗提交函数
      editDialogVisibleSubmit () {
      },

      // 控制位置信息弹窗打开的函数
      async openLocationDialog () {
        this.locationDialogVisible = true
        // 查询位置消息
        const { data: res } = await this.$http.get('/kuaidi/1106975712662')

        if (res.meta.status !== 200) {
          return this.$message.error('获取物流信息失败！')
        }

        // 获取成功
        this.expressInformation = res.data
        // console.log(this.expressInformation)
      }
    }
  }
</script>

<style scoped lang="less">
  .el-card {
    margin-top: 15px
  }

  .el-table {
    margin-top: 15px
  }

  .el-pagination {
    margin-top: 20px;
  }
</style>
