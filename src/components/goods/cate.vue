<template>
<div>
  <el-breadcrumb separator="/" class="nav_bar">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>商品管理</el-breadcrumb-item>
    <el-breadcrumb-item>商品分类</el-breadcrumb-item>
  </el-breadcrumb>

  <el-card>
    <el-row>
      <el-col :span="5">
        <el-button type="primary" @click="addHandler">添加分类</el-button>
      </el-col>
    </el-row>
    <tree-table class="tree_table" :data="dataList" :columns="columns" border show-index :selection-type="false" :expand-type="false">
      <template slot="isUseful" slot-scope="scope">
        <i class="el-icon-circle-close" v-if="scope.row.cat_deleted === false" style="color: red"></i>
        <i class="el-icon-circle-check" v-else style="color:  lightgreen;"></i>
      </template>

      <template slot="level" slot-scope="scope">
        <el-tag v-if="scope.row.cat_level === 1">一级</el-tag>
        <el-tag type="warning" v-else-if="scope.row.cat_level === 2">二级</el-tag>
        <el-tag type="danger" v-else>三级</el-tag>
      </template>

      <template slot="setting">
        <el-button type="warning" size="mini" icon="el-icon-edit">编辑</el-button>
        <el-button type="danger" size="mini" icon="el-icon-delete">删除</el-button>
      </template>
    </tree-table>
<!--    分页功能-->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="query.pagenum"
      :page-sizes="[3, 5, 10, 15]"
      :page-size="query.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
  </el-card>

<!--  添加分类弹出框-->
  <el-dialog
    title="提示"
    :visible.sync="addVisable"
    width="40%" @close="closeHandler">
    <span>添加分类</span>

    <el-form :model="addCate" :rules="addrules" ref="addForm">
      <el-form-item label="分类名称：" prop="cat_name">
        <el-input v-model="addCate.cat_name"></el-input>
      </el-form-item>
      <el-form-item label="父级分类：">
        <el-cascader
        v-model="cascaderValue"
        :options="secondData"
        :props="cascaderProps"
        expand-trigger="hover"
        @change="cascaderHandleChange"></el-cascader>
      </el-form-item>
    </el-form>

    <span slot="footer" class="dialog-footer">
        <el-button @click="addVisable = false" >取 消</el-button>
        <el-button type="primary" @click="addSubmitHandler">确 定</el-button>
      </span>
  </el-dialog>
</div>
</template>

<script>
export default {
  data: function () {
    return {
      // 获取数据的查询数据
      query: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 数据总页数
      total: 0,
      // 获取到的数据列表
      dataList: [],
      // 渲染treetable的数据
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          prop: 'cat_deleted',
          type: 'template', // 使用模板类型
          template: 'isUseful' // 使用的模板的名称
        },
        {
          label: '等级',
          prop: 'cat_level',
          type: 'template',
          template: 'level'
        },
        {
          label: '操作',
          type: 'template',
          template: 'setting'
        }
      ],

      // 控制添加分类的弹出框
      addVisable: false,

      // 获取的二级数据存放
      secondData: [],

      // 联级选择器属性
      cascaderProps: {
        label: 'cat_name', // 显示标签
        value: 'cat_id',
        children: 'children'
      },

      // 级联选择器选中的数据
      cascaderValue: [],

      // 添加的新分类存放的数据
      addCate: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },

      // 添加数据验证规则
      addrules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    // 调用获取数据的函数
    this.getData()
  },
  methods: {
    // 获取数据的函数
    getData: async function () {
      const { data: res } = await this.$http.get('/categories', { params: this.query })
      // console.log(res)

      // eslint-disable-next-line no-unreachable
      if (res.meta.status !== 200) {
        return this.$message.error('网络异常')
      }

      this.dataList = res.data.result
      this.total = res.data.total
      // console.log(this.dataList, this.total)
    },

    // 改变每一页数据条数的函数
    handleSizeChange: function (size) {
      this.query.pagesize = size
      this.getData()
    },

    // 选中页数的函数
    handleCurrentChange: function (page) {
      this.query.pagenum = page
      this.getData()
    },

    // 添加分类弹出框函数
    addHandler: function () {
      // 调用数据获取函数
      this.getSecondData()
      this.addVisable = true
    },

    // 获取二级分类数据的函数
    getSecondData: async function () {
      const { data: res } = await this.$http.get('/categories', { params: { type: 2 } })
      if (res.meta.status !== 200) {
        return this.$meaage.error('数据获取失败')
      }
      this.secondData = res.data
      // console.log(res)
    },

    // 级联改变函数
    cascaderHandleChange: function () {
      console.log(this.cascaderValue)
      // 判断父级分类中是否有选中的内容
      if (this.cascaderValue.length === 0) {
        // 内容为空
        this.cat_pid = 0
        this.cat_level = 0
        return 1
      }

      // 内容不为空
      this.addCate.cat_pid = this.cascaderValue[this.cascaderValue.length - 1]
      this.addCate.cat_level = this.cascaderValue.length
    },

    // 关闭添加弹窗的函数
    closeHandler: function () {
      // 清空addCate的数据
      this.$refs.addForm.resetFields()
      this.cascaderValue = []
      this.addCate.cat_pid = 0
      this.cat_level = 0
    },

    // 提交添加弹窗的函数
    addSubmitHandler: async function () {
    // console.log(this.addCate)
    // 验证表单
      this.$refs.addForm.validate(async (comfirm) => {
        if (!comfirm) {
          return this.$message('验证失败！')
        }

        // 验证通过提交数据
        const { data: res } = await this.$http.post('/categories', this.addCate)
        if (res.meta.status !== 201) {
          return this.$message.error('提交失败！')
        }

        this.$message.success('提交成功！')
        this.getData()
        this.addVisable = false
      })
    }
  }
}
</script>

<style scoped lang="less">
  .el-card {
    margin-top:15px
  }
  .tree_table {
    margin-top: 15px;
  }

  .el-pagination {
    margin-top: 15px;
  }

</style>
