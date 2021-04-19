const mongoose = require('mongoose')
const { dbConnectionURL, options } = require('./dbConfig')

function dbConnect() {
  console.log(dbConnectionURL)
  mongoose.connect(dbConnectionURL, options, (err) => {
    if (err) return console.log(err)
    console.log('Connected to DB')
  })
}

module.exports = dbConnect 
