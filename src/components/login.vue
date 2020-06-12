<template>
  <div class="login_body">
    <div class="login_box">
      <div class="avatar_box"><img src="../assets/logo.png"></div>
<!--      输入框组件-->
      <el-form class="login_form" :model="form" :rules="form_rules" ref="login_form">
<!--        这里的ref属性是为了拿到form表单对象然后实现表单重置功能-->
<!--        登录输入框-->
        <el-form-item label="账号:" label-position="left" label-width="80px" prop="user_name">
          <el-input prefix-icon="iconfont icon-user" v-model="form.user_name"></el-input>
        </el-form-item>
        <el-form-item label="密码:" label-position="left" label-width="80px" prop="password">
          <el-input prefix-icon="iconfont icon-3702mima" v-model="form.password" type="password"></el-input>
        </el-form-item>
<!--        登录按钮-->
        <el-form-item class="form_button">
          <el-button type="primary" @click="login_handle">登录</el-button>
          <el-button type="primary" plain @click="reset_form">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      form: {
        user_name: 'admin',
        password: '123456'
      },
      // 表单验证对象
      form_rules: {
        // 验证用户名是否合法
        user_name: [
          { required: true, message: '登录名不能为空', trigger: 'blur' }, // 触发机制是光标离开
          { min: 3, max: 10, message: '长度在3 - 10之间', trigger: 'blur' }
        ],
        // 验证密码长度是否合法
        password: [
          { min: 3, max: 20, message: '长度在3 - 20之间', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 清空表单内容的触发函数
    reset_form: function () {
      this.$refs.login_form.resetFields() // 清空表单中的内容
    },

    // 登录验证函数
    login_handle: function () {
      this.$refs.login_form.validate(async (valid) => {
        if (!valid) {
          // 验证失败情况，终止函数
          return false
        }
        // 初步验证通过就调用axios
        const params = {
          username: this.form.user_name,
          password: this.form.password
        }
        const { data } = await this.$http.post('login', params)
        if (data.meta.status !== 200) {
          // 状态码不是200就是登录失败的情况
          return this.$message.error('登录失败！')
        }

        // 登录成功的情况
        this.$message.success('登录成功！')
        // 将token值存储到sessionstorage中
        // console.log(data.data.token)
        window.sessionStorage.setItem('token', data.data.token)

        // 进行页面的跳转
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .login_body {
    background: url("../assets/images/cool-background.png") top center no-repeat;
    height: 100%;
    width: 100%;
    position: relative;
  }

  /*设置按钮的背景颜色*/
  .el-button--primary {
    background:#5bd8a8;
    border-color:#33d9b2;
  }
  .el-button--primary:hover{
    background:#a9db78;
    border-color: #a9db78;
  }
  .el-button--primary.is-plain {
    color:#41b883;
  }
  .el-button--primary.is-plain:hover{
    background:#a9db78;
    border-color: #a9db78;
  }

  .login_box {
    position: absolute;
    height: 300px;
    width: 450px;
    background: #ff5252;
    border-radius: 8px;
    box-shadow: 8px 9px 15px #888888;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);
    .avatar_box {
      height: 150px;
      width: 150px;
      position:absolute;
      border: 2px solid #33d9b2;
      border-radius:50%;
      background:#eeeeee;
      text-align: center;
      left: 50%;
      top: -1px;
      transform: translate(-50%,-50%);
      img {
        width:80%;
        height:80%;
        margin-top: 30px;
      }
    }
  }
  .login_form {
    position: absolute;
    top: 100px;
    width:380px;
  }
  .form_button {
    display: flex;
    justify-content: flex-end;
  }
</style>
