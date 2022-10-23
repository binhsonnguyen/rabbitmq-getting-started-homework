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

    const exchange = 'logs'
    const fanoutType = 'fanout'
    channel.assertExchange(exchange, fanoutType, {
      durable: false
    })

    const msg = process.argv.slice(2,).join(' ') || 'Hello world!'
    const noRoutingKeyBecauseOfMeaningless = ''
    channel.publish(exchange, noRoutingKeyBecauseOfMeaningless, Buffer.from(msg))
    console.log('[x] sent %s', msg)

    channel.close

    setTimeout(function () {
      channel.close()
      connection.close()
      process.exit(0)
    }, 500);
  })
})