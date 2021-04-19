const { model, Schema } = require('mongoose')

const taskSchema = new Schema({
  title: String,
  chatId: String,
  time: String,
})

const Task = model('tasks', taskSchema)

module.exports = Task
