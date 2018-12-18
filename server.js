const express = require('express')
// const history = require('connect-history-api-fallback')
// const proxy = require('http-proxy-middleware')
const app = express()

// app.use(history())
app.use(express.static('demo'))


app.listen(5001, () => {
  console.log(`server is listen at port 5001`)
})
