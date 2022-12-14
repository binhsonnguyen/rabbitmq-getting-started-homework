#!/usr/bin/env node
require('dotenv').config()

const amqp = require('amqplib/callback_api');
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
    const queue = {
      name: 'task_queue',
      options: {
        durable: true
      }
    }
    channel.assertQueue(queue.name, queue.options)
    channel.prefetch(1)

    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
    const workerOptions = {
      noAck: false
    }
    channel.consume(queue.name, function (msg) {
      const difficulty = msg.content.toString().split('.').length
      console.log('[x] received %s', msg.content.toString())
      setTimeout(function () {
        console.log('[x] Done!')
        channel.ack(msg)
      }, difficulty * SECONDS)
    }, workerOptions)
  })
})
