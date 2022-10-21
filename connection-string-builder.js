require('dotenv').config()

module.exports = function ConnectionStringBuilder (user, password, host, port, virtualHost) {
  let protocol = 'amqp'
  host = host || 'localhost'
  port = port || 5672

  this.fromEnv = () => {
    let newHost = process.env.RABBITMQ_HOST || 'localhost'
    let newPort = process.env.RABBITMQ_PORT || 5672
    let newUser = process.env.RABBITMQ_USER || ''
    let newPassword = process.env.RABBITMQ_PASSWORD || ''
    let newVirtualHost = process.env.RABBITMQ_VIRTUALHOST || ''
    return new ConnectionStringBuilder(newUser, newPassword, newHost, newPort, newVirtualHost)
  }

  this.build = () => {
    let url = host
    if (!!port) url = `${url}:${port}`
    if (!!virtualHost) url = `${url}/${virtualHost}`
    if (!!user) url = `${user}:${password}@${url}`
    return `${protocol}://${url}`
  }
}
