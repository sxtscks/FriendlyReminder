require('dotenv').config()
const options = {
  useNewUrlParser: true,
  useFindAndModify: false, 
  useCreateIndex: true, 
  useUnifiedTopology: true, 
  poolSize: 10, 
  bufferMaxEntries: 0, 
}

const DB_HOST = process.env.DB_HOST
const DB_NAME = process.env.DB_NAME
const DB_PORT = process.env.DB_PORT

const dbConnectionURL = `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`

const serverURL = 'http://localhost:3000'

module.exports = {
  dbConnectionURL,
  options,
  serverURL,
}
