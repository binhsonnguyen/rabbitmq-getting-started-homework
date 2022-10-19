#!/usr/bin/env node
require('dotenv').config()

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
    const queue = {
      name: 'greeting',
      options: {
        durable: false
      }
    }
    channel.assertQueue(queue.name, queue.options)

    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
    channel.consume(queue.name, function (msg) {
      console.log('[x] received %s', msg.content.toString())
    }, {
      noAck: false
    })

  })
})