/**
 *@Description:
 *@Time :2020/7/21 14:44
 *@Created by zgpsh
 *@update :2020/7/21 14:44
 */

//注意这个文件是将项目挂载到node的入口文件
const express = require('express')

const app = express()

app.use(express.static('./dist'))

app.listen(3000,()=>{
  console.log("server is running ...")
})
