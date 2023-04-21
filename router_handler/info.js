/**
 * 在这里定义和用户相关的路由处理函数，供 /router/user.js 模块进行调用
 */
// 导入数据库操作模块
const db = require('../db/index')
// 导入配置文件
const config = require('../config')

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

// 获取个人信息
exports.getUserinfo = (req, res) => {
  //解析token
  let token = req.headers.authorization;
  token = token.replace(/^bearer\s/i, "")
  let decoded = verifyToken(token);

  let data = ''
  if(req.query.username){
    data = req.query.username
  }else data = decoded.username

  const sql = `select * from ev_users where username=?`
  db.query(sql, data, function (err, results) {
    // 执行 SQL 语句失败
    if (err) return res.cc(err)
    // 执行 SQL 语句成功，但是查询到数据条数不等于 1
    if (results.length !== 1) return res.cc('查询失败！')
    // 不能发送密码
    delete results[0].password
    res.send({
      status: 0,
      message: 'success',
      result: results[0]
    })
  })
}

// 修改个人信息
exports.updateUserInfo = (req, res) => {
  //解析token
  let token = req.headers.authorization;
  token = token.replace(/^bearer\s/i, "")
  let decoded = verifyToken(token);
  let data = {}
  data.avatar = req.body.avatar
  data.email = req.body.email
  data.mobile = req.body.mobile
  data.nickName = req.body.nickName
  data.realName = req.body.realName
  data.sex = req.body.sex
  data.tel = req.body.tel
  data.address = req.body.address
  data.username = req.body.username

  const sql = `update ev_users set ? where username=?`
  db.query(sql, [data,decoded.username], function (err, results) {
    // 执行 SQL 语句失败
    if (err) return res.cc(err)
    // 执行 SQL 语句成功，但是查询到数据条数不等于 1
    console.log(results)
    if (results.affectedRows !== 1) return res.cc('查询失败！')
    res.send({
      status: 0,
      message: 'success',
    })
  })
}

// 修改密码
exports.updatePassword = (req, res) => {
  //解析token
  let token = req.headers.authorization;
  token = token.replace(/^bearer\s/i, "")
  let decoded = verifyToken(token);

  const sql = `select password from ev_users where username=?`
  db.query(sql, decoded.username, function (err, results) {
    // 执行 SQL 语句失败
    if (err) return res.cc(err)
    const bcrypt = require('bcryptjs')

    // 判断提交的旧密码是否正确
    const compareResult = bcrypt.compareSync(req.body.oldPassword, results[0].password)
    if (!compareResult) return res.cc('原密码错误！')
    const sql = `update ev_users set password=? where username=?`

    // 对新密码进行 bcrypt 加密处理
    const newPwd = bcrypt.hashSync(req.body.newPassword, 10)

    // 执行 SQL 语句，根据 id 更新用户的密码
    db.query(sql, [newPwd, decoded.username], (err, results) => {
      // SQL 语句执行失败
      if (err) return res.cc(err)

      // SQL 语句执行成功，但是影响行数不等于 1
      if (results.affectedRows !== 1) return res.cc('更新密码失败！')

      // 更新密码成功
      res.cc('更新密码成功！', 0)
    })
  })
}

// 病毒信息
exports.getNcovinfo = (req, res) => {
  const Ncovinfo = req.query
  const sql = `select * from ncov_msg`
  db.query(sql, function (err, results) {
    // 执行 SQL 语句失败
    if (err) return res.cc(err)
    // 执行 SQL 语句成功，但是查询到数据条数不等于 1
    if (results.length !== 1) return res.cc('查询失败！')
    res.send({
      status: 0,
      message: 'success',
      result: results[0]
    })
  })
}

// 省市信息
exports.getProvince = (req, res) => {
  const sql = `select province,id from province_data`
  db.query(sql, function (err, results) {
    // 执行 SQL 语句失败
    if (err) return res.cc(err)
    // if (results.length !== 1) return res.cc('查询失败！')
    const data = {};
    results.forEach(result => {
      data[result.id] = result.province;
    });
    res.send({
      status: 0,
      message: 'success',
      result: data
    })
  })
}

// 省市疫情信息
exports.getProvinceNcov = (req, res) => {
  const data = req.query
  const sql = `select * from province_data where province=?`
  db.query(sql, data.province, function (err, results) {
    // 执行 SQL 语句失败
    if (err) return res.cc(err)
    // if (results.length !== 1) return res.cc('查询失败！')
    res.send({
      status: 0,
      message: 'success',
      result: results[0]
    })
  })
}

// 地图疫情
exports.getMapdata = (req, res) => {
  const sql = `select * from province_data`
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

// 每日新增和疑似病例（折线图）
// exports.getCS = (req, res) => {
//   const cs = req.body
//   const value = cs.map(c => [c.date, c.confirm, c.suspect]);
//   console.log(value)
//   const sql = `insert into dateconfirm (date,confirm,suspect) values ?`
//   db.query(sql, [value],function (err, results) {
//     // 执行 SQL 语句失败
//     if (err) return res.cc(err)
//     res.send({
//       status: 0,
//       message: 'success',
//       result: results
//     })
//   })
// }

// 每日新增和疑似病例（折线图）
exports.getCS = (req, res) => {
  const sql = `select * from dateconfirm`
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

// 获取提交记录（健康/异常）
exports.getRecord = (req, res) => {
  //解析token
  let token = req.headers.authorization;
  token = token.replace(/^bearer\s/i, "")
  let decoded = verifyToken(token);

  const sql = `select * from clockin where username = ?`
  db.query(sql, decoded.username, function (err, results) {
    // 执行 SQL 语句失败
    if (err) return res.cc(err)
    let data = {}
    data.clockin = results
    const sql = `select * from abnormal_report where username = ?`
    db.query(sql, decoded.username, function (err, results) {
      // 执行 SQL 语句失败
      if (err) return res.cc(err)
      data.abnormal = results
      res.send({
        status: 0,
        message: 'success',
        result: data
      })
    })
  })
}

// 获取所有用户名
exports.getAllUser = (req, res) => {
  //解析token
  let token = req.headers.authorization;
  token = token.replace(/^bearer\s/i, "")
  let decoded = verifyToken(token);

  const sql = `select username from ev_users`
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

// 获取所有用户信息
exports.getAllUserInfo = (req, res) => {
  //解析token
  let token = req.headers.authorization;
  token = token.replace(/^bearer\s/i, "")
  let decoded = verifyToken(token);

  const sql = `select * from ev_users`
  db.query(sql, function (err, results) {
    // 执行 SQL 语句失败
    if (err) return res.cc(err)
    results.forEach(item => {
      delete item.password
    })
    res.send({
      status: 0,
      message: 'success',
      result: results
    })
  })
}

// 管理员更新用户信息
exports.updateVIPUserInfo = (req, res) => {
  //解析token
  let token = req.headers.authorization;
  token = token.replace(/^bearer\s/i, "")
  let decoded = verifyToken(token);

  const sql = `update ev_users set ? where id = ?`
  db.query(sql, [req.body,req.body.id],function (err, results) {
    // 执行 SQL 语句失败
    if (err) return res.cc(err)
    res.send({
      status: 0,
      message: 'success',
    })
  })
}

// 获取离校申请信息
exports.getLeaveInfo = (req, res) => {
  const sql = `select * from leave_school`
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

// 获取返校申请信息
exports.getReturnInfo = (req, res) => {
  const sql = `select * from return_school`
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

// 提交离校审批结果
exports.postLeaveResult = (req, res) => {
  const sql = `update leave_school set result = ? , isExcute = 1 where id = ?`
  db.query(sql, [req.body.result,req.body.id],function (err, results) {
    // 执行 SQL 语句失败
    if (err) return res.cc(err)
    res.send({
      status: 0,
      message: 'success',
    })
  })
}

// 提交返校审批结果
exports.postReturnResult = (req, res) => {
  const sql = `update return_school set result = ? , isExcute = 1 where id = ?`
  db.query(sql, [req.body.result,req.body.id], function (err, results) {
    // 执行 SQL 语句失败
    if (err) return res.cc(err)
    res.send({
      status: 0,
      message: 'success',
    })
  })
}

// 获取新闻
exports.getNews = (req, res) => {
  const sql = `select * from news`
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