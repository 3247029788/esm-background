// 导入 express 模块
const express = require('express')

const bodyParser = require('body-parser');
// 创建 express 的服务器实例
const app = express()

const { createServer } = require("http");
const { Server } = require("socket.io");
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

// 导入 cors 中间件，解决跨域问题
const cors = require('cors')
app.use(cors())
// 使用body-parser中间件解析JSON数据
app.use(bodyParser.json({limit:'50mb'}));
// 解析表单数据
app.use(express.urlencoded({ extended: false }))
// 响应数据的中间件
app.use(function (req, res, next) {
  // status = 0 为成功； status = 1 为失败； 默认将 status 的值设置为 1，方便处理失败的情况
  res.cc = function (err, status = 1) {
    res.send({
      // 状态
      status,
      // 状态描述，判断 err 是 错误对象 还是 字符串
      message: err instanceof Error ? err.message : err,
    })
  }
  next()
})

// 导入配置文件
const config = require('./config')

// 解析 token 的中间件
const expressJWT = require('express-jwt')

// 使用 .unless({ path: [/^\/api\//] }) 指定哪些接口不需要进行 Token 的身份认证
app.use(expressJWT({ secret: config.jwtSecretKey }).unless({ path: [/^\/api\//] }))

// 导入并注册用户路由模块
const userRouter = require('./router/user')
const infoRouter = require('./router/info')
const homeRouter = require('./router/home')
app.use('/api', userRouter)
app.use('/my', infoRouter)
app.use('/my', homeRouter)

// 错误中间件
// app.use(function (err, req, res, next) {
//   // 数据验证失败
//   if (err instanceof joi.ValidationError) return res.cc(err)
//   // 未知错误
//   res.cc(err)
// })


// 监听客户端连接事件
let userList = []
io.on('connect', (socket) => {
  socket.on("login", data => {
    data.sid = socket.id;
    // 表示用户不存在,登录成功
    userList.push(data)
    socket.emit("loginSuccess", {
      ...data,
      msg: "登录聊天室成功"
    })
    //告诉所有的用户，有用户加入到聊天室，广播消息:io.emit
    io.emit("addUser", data)
    //告诉所有的用户，目前聊天室中有多少人
    io.emit("userList", userList)
    // 把登录成功的用户名和头像存储起来
    socket.username = data.username
  })

  // 用户断开连接的功能
  socket.on("disconnect", () => {
    //判断用户是否已登录
    if (typeof socket.username !== 'undefined') {
      // 把当前用户的信息从userList中删除掉
      let idx = userList.findIndex(item => item.username === socket.username)
      userList.splice(idx, 1)
      // 告诉所有人有人离开了聊天室
      io.emit("leaveroom", {
        username: socket.username
      })
      // 告诉所有人，userList发生了更新
      io.emit("userList", userList)
    }
  })

  // 监听聊天的消息
  socket.on("sendMessage", data => {
    //广播给所有用户
    io.emit("receiveMessage", data)
  })

  // 接受图片信息
  socket.on("sendImage", data => {
    //广播给所有用户
    io.emit("receiveImage", data)
  })

  // 一对一单聊消息
  socket.on("oneMessage", data => {
    socket.to(data.tosid).emit('oneMsg',data)
  })

   // 一对一单聊图片
   socket.on("oneImage", data => {
    // 发送给指定用户
    socket.to(data.tosid).emit('oneImg', data);
  })








  socket.on("Mytext", function (data) {
    console.log(data);
    io.emit("Mytext", "成功了");
  });

  // 监听客户端发送的消息
  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
    // 将消息广播给所有连接的客户端
    io.emit('chat message', msg);
  });

  socket.on('message', message => {
    console.log(`Received message: ${message}`);
    io.emit('message', message);
  });

  // 监听客户端断开连接事件
  // socket.on('disconnect', () => {
  //   console.log('user disconnected');
  // });
});
// 错误中间件
app.use(function (err, req, res, next) {
  // 捕获身份认证失败的错误
  if (err.name === 'UnauthorizedError') return res.cc('身份认证失败！')
  res.send({
    // 状态
    // 状态描述，判断 err 是 错误对象 还是 字符串
    message: err instanceof Error ? err.message : err,
  })
})

// 调用 app.listen 方法，指定端口号并启动web服务器
httpServer.listen(3007, function () {
  console.log('api server running at http://127.0.0.1:3007')
})