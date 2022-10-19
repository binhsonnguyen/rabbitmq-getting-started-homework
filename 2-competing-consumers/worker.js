const SECONDS = 1000

module.exports = function (msg) {
  const difficulty = msg.content.toString().split('.').length
  console.log('[x] received %s', msg.content.toString())
  setTimeout(function () {
    console.log('[x] Done!')
  }, difficulty * SECONDS)
}