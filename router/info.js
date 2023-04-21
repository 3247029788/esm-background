const express = require('express')
// 创建路由对象
const router = express.Router()

// 导入用户路由处理函数模块
const infoHandler = require('../router_handler/info')

router.get('/getUserinfo', infoHandler.getUserinfo)

router.get('/getNcovinfo', infoHandler.getNcovinfo)

router.get('/getProvince', infoHandler.getProvince)

router.get('/getProvinceNcov', infoHandler.getProvinceNcov)

router.get('/getMapdata', infoHandler.getMapdata)

router.get('/getCS', infoHandler.getCS)

router.post('/updateUserInfo', infoHandler.updateUserInfo)

router.post('/updatePassword', infoHandler.updatePassword)

router.get('/getRecord', infoHandler.getRecord)

router.get('/getAllUser', infoHandler.getAllUser)

router.get('/getAllUserInfo', infoHandler.getAllUserInfo)

router.post('/updateVIPUserInfo', infoHandler.updateVIPUserInfo)

router.get('/getLeaveInfo', infoHandler.getLeaveInfo)

router.get('/getReturnInfo', infoHandler.getReturnInfo)

router.post('/postLeaveResult', infoHandler.postLeaveResult)

router.post('/postReturnResult', infoHandler.postReturnResult)

router.get('/getNews', infoHandler.getNews)

module.exports = router