#!/usr/bin/env node

const amqp = require('amqplib/callback_api');
const ConnectionStringBuilder = require('../connection-string-builder')

const connectionString = new ConnectionStringBuilder().fromEnv().build()
amqp.connect(connectionString, function (err1, connection) {
  if (!!err1) {
    throw err1
  }
  connection.createChannel(function (err2, channel) {
    if (!!err2) {
      throw err2
    }

    const exchange = 'topical_logs'
    channel.assertExchange(exchange, 'topic', {
      durable: false
    })

    const args = process.argv.slice(2)
    const msg = args.slice(1,).join(' ') || 'Hello world!'
    const routingKey = !!args.length ? args[0] : 'anonymous.info'
    channel.publish(exchange, routingKey, Buffer.from(msg))
    console.log('[x] sent %s: %s', routingKey, msg)

    channel.close

    setTimeout(function () {
      channel.close()
      connection.close()
      process.exit(0)
    }, 500);
  })
})