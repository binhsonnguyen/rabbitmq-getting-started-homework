#!/usr/bin/env node
require('dotenv').config()

const amqp = require('amqplib/callback_api')
const ConnectionStringBuilder = require('../connection-string-builder')


const args = process.argv.slice(2)
if (!args.length) {
  console.log('Usage: receive_logs_direct.js [info] [warning] [error]')
  process.exit(1)
}

const connectionString = new ConnectionStringBuilder().fromEnv().build()

amqp.connect(connectionString, function (err1, connection) {
  if (!!err1) {
    throw err1
  }
  connection.createChannel(function (err2, channel) {
    if (!!err2) {
      throw err2
    }

    const exchange = 'classified_logs'
    channel.assertExchange(exchange, 'direct', {
      durable: false
    })

    channel.assertQueue('', {
      exclusive: true
    }, function (err3, ok) {
      if (!!err3) {
        throw err3
      }

      const queueName = ok.queue
      args.forEach(function (severity) {
        channel.bindQueue(queueName, exchange, severity)
      })

      channel.consume(queueName, function (msg) {
        if (!!msg.content) {
          console.log('[x] received %s: %s', msg.fields.routingKey, msg.content.toString())
        }
      }, {
        noAck: true
      })
    })

  })
})
