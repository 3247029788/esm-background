// 验证规则对象 - 更新头像
// dataUri() 指的是如下格式的字符串数据：
// data:image/png;base64,VE9PTUFOWVNFQ1JFVFM=
const joi = require('@hapi/joi')

const avatar = joi.string().dataUri().required()

exports.update_avatar_schema = {
    body: {
      avatar,
    },
}
  