const express = require('express')
// 创建路由对象
const router = express.Router()
// 1. 导入验证表单数据的中间件
const expressJoi = require('@escook/express-joi')

// 导入用户路由处理函数模块
const infoHandler = require('../router_handler/home')
const { update_avatar_schema } = require('../schema/home')

router.get('/getHomeList', infoHandler.getHomeList)

router.post('/postClockin', infoHandler.postClockin)

router.get('/getCardDays', infoHandler.getCardDays)

router.post('/abnormalReport', infoHandler.abnormalReport)

router.get('/getHealthcode', infoHandler.getHealthcode)

router.post('/leaveSchool', infoHandler.leaveSchool)

router.post('/returnSchool', infoHandler.returnSchool)

router.get('/getAbnormal', infoHandler.getAbnormal)

router.post('/updateAbnormal', infoHandler.updateAbnormal)

router.get('/getResultMsg', infoHandler.getResultMsg)

router.post('/postMessage', infoHandler.postMessage)

router.get('/getMessage', infoHandler.getMessage)

router.post('/updateRead', infoHandler.updateRead)

router.get('/getCardMsg', infoHandler.getCardMsg)

module.exports = router