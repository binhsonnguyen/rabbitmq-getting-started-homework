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
    const rpcQueue = 'rpc_queue'
    channel.assertQueue(rpcQueue, {
      durable: true
    })
    channel.prefetch(1)

    console.log('[*] Waiting for RPC requests. To exit press CTRL+C');

    channel.consume(rpcQueue, function reply (msg) {
      const num = parseInt(msg.content.toString())
      console.log('[.] fib(%d)', num)

      const r = fibonacci(num)
      const callbackQueue = msg.properties.replyTo
      const correlationId = msg.properties.correlationId
      channel.sendToQueue(callbackQueue, Buffer.from(r.toString()), {
        correlationId: correlationId
      })

      channel.ack(msg)
    }, {
      noAck: false
    })
  })
})

function fibonacci(n) {
  if (n === 0 || n === 1)
    return n;
  else
    return fibonacci(n - 1) + fibonacci(n - 2);
}