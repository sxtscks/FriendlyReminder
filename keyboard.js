const Markup = require('telegraf/markup')
const Task = require('./models/taskModel')

function getMainMenu() {
  return Markup.keyboard([
    ['Мои задачи'],
    ['Хочу фотку собаки'],
    ['Новости']
  ]).resize().extra()
}

function yesNoKeyboard() {
  return Markup.inlineKeyboard([
    Markup.callbackButton('Добавить', 'yes'),
    Markup.callbackButton('Не добавлять', 'no'),
    Markup.callbackButton('Удалить', 'delete')
  ], { columns: 2 }).extra()
}

module.exports = { getMainMenu, yesNoKeyboard }
