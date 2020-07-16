<template>
<div>
  <el-breadcrumb separator="/" class="nav_bar">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>商品管理</el-breadcrumb-item>
    <el-breadcrumb-item>商品添加</el-breadcrumb-item>
  </el-breadcrumb>
  <el-card>
    <el-alert
      title="添加商品信息"
      type="info"
      show-icon center>
    </el-alert>

    <!--进度条-->
    <el-steps :active="finishIndex - 0" align-center>
      <el-step title="基本信息"></el-step>
      <el-step title="商品参数"></el-step>
      <el-step title="商品属性"></el-step>
      <el-step title="商品图片"></el-step>
      <el-step title="商品内容"></el-step>
      <el-step title="完成"></el-step>
    </el-steps>

<!--    侧边导航栏-->
    <el-form :model="addForm" :rules="rules" ref="addForm" label-width="100px" label-position="top">
      <el-tabs tab-position="left"  v-model="finishIndex" :before-leave="tabBeforeLeave" @tab-click="tabChange">
        <el-tab-pane label="基本信息" name="0">
          <el-form-item label="商品名称" prop="goods_name">
            <el-input v-model="addForm.goods_name"></el-input>
          </el-form-item>
          <el-form-item label="商品价格" prop="goods_price">
            <el-input type="number" v-model="addForm.goods_price"></el-input>
          </el-form-item>
          <el-form-item label="商品重量" prop="goods_weight">
            <el-input type="number" v-model="addForm.goods_weight"></el-input>
          </el-form-item>
          <el-form-item label="商品数量" prop="goods_number">
            <el-input type="number" v-model="addForm.goods_number"></el-input>
          </el-form-item>
          <el-form-item label="商品分类" prop="goods_cat">
            <el-cascader expand-trigger="hover" :options="catList" :props="cascaderProps" v-model="addForm.goods_cat" @change="cascaderHandleChange">
            </el-cascader>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品参数" name="1">
          <el-form-item v-for="(item) in activeCat" :key="item.attr_id" :label="item.attr_name">
            <el-checkbox-group v-model="item.attr_vals">
              <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品属性" name="2">
          <el-form-item v-for="(item) in onlyData" :key="item.attr_id" :label="item.attr_name">
            <el-input v-model="item.attr_vals"></el-input>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品图片" name="3">
          <el-upload
            action="http://127.0.0.1:8888/api/private/v1/upload"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :on-success="uploadHandler"
            list-type="picture" :headers="header">
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
        </el-tab-pane>
        <el-tab-pane label="商品内容" name="4">
          <quill-editor
            ref="myQuillEditor"
            v-model="addForm.goods_introduce"/>
        </el-tab-pane>
        <el-tab-pane label="完成提交" name="5">
          <el-button type="primary" size="medium" class="submitGoods" @click="submitGoods">提交商品</el-button>
        </el-tab-pane>
      </el-tabs>
    </el-form>
  </el-card>
<!--  图片预览窗口-->
  <el-dialog
    title="提示"
    :visible.sync="previewDialogVisible"
    width="50%"
    :before-close="previewClose">
    <img :src="previewPath" class="preview">
  </el-dialog>
</div>
</template>

<script>
import _ from 'lodash'
export default {
  data () {
    return {
      // 完成进度条的索引值
      finishIndex: '0', // 后面要转换成数字类型

      // 表单绑定的数据
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        // 存储上传图片的路径的数组
        pics: [],
        goods_introduce: '', // 富文本编辑器的文本内容
        attrs: [] // 商品参数
      },

      // 获取到的商品分类数据
      catList: [],

      // 表单验证规则
      rules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },

      // 级联选择器控制的参数
      cascaderProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },

      // 存储选中的参数分类
      activeCat: [], // tab2获取到的参数
      // tab3获取到的参数
      onlyData: [],

      // 上传图片绑定token值
      header: {
        Authorization: window.sessionStorage.getItem('token')
      },

      // 控制图片预览窗口的弹出
      previewDialogVisible: false,

      // 存储预览的路径
      previewPath: ''

    }
  },
  created () {
    // 获取商品分类参数
    this.getData()
  },
  methods: {
    // 获取商品分类参数的函数
    async getData () {
      const { data: res } = await this.$http.get('/categories')

      if (res.meta.status !== 200) {
        // 获取数据失败
        return this.$message.error('获取数据失败!')
      }

      // 获取成功
      // console.log(res.data)
      this.catList = res.data
    },

    // 级联选择器选中函数
    cascaderHandleChange () {
      // console.log(this.addForm.goods_cat)
      // 判断选中数组是否为三级
      if (this.addForm.goods_cat.length !== 3) {
        // 不是三级标签
        // eslint-disable-next-line no-return-assign
        return this.addForm.goods_cat = []
      }
    },

    // tab切换函数
    tabBeforeLeave: function () {
      if (this.addForm.goods_cat.length !== 3) {
        // 不允许切换
        this.$message.error('请选择商品分类！')
        return false
      }
    },

    // tab切换函数
    tabChange: async function () {
      // console.log(this.finishIndex)
      // tab2切换加载数据
      if (this.finishIndex === '1') {
        // 如果是第二步骤就发送请求将数据保存
        const url = '/categories/' + this.getIndex + '/attributes'
        const { data: res } = await this.$http.get(url, {
          params: {
            sel: 'many'
          }
        })

        if (res.meta.status !== 200) {
          // 获取失败
          return this.$message.error('请求数据失败!')
        }

        // 请求成功
        // 将.attr_vals转换成数组
        res.data.forEach((item) => {
          item.attr_vals = item.attr_vals === [] ? [] : item.attr_vals.split(' ')
        })
        this.activeCat = res.data
        // console.log(this.activeCat)
        this.activeCat.forEach((item) => {
          const attr = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }

          this.addForm.attrs.push(attr)
        })
      } else if (this.finishIndex === '2') {
        // tab3切换加载数据
        const url = '/categories/' + this.getIndex + '/attributes'
        const { data: res } = await this.$http.get(url, {
          params: {
            sel: 'only'
          }
        })

        if (res.meta.status !== 200) {
          // 获取失败
          return this.$message.error('请求数据失败!')
        }

        this.onlyData = res.data
        // console.log(this.onlyData)
        this.onlyData.forEach((item) => {
          const attr = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }

          this.addForm.attrs.push(attr)
        })
      }
    },

    // 图片预览函数
    handlePreview: function (file) {
      this.previewDialogVisible = true
      this.previewPath = file.response.data.url
    },

    // 图片预览关闭函数
    previewClose: function () {
      this.previewDialogVisible = false
    },

    // 图片移除函数
    handleRemove: function (file) {
      const index = this.addForm.pics.findIndex((item) => {
        return item.pic === file.response.data.tmp_path
      })
      this.addForm.pics.splice(index, 1)
      // console.log(this.addForm.pics)
    },

    // 图片上传成功函数
    uploadHandler: function (response) {
      // 将临时存储的图片路径存储到一个数组中，方便后面上传
      const uploadPath = { pic: response.data.tmp_path }
      this.addForm.pics.push(uploadPath)
      // console.log(this.addForm.pics)
    },

    // 提交添加新商品的函数
    submitGoods: function () {
      // 对提交表再次进行验证
      this.$refs.addForm.validate(async (isRight) => {
        if (!isRight) {
          // 验证不通过
          return this.$message.error('表单填写不完整！')
        }

        // 验证通过,对提交表单进行深拷贝
        const subForm = _.cloneDeep(this.addForm)
        // 将goods_cat数组转化成字符串
        subForm.goods_cat = subForm.goods_cat.join(',')

        // console.log(subForm)
        const { data: res } = await this.$http.post('/goods', subForm)
        if (res.meta.status !== 201) {
          return this.$message.error('上传数据失败！')
        }

        // 上传成功
        this.$message.success('上传数据成功！')
        this.$router.push('/goods')
      })
    }

  },
  computed: {
    // 定义一个获取第三级参数的计算属性
    getIndex: function () {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style scoped lang="less">
  .el-card,.el-tabs {
    margin-top: 20px;
  }

  .el-steps--horizontal {
    margin-top:33px;
  }

  .preview {
    width: 100%;
  }
</style>
