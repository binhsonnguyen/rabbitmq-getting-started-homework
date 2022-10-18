#!/usr/bin/env node
require('dotenv').config()

const amqp = require('amqplib/callback_api');
const queue_options = {
  greeting: {
    durable: false
  }
}

amqp.connect(`amqp://${process.env.RABBITMQ_HOST}`, function (err1, conn) {
  if (!!err1) {
    throw err1
  }
  conn.createChannel(function (err2, channel) {
    if (!!err2) {
      throw err2
    }
    const queue = 'greeting'
    channel.assertQueue(queue, queue_options['greeting'])

    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
    channel.consume(queue, function (msg) {
      console.log('[x] received %s', msg.content.toString())
    }, {
      noAck: false
    })

  })
})