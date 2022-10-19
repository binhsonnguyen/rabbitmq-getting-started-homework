#!/usr/bin/env node
require('dotenv').config()

const amqp = require('amqplib/callback_api');

const queue_options = {
  greeting: {
    durable: false
  }
}

let url = process.env.RABBITMQ_HOST
const login = `${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}`
if (!!login) url = `${login}@${url}`
const virtualHost = process.env.RABBITMQ_VIRTUALHOST
if (!!virtualHost) url = `${url}/${virtualHost}`
const protocol = 'amqp'
const connectionString = `${protocol}://${url}`

amqp.connect(connectionString, function (err1, connection) {
  if (!!err1) {
    throw err1
  }
  connection.createChannel(function (err2, channel) {
    if (!!err2) {
      throw err2
    }
    const queue = 'greeting'
    channel.assertQueue(queue, queue_options['greeting'])

    const msg = 'Hello world!'
    channel.sendToQueue(queue, Buffer.from(msg))
    console.log('[x] sent %s', msg)

    setTimeout(function() {
      connection.close();
      process.exit(0)
    }, 500);
  })
})