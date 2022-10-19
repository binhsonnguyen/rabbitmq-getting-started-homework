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

    const queue = {
      name: 'task_queue',
      options: {
        durable: true
      }
    }
    channel.assertQueue(queue.name, queue.options)

    const msg = process.argv.slice(2,).join(' ') || 'Hello world!'
    const msgOptions = {
      persistent: true
    }
    channel.sendToQueue(queue.name, Buffer.from(msg), msgOptions)
    console.log('[x] sent %s', msg)

    setTimeout(function() {
      connection.close();
      process.exit(0)
    }, 500);
  })
})