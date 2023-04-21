/**
 * 在这里home页面展示的数据相关的路由处理函数
 */

const db = require('../db/index')
// 导入配置文件
const config = require('../config')
const dayjs = require('dayjs')

// 解析token
const jwt = require('jsonwebtoken');
function verifyToken(token) {
  try {
    var decoded = jwt.verify(token, config.jwtSecretKey);
    return decoded; // 如果Token有效，则返回解码后的token payload
  } catch(err) {
    return null; // 如果Token无效，则返回null
  }
}

/*
  * 获取首页菜单
*/
exports.getHomeList = (req, res) => {
    // 解析token
    // let token = req.headers.authorization;
    // token = token.replace(/^bearer\s/i, "")
    // let decoded = verifyToken(token);
    // console.log(decoded)
  
    const userinfo = req.query
    const sql = `select * from list where requestPath != ''`
    db.query(sql, function (err, results) {
      // 执行 SQL 语句失败
      if (err) return res.cc(err)
      res.send({
        status: 0,
        message: 'success',
        result: results
      })
    })
}

// 提交打卡表单
exports.postClockin = (req, res) => {
  //解析token
  let token = req.headers.authorization;
  token = token.replace(/^bearer\s/i, "")
  let decoded = verifyToken(token);

  let form = req.body
  form.username = decoded.username
  const sql = `select createTime from clockin where username = ?`
  // const sql = `select * from list where requestPath != ''`
  db.query(sql, form.username, function (err, results) {
    // 执行 SQL 语句失败
    if (err) return res.cc(err)
    // 计算天数之差
    const diffInDays = dayjs(form.createTime).diff(dayjs(results[results.length -1].createTime), 'day');
    if(diffInDays > 0) {
      form.continuous ++
      delete form.id
      const sql = 'insert into clockin set ?'
      db.query(sql,form, function (err, results) {
        // 执行 SQL 语句失败
        if (err) return res.cc(err)
        // 添加成功
        res.cc('添加成功！',0)
      })
    }else{
      res.cc('今日已打卡！')
    }
  })
}

// 获取打卡天数
exports.getCardDays = (req,res) => {
  //解析token
  let token = req.headers.authorization;
  token = token.replace(/^bearer\s/i, "")
  let decoded = verifyToken(token);

  const sql = 'select continuous from clockin where username = ?'
  db.query(sql, decoded.username, function (err, results) {
    // 执行 SQL 语句失败
    if (err) return res.cc(err)
    let continuous = 0
    // 如果是未进行打卡，数据库没有打卡信息
    if(results.length != 0) continuous = results[results.length - 1].continuous
    res.send({
      status: 0,
      message:'success',
      result: continuous
    })
  })
}

// TODO:异常上报
exports.abnormalReport = (req, res) => {
  //解析token
  let token = req.headers.authorization;
  token = token.replace(/^bearer\s/i, "")
  let decoded = verifyToken(token);

  let form = req.body
  form.username = decoded.username
  const sql = `insert into abnormal_report set ?`
  db.query(sql, form, function (err, results) {
    // 执行 SQL 语句失败
    if (err) return res.cc(err)
    res.send({
      status: 0,
      message:'success',
    })
  })
}

// 获取健康码信息
exports.getHealthcode = (req, res) => {
  //解析token
  let token = req.headers.authorization;
  token = token.replace(/^bearer\s/i, "")
  let decoded = verifyToken(token);
  
  const sql = `select * from healthcode where username = ?`
  db.query(sql, decoded.username, function (err, results) {
    // 执行 SQL 语句失败
    if (err) return res.cc(err)
    res.send({
      status: 0,
      message:'success',
      result: results[0]
    })
  })
}

// 离校申请
exports.leaveSchool = (req, res) => {
  //解析token
  let token = req.headers.authorization;
  token = token.replace(/^bearer\s/i, "")
  let decoded = verifyToken(token);

  let form = req.body
  form.username = decoded.username
  const sql = `insert into leave_school set ?`
  db.query(sql, form, function (err, results) {
    // 执行 SQL 语句失败
    if (err) return res.cc(err)
    res.send({
      status: 0,
      message:'success',
    })
  })
}

// 返校申请
exports.returnSchool = (req, res) => {
  //解析token
  let token = req.headers.authorization;
  token = token.replace(/^bearer\s/i, "")
  let decoded = verifyToken(token);

  let form = req.body
  form.username = decoded.username
  const sql = `insert into return_school set ?`
  db.query(sql, form, function (err, results) {
    // 执行 SQL 语句失败
    if (err) return res.cc(err)
    res.send({
      status: 0,
      message:'success',
    })
  })
}

// 查询异常信息
exports.getAbnormal = (req, res) => {
  let sql = ''
  if(req.query.exceptionType !== ''){
    if(req.query.username === '') {
      sql = `select * from abnormal_report where exceptionType = ?` 
    }else sql = `select * from abnormal_report where username = ? and exceptionType = ?`
  }else{
    if(req.query.username === '') {
      sql = `select * from abnormal_report` 
    }else sql = `select * from abnormal_report where username = ?`
  }
  if(req.query.username === ''){
    db.query(sql, req.query.exceptionType, function (err, results) {
      // 执行 SQL 语句失败
      if (err) return res.cc(err)
      res.send({
        status: 0,
        message:'success',
        result: results
      })
    })
  }else{
    db.query(sql, [req.query.username,req.query.exceptionType], function (err, results) {
      // 执行 SQL 语句失败
      if (err) return res.cc(err)
      res.send({
        status: 0,
        message:'success',
        result: results
      })
    })
  }
}

// 异常处理
exports.updateAbnormal = (req, res) => {
  //解析token
  let token = req.headers.authorization;
  token = token.replace(/^bearer\s/i, "")
  let decoded = verifyToken(token);

  let form = {}
  form.isDealWith = req.body.status
  form.result = req.body.result
  form.resultUser = decoded.username
  const sql = `update abnormal_report set ? where id = ?`
  db.query(sql, [form,req.body.id], function (err, results) {
    // 执行 SQL 语句失败
    if (err) return res.cc(err)
    res.send({
      status: 0,
      message:'success',
      result: results
    })
  })
}

// 获取异常处理人信息
exports.getResultMsg = (req, res) => {
  //解析token
  let token = req.headers.authorization;
  token = token.replace(/^bearer\s/i, "")
  let decoded = verifyToken(token);

  let form = {}
  form.isDealWith = req.body.status
  form.result = req.body.result
  form.resultUser = decoded.username
  const sql = `select * from abnormal_report where id = ?`
  db.query(sql, req.query.id, function (err, results) {
    // 执行 SQL 语句失败
    if (err) return res.cc(err)
    const sql2 = `select mobile from ev_users where username = ?`
    db.query(sql2, decoded.username, function (err1, result2) {
      // 执行 SQL 语句失败
      if (err1) return res.cc(err1)
      results[0].userMobile = result2[0].mobile
      db.query(sql2, req.query.username, function (err2, result3) {
        // 执行 SQL 语句失败
        if (err2) return res.cc(err2)
        results[0].resultMobile = result3[0].mobile
        res.send({
          status: 0,
          message:'success',
          result: results[0]
        })
      })
    })
  })
}

// 发布信息
exports.postMessage = (req, res) => {
  //解析token
  let token = req.headers.authorization;
  token = token.replace(/^bearer\s/i, "")
  let decoded = verifyToken(token);

  let data = req.body
  let arr = []
  data.recipients.forEach(item => {
    arr.push([item,data.theme,data.text,decoded.username])
  })
  const sql = `insert into message(recipients, theme, text, addresser) values ?`
  db.query(sql, [arr], function (err, results) {
    // 执行 SQL 语句失败
    if (err) return res.cc(err)
    res.send({
      status: 0,
      message:'success',
    })
  })
}

// 查询信息
exports.getMessage = (req, res) => {
  //解析token
  let token = req.headers.authorization;
  token = token.replace(/^bearer\s/i, "")
  let decoded = verifyToken(token);

  const sql = `select * from message where recipients = ?`
  db.query(sql, decoded.username, function (err, results) {
    // 执行 SQL 语句失败
    if (err) return res.cc(err)
    res.send({
      status: 0,
      message:'success',
      result: results
    })
  })
}

// 更改信息是否读取(已读/未读)
exports.updateRead = (req, res) => {
  const sql = `update message set isRead = ? where id = ?`
  db.query(sql, [req.body.isRead,req.body.id], function (err, results) {
    // 执行 SQL 语句失败
    if (err) return res.cc(err)
    res.send({
      status: 0,
      message:'success',
    })
  })
}

// 更改信息是否读取(已读/未读)
exports.getCardMsg = (req, res) => {
  //解析token
  let token = req.headers.authorization;
  token = token.replace(/^bearer\s/i, "")
  let decoded = verifyToken(token);

  const sql = `select * from clockin where username = ?`
  db.query(sql, decoded.username, function (err, results) {
    // 执行 SQL 语句失败
    if (err) return res.cc(err)
    res.send({
      status: 0,
      message:'success',
      result: results[results.length - 1]
    })
  })
}