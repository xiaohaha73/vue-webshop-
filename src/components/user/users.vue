<template>
  <div>
    <el-breadcrumb separator="/" class="nav_bar">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="req_param.query" clearable @clear="get_user_data"
                    @change="search_handler()">
            <el-button slot="append" icon="el-icon-search" @click="search_handler"></el-button>
          </el-input>

        </el-col>
        <el-button type="primary" :span="5" @click="dialogVisible = true">添加用户</el-button>
      </el-row>

      <!--      用户数据列表-->
      <el-table :data="users" style="width: 100%" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="create_time" label="时间" width="180"></el-table-column>
        <el-table-column prop="username" label="姓名" width="180"></el-table-column>
        <el-table-column prop="email" label="邮箱" width="180"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色" width="180"></el-table-column>
        <el-table-column label="状态" width="180">
          <template slot-scope="scope">
            <span v-if="scope.row.mg_state" class="statue">开</span>
            <span v-else class="statue">关</span>
            <el-switch v-model="scope.row.mg_state" @change="statue_handler(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editDataHandler(scope.row.id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteHandler(scope.row.id)"></el-button>
            <el-tooltip effect="dark" content="更改角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="roleDialogHandler(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--      分页效果的实现-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="req_param.pagenum"
        :page-sizes="[2, 4]"
        :page-size="req_param.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!--添加用户信息弹窗-->
    <el-dialog title="添加用户" :visible.sync="dialogVisible" width="40%" @close="cleanHandler">
<!--      表单主体区域-->
      <el-form ref="submit_form" :rules="submit_form_rules" :model="submit_form" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="submit_form.username"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="submit_form.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="number">
          <el-input v-model="submit_form.number"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="submit_form.password"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">提交</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户信息弹窗   -->
    <el-dialog title="编辑用户" :visible.sync="edit_dialogVisible" width="40%" @close="editFormClose">

      <!--      表单主体区域-->
      <el-form ref="edit_form"  label-width="80px" :model="edit_form" :rules="editFormRules">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="edit_form.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="edit_form.mobile"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="edit_form.email"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="edit_dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editFormSubmit">更改</el-button>
      </span>
    </el-dialog>

    <!-- 更改角色弹窗   -->
    <el-dialog title="更改角色" :visible.sync="role_dialogVisible" width="30%" @close="roleDialogClose">
      <div>
        <div>当前用户:{{user_info.username}}</div>
        <div>当前角色:{{user_info.role_name}}</div>
        <el-select v-model="active_role" placeholder="请选择">
          <el-option
            v-for="item in role_list"
            :key="item.id"
            :label="item.roleName"
            :value="item.id">
          </el-option>
        </el-select>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="role_dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="roleSubmit">更改</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    // 邮箱正则验证函数
    const checkEmail = (rule, value, callback) => {
      // 定义一个验证邮箱的正则表达式
      const emailReg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/

      // 验证邮箱的合法性
      if (emailReg.test(value)) {
        // 验证通过
        callback()
      } else {
        // 验证不通过
        callback(new Error('邮箱地址不合法！'))
      }
    }

    // 电话正则验证函数
    const checkNumber = (rule, value, callback) => {
      // 定义验证电话号码的正则表达式
      const regNumber = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (!regNumber.test(value)) {
        // 验证不通过
        return callback(new Error('电话号码不合法！'))
      }
      // 验证通过的情况
      callback()
    }

    return {
      // 获取用户参数的请求参数对象
      req_param: {
        query: '', // 搜索功能的关键字
        pagenum: 1,
        pagesize: 2
      },
      users: [], // 用户数据列表
      total: 10, // 总的数据条数
      dialogVisible: false, // 控制添加用用户对话框的弹出
      edit_dialogVisible: false, // 控制编辑用户对话框的弹出
      role_dialogVisible: false, // 控制角色编辑弹窗的弹出
      submit_form_rules: { // 提交表单验证规则
        username: [
          { required: true, message: '请输入用户昵称', trigger: 'blur' },
          { min: 3, max: 8, message: '长度在 3 到 8 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        number: [
          { required: true, message: '请输入电话号码', trigger: 'blur' },
          { validator: checkNumber, trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      },
      submit_form: { // 提交用户的表单
        username: '',
        password: '',
        email: '',
        number: ''
      },
      edit_form: {}, // 编辑用户的数据
      editFormRules: { // 编辑表单验证规则
        username: [
          { required: true, message: '请输入用户昵称', trigger: 'blur' },
          { min: 3, max: 8, message: '长度在 3 到 8 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入电话号码', trigger: 'blur' },
          { validator: checkNumber, trigger: 'blur' }
        ]
      },

      // 用户角色编辑模块使用到的信息
      user_info: {},
      role_list: [],
      active_role: '' // 选中的角色值
    }
  },
  created () {
    // 调用数据请求函数
    this.get_user_data()
  },
  methods: {
    // 获取用户数据的函数
    get_user_data: async function () {
      const data = await this.$http.get('/users', { params: this.req_param })
      if (data.status !== 200) {
        // 数据请求失败的情况
        return this.$message.error('列表数据获取失败!')
      }
      this.users = data.data.data.users
      // console.log(this.users)
    },

    // 每页显示的数据条数的函数
    handleSizeChange: function (pagesize) {
      this.req_param.pagesize = pagesize
      this.get_user_data()
    },

    // 页面跳转函数
    handleCurrentChange: function (page) {
      this.req_param.pagenum = page
      this.get_user_data()
    },

    // 更改用户状态开关的函数
    statue_handler: async function (data) {
      const url = 'users/' + data.id + '/state/' + data.mg_state
      const answer = await this.$http.put(url)
      // console.log(answer)
      if (answer.status !== 200) {
        // 请求更改数据失败的情况
        return this.$message.error('更改用户状态失败 ！')
      }

      // 更改成功
      this.$message.success('更改用户状态成功 ！')
    },

    // 搜索功能函数
    search_handler: function () {
      // 调用获取数据列表的函数
      this.get_user_data()
    },

    // 清理提交表单的函数
    cleanHandler: function () {
      // 调用form表单的clearFields函数清理表单
      this.$refs.submit_form.resetFields()
    },

    // 表单提交函数
    submitForm: function () {
      // 对提交内容进行验证是否符合验证条件
      this.$refs.submit_form.validate(async (isPass) => {
        // 验证不通过的情况
        if (!isPass) {
          return this.$message.error('用户提交失败！')
        }

        // 验证成功的情况,发起axios请求提交数据
        const newUser = {
          username: this.submit_form.username,
          password: this.submit_form.password,
          email: this.submit_form.email,
          mobile: this.submit_form.number
        }
        const subResult = await this.$http.post('users', newUser)
        // console.log(subResult.data.meta.status)
        if (subResult.data.meta.status !== 201) {
          // 提交失败
          this.dialogVisible = false // 弹窗关闭
          return this.$message.error('网络原因提交失败')
        }
        // 提交成功
        this.$message.success('用户提交成功！')
        this.dialogVisible = false // 弹窗关闭

        // 重新加载列表数据
        this.get_user_data()
      })
    },

    // 修改用户数据的函数
    editDataHandler: async function (id) {
      // 根据id值请求用户数据
      const { data: target } = await this.$http.get('users/' + id)
      // console.log(target)
      if (target.meta.status !== 200) {
        // 请求失败的情况
        return this.$message.error('网络出错！')
      }

      // 请求成功，将数据存到edit_form
      this.edit_form = target.data
      // console.log(this.edit_form)

      // 对话框状态改为打开状态
      this.edit_dialogVisible = true
    },

    // 清理编辑表单的函数
    editFormClose: function () {
      this.$refs.edit_form.resetFields()
    },

    // 提交更改好的信息的函数
    editFormSubmit: async function () {
      // 首先总体验证一下要提交的所有信息是否合法
      this.$refs.edit_form.validate(async (result) => {
        if (!result) {
          // 验证失败的情况
          return this.$message.error('提交信息验证失败')
        }

        // 验证通过，发送axios请求
        const url = 'users/' + this.edit_form.id
        const { data: res } = await this.$http.put(url, { email: this.edit_form.email, mobile: this.edit_form.mobile })
        // console.log(res)
        if (res.meta.status !== 200) {
          // 提交失败
          return this.$message.error('提交失败')
        }

        // 更改成功的情况
        this.$message.success('更改成功')
        // 重新加载数据列表
        this.get_user_data()
        // 关闭编辑窗口
        this.edit_dialogVisible = false
      })
    },

    // 删除用户操作的函数
    deleteHandler: async function (id) {
      // 确认删除的提示框
      const isDelete = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(error => error) // 捕获报错情况

      if (isDelete !== 'confirm') {
        // 取消删除的情况
        return this.$message.info('已取消删除')
      }

      // 确认删除的情况
      // 发起删除请求
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) {
        // 删除请求失败的情况
        return this.$message.error('删除请求失败！')
      }

      // 请求成功
      this.$message.success('用户删除成功！')
      this.get_user_data()
    },

    // 修改角色按钮点击函数
    roleDialogHandler: async function (userInfo) {
      this.role_dialogVisible = true
      this.user_info = userInfo
      // 获取角色列表数据
      const { data: res } = await this.$http.get('/roles')
      if (res.meta.status !== 200) {
        // 请求失败
        return this.$message.error('数据异常')
      }

      // 请求数据成功
      this.role_list = res.data
      // console.log(this.role_list)
    },

    // 提交角色修改信息的函数
    roleSubmit: async function () {
      // 判断选择框的内容是否为空
      if (!this.active_role) {
        return this.$message.error('选择框内容不能为空！')
      }

      // 不是空的情况提交更改
      const url = 'users/' + this.user_info.id + '/role'
      const { data: res } = await this.$http.put(url, { rid: this.active_role })

      if (res.meta.status !== 200) {
        return this.$message.error('角色更改失败！')
      }

      this.$message.success('更改成功！')
      // 更改成功关闭弹窗
      this.role_dialogVisible = false
      this.get_user_data()
      // 清空角色模块相关数据防止出现bug
      // this.user_info = {}
      // this.role_list = []
      // this.active_role = ''
    },

    // 关闭角色弹窗的处理函数
    roleDialogClose: function () {
      // 清空相关数据
      this.user_info = {}
      this.role_list = []
      this.active_role = ''
      // console.log('数据已经清空')
      // this.$message.info('数据已清空')
    }
  }

}
</script>
<style scoped lang="less">
  .nav_bar {
    margin-bottom: 25px;
  }

  .el-table {
    margin-top: 20px;
  }

  .el-pagination {
    margin-top: 20px;
  }

  .statue {
    margin-right: 8px;
  }

</style>
