#!/usr/bin/env node

const amqp = require('amqplib/callback_api');
const ConnectionStringBuilder = require('../connection-string-builder')

const args = process.argv.slice(2,)
if (!args.length) {
  console.log('Usage: rpc_client.js num')
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

    channel.assertQueue('', {
      exclusive: true
    }, function (err3, ok) {
      if (err3) {
        throw err3
      }

      const callbackQueue = ok.queue
      const correlationId = generateUuid()
      const num = parseInt(args[0])

      console.log('[x] requesting for fib(%d)', num)

      channel.consume(callbackQueue, function (msg) {
        if (msg.properties.correlationId === correlationId) {
          console.log('[.] got %s', msg.content.toString())

          setTimeout(function() {
            connection.close();
            process.exit(0)
          }, 500);
        }

      }, {
        noAck: true
      })

      channel.sendToQueue('rpc_queue', Buffer.from(num.toString()), {
        correlationId: correlationId,
        replyTo: callbackQueue
      })
    })
  })
})

function generateUuid() {
  return Math.random().toString() +
    Math.random().toString() +
    Math.random().toString();
}