require('dotenv').config()

module.exports = function ConnectionStringBuilder () {
  let protocol = 'amqp'
  let user = ''
  let password = ''
  let host = 'localhost'
  let port = 5672
  let virtualHost = ''

  this.fromEnv = () => {
    host = process.env.RABBITMQ_HOST || 'localhost'
    port = process.env.RABBITMQ_PORT || 5672
    user = process.env.RABBITMQ_USER || ''
    password = process.env.RABBITMQ_PASSWORD || ''
    virtualHost = process.env.RABBITMQ_VIRTUALHOST || ''
    return this
  }

  this.build = () => {
    let url = host
    if (!!port) url = `${url}:${port}`
    if (!!virtualHost) url = `${url}/${virtualHost}`
    if (!!user) url = `'${user}':'${password}'@'${url}'`
    return `${protocol}://${url}`
  }
}
