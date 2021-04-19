const { createIndexes } = require('./models/taskModel')
const Task = require('./models/taskModel')

async function addTask(text, id) {
  if (text.match(/(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]/gmi)) {
    const time = text.match(/(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]/gmi).join('')
    const timeForCron = time.split(':').reverse().join(' ')
    const newTask = new Task({ title: text, chatId: id, time: `00 ${timeForCron}` })
    await newTask.save()
  } else {
    const newTask = new Task({ title: text, chatId: id, time: '' })
    await newTask.save()
  }
}

async function getTasks(id) {
  const allTasks = await Task.find({ chatId: id })
  return allTasks
}

async function deleteTask(text) {
  await Task.deleteOne({ title: text })
}


module.exports = { addTask, getTasks, deleteTask }
