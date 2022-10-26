#!/usr/bin/env node

const amqp = require('amqplib/callback_api');
const ConnectionStringBuilder = require('../connection-string-builder')

const connectionString = new ConnectionStringBuilder().fromEnv().build()
amqp.connect(connectionString, function (err1, connection) {
  if (!!err1) {
    throw err1
  }
  connection.createConfirmChannel(function (err2, channel) {
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

    const msg = 'Hello world!'
    channel.sendToQueue(queue.name, Buffer.from(msg), {})
    channel.waitForConfirms(function (err, ok) {
      if (!!err) {
        console.log('sent failed!')
      } else {
        console.log('message confirmed! %s', ok)
      }
    }).then(() => {
      channel.close()
      connection.close()
      process.exit(0)
    })
  })
})