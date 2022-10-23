#!/usr/bin/env node
require('dotenv').config()

const amqp = require('amqplib/callback_api')
const ConnectionStringBuilder = require('../connection-string-builder')

const SECONDS = 1000
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
    channel.assertExchange(exchange, 'fanout', {
      durable: false
    })

    channel.assertQueue('', {
      exclusive: true
    }, function (err3, ok) {
      if (!!err3) {
        throw err3
      }

      console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', ok.queue)
      const noRoutingKeyBecauseOfMeaningless = ''
      channel.bindQueue(ok.queue, exchange, noRoutingKeyBecauseOfMeaningless)

      channel.consume(ok.queue, function (msg) {
        if (!!msg.content) {
          console.log('[x] received %s', msg.content.toString())
        }
      }, {
        noAck: true
      })
    })

  })
})
