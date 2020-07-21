<template>
<div>
  <el-breadcrumb separator="/" class="nav_bar">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>商品管理</el-breadcrumb-item>
    <el-breadcrumb-item>分类参数</el-breadcrumb-item>
  </el-breadcrumb>

  <el-card>
    <el-alert title="提示： 只能为三级标签添加参数！！" show-icon type="warning"></el-alert>
    <el-col class="choice_cate">
      <el-row>
        <span>选择商品分类：</span>
        <el-cascader
          v-model="currentData"
          :options="dataList"
          :props="cascaderProps"
          @change="cascaderHandleChange"></el-cascader>
      </el-row>
      <el-row>
          <el-tabs @tab-click="tabHandleClick" v-model="activeTab">
            <el-tab-pane name="many" label="动态参数">
              <el-col>
                <el-row :span="5">
                  <el-button type="primary" :disabled="parButtonDisabled" @click="addDialog">添加参数</el-button>

<!--                  表格-->
                    <el-table :data="manyData" border stripe>
                      <el-table-column type="expand">
                        <template slot-scope="scope">
                          <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="tagClose(i,scope.row)">{{item}}</el-tag>
                          <el-input
                            class="input-new-tag"
                            v-if="scope.row.inputVisible"
                            v-model="scope.row.inputValue"
                            ref="saveTagInput"
                            size="small"
                            @keyup.enter.native="handleInputConfirm(scope.row)"
                            @blur="handleInputConfirm(scope.row)"
                          >
                          </el-input>
                          <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ 新标签</el-button>
                        </template>
                      </el-table-column>
                      <el-table-column type="index" label="#"></el-table-column>
                      <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                      <el-table-column label="操作">
                        <template slot-scope="scope">
                          <el-button type="primary" icon="el-icon-edit" @click="openEditDialog(scope.row.attr_id)">编辑</el-button>
                          <el-button type="danger" icon="el-icon-delete" @click="attrDelete(scope.row.attr_id)">删除</el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                </el-row>
              </el-col>
            </el-tab-pane>
            <el-tab-pane name="only" label="静态属性">
              <el-col>
                <el-row :span="5">
                  <el-button type="primary" :disabled="parButtonDisabled" @click="addDialog">添加参数</el-button>
                </el-row>
                <el-table :data="onlyData" border stripe>
                  <el-table-column type="expand">
                    <template slot-scope="scope">
                      <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="tagClose(i,scope.row)">{{item}}
                      </el-tag>
                      <el-input
                        class="input-new-tag"
                        v-if="scope.row.inputVisible"
                        v-model="scope.row.inputValue"
                        ref="saveTagInput"
                        size="small"
                        @keyup.enter.native="handleInputConfirm(scope.row)"
                        @blur="handleInputConfirm(scope.row)"
                      >
                      </el-input>
                      <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ 新标签</el-button>
                    </template>
                  </el-table-column>
                  <el-table-column type="index" label="#"></el-table-column>
                  <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                  <el-table-column label="操作">
                    <template slot-scope="scope">
                      <el-button type="primary" icon="el-icon-edit" @click="openEditDialog(scope.row.attr_id)">编辑</el-button>
                      <el-button type="danger" icon="el-icon-delete" @click="attrDelete(scope.row.attr_id)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-col>
            </el-tab-pane>
          </el-tabs>
      </el-row>
    </el-col>

    <!--                添加参数弹出框-->
    <el-dialog :title="activeTab === 'many'?'添加动态参数' : '添加静态属性'"
               :visible.sync="addDialogVisible"
               width="30%" @close="addDialogClose">
      <el-form ref="addDialog" :rules="addDialogRules" :model="addDialogData">
        <el-form-item prop="attr_name" >
          <span>{{activeTab === 'many'?'动态参数：':'静态参数：'}}</span>
          <el-input v-model="addDialogData.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
      <el-button @click="addDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="addConfirm">确 定</el-button>
    </span>
    </el-dialog>

<!--    编辑弹出框-->
    <el-dialog title="编辑参数"
               :visible.sync="editDialogVisible"
               width="30%" @close="editDialogClose">
      <el-form ref="editDialog" :rules="editDialogRules" :model="editDialogData">
        <el-form-item prop="attr_name" >
          <span>{{activeTab === 'many'?'动态参数：':'静态参数：'}}</span>
          <el-input v-model="editDialogData.attr_name"></el-input>
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
  data () {
    return {
      // 获取到的数据
      dataList: [],

      // 级联选择器选中的数据
      currentData: [],

      // 定义级联选择器的属性
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },

      // 被选中的tab标签
      activeTab: 'many',

      // 静态数据
      manyData: [],

      // 动态数据
      onlyData: [],

      // 控制添加参数弹出框的弹出
      addDialogVisible: false,

      // 添加属性框的输入验证
      addDialogRules: {
        attr_name: [{
          required: true,
          message: '请输入属性名',
          trigger: 'blur'
        }]
      },

      // 输入的属性
      addDialogData: {
        attr_name: ''
      },

      // 控制编辑参数弹出框的弹出
      editDialogVisible: false,

      // 编辑属性框的输入验证
      editDialogRules: {
        attr_name: [{
          required: true,
          message: '请输入属性名',
          trigger: 'blur'
        }]
      },

      // 编辑输入的属性
      editDialogData: {}

      // 控制添加标签输入框的显示和隐藏
      // inputVisible: false,

      // 标签输入框输入的内容
      // inputValue: ''

    }
  },
  created () {
    this.getData()
  },
  computed: {
    // 定义一个控制添加参数的按钮的禁用的计算属性
    parButtonDisabled: function () {
      if (this.currentData.length !== 3) {
        // 不是三级参数就禁用
        return true
      }

      // 是三级参数就不禁用
      return false
    },

    // 返回三级标签的索引值
    getIndex: function () {
      if (this.currentData.length !== 3) {
        return null
      }

      // 是三级标签就返回索引值
      return this.currentData[2]
    }

  },
  methods: {
    // 获取数据的函数
    getData: async function () {
      const { data: res } = await this.$http.get('/categories')
      if (res.meta.status !== 200) {
        // 数据获取失败
        return this.$message.error('数据获取失败！')
      }

      // 数据获取成功
      this.dataList = res.data
      // console.log(this.dataList)
    },

    // 更改级联选择器的函数
    cascaderHandleChange: function () {
      // console.log(this.currentData)
      // 判断选中的数组中是否是第三级目录
      if (this.currentData.length !== 3) {
        // 将相关的数据都清空防止出现bug
        this.manyData = []
        this.onlyData = []
        // eslint-disable-next-line no-return-assign
        return this.currentData = []
      }

      this.getParams()
    },

    // tab选中的函数
    tabHandleClick: async function () {
      this.getParams()
    },

    // 定义一个切换tab请求数据的函数
    getParams: async function () {
      // 重新封装到一个函数的目的是为了解决切换tab栏不会重新请求数据的bug
      // 发起数据请求
      const url = '/categories/' + this.getIndex + '/attributes'
      const { data: res } = await this.$http.get(url, { params: { sel: this.activeTab } })

      if (res.meta.status !== 200) {
        return this.$message.error('数据加载失败!')
      }

      // 数据获取成功
      // 将attr_vals字符串形式转换城数组形式
      res.data.forEach((item) => {
        // 需要判断一下是否为空，不然会出现空的标签
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []

        // 为每一个data数组添加独立的控制输入框打开和数据存储属性
        item.inputVisible = false // 控制切换输入框
        item.inputValue = '' // 存储输入的内容
      })
      // console.log(res.data)
      // 判断数据是静态栏的数据还是动态栏的，进行分离
      if (this.activeTab === 'many') {
        // 静态页面的数据
        this.manyData = res.data
      } else {
        // 动态页面的数据
        this.onlyData = res.data
      }
    },

    // 添加属性弹出函数
    addDialog: function () {
      this.addDialogVisible = true
    },

    // 添加参数弹窗的关闭
    addDialogClose: function () {
      // 关闭弹窗时重置表单
      this.$refs.addDialog.resetFields()
    },

    // 提交添加参数的函数
    addConfirm: function () {
      // 验证表单内容是否正确
      this.$refs.addDialog.validate(async (isRight) => {
        // 验证不成功
        if (!isRight) {
          return this.$message.error('表单验证失败！')
        }

        // 验证成功，发送请求
        const { data: res } = await this.$http.post('/categories/' + this.getIndex + '/attributes', {
          attr_name: this.addDialogData.attr_name,
          attr_sel: this.activeTab
        })

        // 请求失败
        if (res.meta.status !== 201) {
          return this.$message.error('数据添加失败！')
        }

        // 添加成功
        this.$message.success('添加成功！')
        // 弹窗关闭
        this.addDialogVisible = false
        // 重新加载数据
        this.getParams()
      })
    },

    // 编辑窗口弹出函数
    openEditDialog: async function (id) {
      this.editDialogVisible = true
      // console.log(id)
      const { data: res } = await this.$http.get('categories/' + this.getIndex + '/attributes/' + id, {
        params: { attr_sel: this.activeTab }
      })

      if (res.meta.status !== 200) {
        return this.$message.error('数据加载失败！')
      }

      // 加载成功
      this.editDialogData = res.data
    },

    // 编辑窗口关闭函数
    editDialogClose: function () {
      // 重置提交表单
      this.$refs.editDialog.resetFields()
    },

    // 编辑窗口提交函数
    editConfirm: function () {
      // 再次验证表单的内容是否符合规定
      this.$refs.editDialog.validate(async (isRight) => {
        if (!isRight) {
          return this.$message.error('提交数据不符合规则！')
        }

        // 验证成功，提交表单
        const url = 'categories/' + this.getIndex + '/attributes/' + this.editDialogData.attr_id
        const { data: res } = await this.$http.put(url, {
          attr_name: this.editDialogData.attr_name,
          attr_sel: this.activeTab
        })

        if (res.meta.status !== 200) {
          // 请求失败
          return this.$message.error('编辑保存失败！')
        }

        // 保存成功
        this.$message.success('编辑成功！')
        this.editDialogVisible = false
        // 重新加载列表
        this.getParams()
      })
    },

    // 删除操作函数
    attrDelete: async function (id) {
      // 确认删除提示框
      const isConfirm = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(error => error)

      if (isConfirm !== 'confirm') {
        // 取消删除
        return this.$message.info('已取消删除！')
      }

      // 确认删除
      const url = 'categories/' + this.getIndex + '/attributes/' + id
      const { data: res } = await this.$http.delete(url)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败!')
      }

      // 删除成功
      this.$message.success('删除成功！')
      this.getParams()
    },

    // 监控输入框的内容
    handleInputConfirm: async function (node) {
      // 判断输入框的内容是否为空，为空就关闭输入框
      if (node.inputValue.trim().length === 0) {
        // 关闭输入框
        node.inputVisible = false
        // 清除输入框的数据
        node.inputValue = ''
        return 1
      }

      // 不是空的情况就进行标签的添加
      // 在attr_vals数组中添加新参数
      node.attr_vals.push(node.inputValue)
      node.inputValue = ''
      // 向数据库上传数据
      this.tagUpdate(node)

      // 上传成功
      // 关闭输入框
      node.inputVisible = false
      this.$message.success('上传数据成功！')
    },

    // 控制标签输入框的显示和隐藏
    showInput: function (node) {
      node.inputVisible = true
      // 打开输入框自动获取焦点的函数
      // $nextTick函数的意思是在重新加载页面元素之后才调用这个函数里面的代码
      // 因为在切换了inputVisible的值之后tag元素还没来得及切换成input，直接调用自动获取焦点会报错
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },

    // 实现属性标签的删除功能
    tagClose: function (id, node) {
      // 将node.attr_vals数组对应的标签进行删除
      node.attr_vals.splice(id, 1)
      // 更新数据
      this.tagUpdate(node)

      // 删除成功
      this.$message.success('删除成功！')
    },

    // 标签删除添加上传数据库功能函数
    tagUpdate: async function (node) {
      // 发送请求
      const { data: res } = await this.$http.put('/categories/' + this.getIndex + '/attributes/' + node.attr_id, {
        attr_name: node.attr_name,
        attr_sel: this.activeTab,
        attr_vals: node.attr_vals.join(' ')
      })

      if (res.meta.status !== 200) {
        // 上传请求失败
        return this.$message.error('更改参数失败！')
      }
    }
  }
}
</script>

<style scoped lang="less">
  .el-card {
    margin-top: 15px;
  }
  .choice_cate {
    margin: 15px 0 15px 0;
  }
  .el-table {
    margin-top: 15px;
  }

  .el-tag {
    margin-left: 10px;
  }

  .input-new-tag {
    width:150px;
    margin-left:15px;
  }

  .button-new-tag{
    margin-left: 15px;
  }
</style>
