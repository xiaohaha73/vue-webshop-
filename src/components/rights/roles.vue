<template>
  <div>
    <el-breadcrumb separator="/" class="nav_bar">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row>
        <el-col :span="8">
          <el-button type="primary" @click="rolesAddHandler">添加角色</el-button>
        </el-col>
      </el-row>

      <el-table :data="rolesList" stripe border>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row v-for="(item1,i1) in scope.row.children" :key="item1.id"
                    :class="['col_bottom','v_center',i1 === 0? 'col_top':'']">
              <!--一级标签-->
              <el-col :span="5">
                <el-tag closable @close="removeTagHandler(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!--二级标签-->
              <el-col :span="19">
                <el-row v-for="(item2,i2) in item1.children" :key="item2.id"
                        :class="['v_center',i2 === 0? '':'col_top']">
                  <el-col :span="6">
                    <el-tag type=success closable @close="removeTagHandler(scope.row, item2.id)">{{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>

                  <el-col :span="18">
                    <el-tag type=warning v-for="item3 in item2.children" :key="item3.id" closable
                            @close="removeTagHandler(scope.row, item3.id)">{{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="350px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="rolesEdit(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="rolesDelete(scope.row.id)">删除</el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="rightDialogClickHandler(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!--权限分配弹出框-->
    <el-dialog
      title="提示"
      :visible.sync="rightVisable"
      width="50%" @close="rightRemoveHandler">
      <span>分配权限</span>
      <el-tree ref="rightTree" :data="rightTree" :props="defaultProps" show-checkbox node-key="id" :default-checked-keys="defaultKey"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rightVisable = false" >取 消</el-button>
        <el-button type="primary" @click="rightSubmitHandler">确 定</el-button>
      </span>
    </el-dialog>
    <!--添加角色弹出框-->
    <el-dialog
      title="提示"
      :visible.sync="rolesVisable"
      width="35%" @close="addRolesClose">
      <span>添加角色</span>
      <div>角色名称<el-input v-model="addrole.roleName"></el-input></div>
      <div>角色描述<el-input v-model="addrole.roleDesc"></el-input></div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rolesVisable = false" >取 消</el-button>
        <el-button type="primary" @click="rolesSubmitHandler">确 定</el-button>
      </span>
    </el-dialog>

    <!--编辑角色弹出框-->
    <el-dialog
      title="提示"
      :visible.sync="rolesEditVisable"
      width="35%" @close="rolesEditClose">
      <span>编辑角色</span>
      <div>角色名称<el-input v-model="editrole.roleName"></el-input></div>
      <div>角色描述<el-input v-model="editrole.roleDesc"></el-input></div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rolesEditVisable = false" >取 消</el-button>
        <el-button type="primary" @click="rolesEditConfirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      rolesList: [],
      // 控制权限分配框弹出
      rightVisable: false,
      // 控制添加角色弹出框的弹出
      rolesVisable: false,
      // 控制角色编辑弹出框的弹出
      rolesEditVisable: false,
      // 添加角色的信息
      addrole: {
        roleName: '',
        roleDesc: ''
      },
      // 编辑角色的信息
      editrole: {
        id: '',
        roleName: '',
        roleDesc: ''
      },
      // 当前弹出框的用户id
      roleId: '',
      // 权限分配树获取的数据
      rightTree: [],
      // 控制权限分配树的属性配置
      defaultProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认选中权限的数组，存储的是该节点的id值
      defaultKey: []
    }
  },
  created () {
    // 调用获取数据列表的函数
    this.getData()
  },
  methods: {
    // 获取数据的函数
    getData: async function () {
      const { data: res } = await this.$http.get('/roles')
      if (res.meta.status !== 200) {
        // 请求数据失败的情况
        return this.$message.error('获取数据失败！')
      }

      // 获取数据成功的情况
      this.rolesList = res.data
      // console.log(this.rolesList)
    },

    // 删除权限标签操作函数
    removeTagHandler: async function (role, id) {
      // 触发之后弹出确认删除提示框
      // eslint-disable-next-line no-unreachable
      const confirm = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(error => error)

      if (confirm !== 'confirm') {
        // 取消删除
        return this.$message.info('已取消删除！')
      }

      // 确认删除的情况
      // 调用删除接口
      const url = 'roles/' + role.id + '/rights/' + id
      const { data: res } = await this.$http.delete(url)
      if (res.meta.status !== 200) {
        // 删除失败的情况
        return this.$message.error('删除权限失败！')
      }

      // 成功删除
      this.$message.success('已删除该权限')
      role.children = res.data
    },

    // 控制权限分配弹窗弹出的函数
    rightDialogClickHandler: async function (node) {
      // 将当前的角色进行存储方便后面的使用
      this.roleId = node.id
      // 加载数据
      const { data: res } = await this.$http.get('rights/tree')

      if (res.meta.status !== 200) {
        // 获取数据失败
        return this.$message.error('网络异常，请稍后重试！')
      }

      // 获取数据成功
      this.rightTree = res.data

      // 加载默认选中的三级标签
      this.getItemId(node, this.defaultKey)

      this.rightVisable = true
    },

    // 递归函数实现找到三级权限标签的id值
    getItemId: function (node, arr) {
      // 判断该节点下是否还有children属性，如果没有就是第三节点
      if (!node.children) {
        // 是第三级标签的情况,将id值存入数组中
        return arr.push(node.id)
      }

      // 不是第三级节点的情况进行遍历，然后继续递归
      node.children.forEach((item) => {
        this.getItemId(item, arr)
      })
    },

    // 控制权限弹窗关闭的函数
    rightRemoveHandler: function () {
      // 清除权限数组中的内容，不然会和下一个用户的权限混淆产生bug
      this.defaultKey = []
    },

    // 控制权限弹窗的提交的函数
    rightSubmitHandler: async function () {
      // 将所有选中的权限的id值存储到一个数组中
      const keys = [
        ...this.$refs.rightTree.getCheckedKeys(),
        ...this.$refs.rightTree.getHalfCheckedKeys()
      ]

      // 将这个数组转化成字符串
      const keyString = keys.join(',')
      // console.log(keyString)

      // 发送ajax请求进行数据永久化存储
      const url = 'roles/' + this.roleId + '/rights'
      const { data: res } = await this.$http.post(url, { rids: keyString })
      if (res.meta.status !== 200) {
        // 请求失败的情况
        return this.$message.error('编辑失败！')
      }

      // 编辑成功
      this.$message.success('编辑成功！')
      // 关闭弹窗
      this.rightVisable = false
      this.getData()
    },

    // 添加角色的函数
    rolesAddHandler: function () {
      // 弹出弹窗
      this.rolesVisable = true
    },

    // 提交添加角色的函数
    rolesSubmitHandler: async function () {
      // 调用提交请求函数
      // eslint-disable-next-line no-unreachable
      const { data: res } = await this.$http.post('/roles', this.addrole)

      if (res.meta.status !== 201) {
        return this.$message.error('提交失败')
      }

      // 提交成功
      this.$message.success('提交成功')
      // 更新数据
      this.getData()
      // 关闭弹窗
      this.rolesVisable = false
    },

    // 添加角色弹窗关闭函数
    addRolesClose: function () {
      // 清空有关添加角色有关的数据防止出现bug
      this.addrole.roleName = this.addrole.roleDesc = ''
    },

    // 角色编辑弹窗打开函数
    rolesEdit: async function (data) {
      // 弹出弹框
      this.rolesEditVisable = true
      // console.log(data)
      // 查询数据
      const { data: res } = await this.$http.get('/roles/' + data.id)

      if (res.meta.status !== 200) {
        return this.$message.error('网络异常')
      }
      this.editrole.roleName = res.data.roleName
      this.editrole.roleDesc = res.data.roleDesc
      this.editrole.id = data.id

      console.log(this.editrole)
    },

    // 确定提交角色编辑函数
    rolesEditConfirm: async function () {
      // console.log(this.editrole)

      // 提交数据
      const { id, roleName, roleDesc } = this.editrole
      const url = '/roles/' + id
      const { data: res } = await this.$http.put(url, { roleName, roleDesc })

      if (res.meta.status !== 200) {
        return this.$message.error('编辑失败')
      }

      // 编辑成功关闭弹窗
      this.$message.success('编辑成功')
      this.getData()
      this.rolesEditVisable = false
    },

    // 角色编辑弹窗关闭函数
    rolesEditClose: function () {
      // 关闭弹窗
      this.rolesEditVisable = false
      // 清空数据
      this.editrole.roleName = ''
      this.editrole.roleDesc = ''
      this.editrole.id = ''
    },

    // 删除角色的函数
    rolesDelete: async function (id) {
      const result = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(error => error)

      // console.log(result)
      if (result !== 'confirm') {
        // 取消删除的情况
        return this.$message.info('已取消删除')
      }

      // 确认删除的情况发送请求
      const { data: res } = await this.$http.delete('/roles/' + id)

      if (res.meta.status !== 200) {
        // 删除失败
        return this.$message.error('删除失败！')
      }

      // 删除成功更新数据
      this.getData()
      this.$message.success('删除成功！')
    }
  }

}
</script>

<style scoped lang="less">
  .el-card {
    margin-top: 20px;
  }

  .el-table {
    margin-top: 20px;
  }

  .col_bottom {
    border-bottom: 1px solid #cccccc;
  }

  .col_top {
    border-top: 1px solid #cccccc;
  }

  /*  标签上下间距调整*/
  .el-tag {
    margin: 10px;
  }

</style>
