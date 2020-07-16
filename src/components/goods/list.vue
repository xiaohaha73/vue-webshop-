<template>
<div>
  <el-breadcrumb separator="/" class="nav_bar">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>商品管理</el-breadcrumb-item>
    <el-breadcrumb-item>商品列表</el-breadcrumb-item>
  </el-breadcrumb>
  <el-card>
    <el-row :gutter="15">
      <el-col :span="5">
        <el-input placeholder="请输入内容" v-model="goodsParams.query" class="input-with-select" clearable @clear="searchHandler">
          <el-button slot="append" icon="el-icon-search" @click="searchHandler"></el-button>
        </el-input>
      </el-col>
      <el-col  :span="5">
        <el-button type="primary" @click="addGoods">添加商品</el-button>
      </el-col>
    </el-row>

<!--    数据表格-->
    <el-table stripe border :data="goodsList">
      <el-table-column  type="index"></el-table-column>
      <el-table-column  prop="goods_name" label="商品名称"></el-table-column>
      <el-table-column  prop="goods_price" label="商品价格(元)" width="90px"></el-table-column>
      <el-table-column  prop="goods_weight" label="商品质量" width="90px"></el-table-column>
      <el-table-column  label="创建时间" width="170px">
        <template slot-scope="scope">
          {{scope.row.add_time| format("yyyy-MM-dd hh:mm:ss")}}
        </template>
      </el-table-column>
      <el-table-column  label="操作" width="200px">
        <template slot-scope="scope">
          <el-button  size="mini" type="primary" icon="el-icon-edit" @click="editHandler(scope.row.goods_id)"></el-button>
          <el-button  size="mini" type="danger" icon="el-icon-delete" @click="deleteHandler(scope.row.goods_id)"></el-button>
        </template>
      </el-table-column>
    </el-table>

<!--    分页功能-->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="goodsParams.pagenum"
      :page-sizes="[3, 5, 10, 15]"
      :page-size="goodsParams.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="goodsTotal" background>
    </el-pagination>

    <!--    编辑弹出框-->
    <el-dialog title="编辑商品"
               :visible.sync="editDialogVisible"
               width="50%" @close="editDialogClose">
      <el-form ref="editDialog" :rules="editDialogRules" :model="editDialogData">
        <el-form-item prop="goods_name" >
          <span>商品名称</span>
          <el-input v-model="editDialogData.goods_name"></el-input>
        </el-form-item>
        <el-form-item prop="goods_price" >
          <span>商品价格</span>
          <el-input v-model="editDialogData.goods_price" type="number"></el-input>
        </el-form-item>
        <el-form-item prop="goods_number" >
          <span>商品数量</span>
          <el-input v-model="editDialogData.goods_number" type="number"></el-input>
        </el-form-item>
        <el-form-item prop="goods_weight" >
          <span>商品质量</span>
          <el-input v-model="editDialogData.goods_weight" type="number"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
      <el-button @click="editDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="editConfirm">确 定</el-button>
    </span>
    </el-dialog>
  </el-card>
</div>
</template>

<script>
export default {
  data: function () {
    return {
      // 获取商品列表的请求参数
      goodsParams: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },

      // 存储请求到的商品数据
      goodsList: [],
      // 存储总的数据条数
      goodsTotal: 0,

      // 编辑商品弹窗
      editDialogVisible: false,

      // 编辑商品数据验证规则
      editDialogRules: {
        goods_name: [
          { required: true, message: '商品名称不能为空！', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '商品价格不能为空！', trigger: 'blur' }

        ],
        goods_number: [
          { required: true, message: '商品数量不能为空！', trigger: 'blur' }

        ],
        goods_weight: [
          { required: true, message: '商品重量不能为空！', trigger: 'blur' }

        ]
      },

      // 提交编辑的货物id
      goods_id: 0,

      // 编辑商品要提交的数据
      editDialogData: {
        goods_name: '',
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        goods_introduce: '',
        pics: {},
        attrs: []
      }
    }
  },
  created () {
    // 调用数据请求函数
    this.getData()
  },
  methods: {
    // 获取商品列表的函数
    getData: async function () {
      const { data: res } = await this.$http.get('/goods', { params: this.goodsParams })
      if (res.meta.status !== 200) {
        // 请求失败
        return this.$message.error('数据请求失败！')
      }

      // 请求成功
      this.goodsList = res.data.goods
      this.goodsTotal = res.data.total
    },

    // 分页每页显现条数函数
    handleSizeChange: function (size) {
      this.goodsParams.pagesize = size
      this.getData()
    },

    // 分页当前选中页面函数
    handleCurrentChange: function (page) {
      this.goodsParams.pagenum = page
      this.getData()
    },

    // 数据搜索函数
    searchHandler: function () {
      this.getData()
    },

    // 删除产品操作函数
    deleteHandler: async function (id) {
      // console.log(id)
      // 进行弹窗确认是否删除
      const result = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(error => error)

      if (result !== 'confirm') {
        // 取消删除
        return this.$message.info('已取消删除！')
      }

      // 确认删除
      const { data: res } = await this.$http.delete('/goods/' + id)
      if (res.meta.status !== 200) {
        // 删除失败
        return this.$message.error('删除失败！')
      }

      // 删除成功
      this.$message.success('删除成功！')
      this.getData()
    },

    // 添加商品函数
    addGoods: function () {
      // 跳转到新页面
      this.$router.push('/add')
    },

    // 编辑商品弹窗控制函数
    editHandler: async function (id) {
      this.goods_id = id
      // 查询数据
      const { data: res } = await this.$http.get('/goods/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('网络异常！')
      }
      // this.editDialogData = res.data
      this.editDialogData.goods_name = res.data.goods_name
      this.editDialogData.goods_price = res.data.goods_price
      this.editDialogData.goods_number = res.data.goods_number
      this.editDialogData.goods_weight = res.data.goods_weight
      this.editDialogData.goods_introduce = res.data.goods_introduce
      this.editDialogData.pics = {}
      this.editDialogData.attrs = []
      // console.log(this.editDialogData)

      this.editDialogVisible = true
    },

    // 编辑商品弹窗关闭函数
    editDialogClose: function () {
      // 初始化id值
      this.goods_id = 0
    },

    // 编辑提交函数
    editConfirm: function () {
      // 再次验证表单数据
      this.$refs.editDialog.validate(async (isRight) => {
        if (!isRight) {
          // 验证失败
          return this.$message.error('提交数据不能为空！')
        }

        // 验证通过
        const url = '/goods/' + this.goods_id
        const { data: res } = await this.$http.put(url,this.editDialogData)

        if (res.meta.status !== 201) {
          return this.$message.error('商品编辑失败！')
        }

        // 编辑成功
        this.$message.success('商品编辑成功！')
        this.editDialogVisible = false
      })
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
    margin-top: 15px
  }
</style>
