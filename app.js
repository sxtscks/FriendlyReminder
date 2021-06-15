require('dotenv').config()
const express = require('express')
const CronJob = require('cron').CronJob;
const fetch = require("node-fetch");
const Telegraf = require('telegraf')
const session = require('telegraf/session')
const dbConnect = require('./connect/dbConnect')
const { getMainMenu } = require('./keyboard.js')
const { yesNoKeyboard } = require('./keyboard.js')
const { addTask } = require('./db')
const { getTasks } = require('./db')
const { deleteTask } = require('./db')
const Task = require('./models/taskModel')

const app = express()
const PORT = process.env.PORT || 3000

dbConnect()


let newsUrl = 'https://newsapi.org/v2/top-headlines?country=ru&apiKey=cf9b0edb496d4bf6aa12405dbc1cadc0'
let dogUrl = 'http://shibe.online/api/shibes?count=1&urls=true&httpsUrls=true'

function shuffle(arr) {
  var j, temp;
  for (var i = arr.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    temp = arr[j];
    arr[j] = arr[i];
    arr[i] = temp;
  }
  return arr;
}

async function newsPost() {
  const response = await fetch(newsUrl)
  const resBody = await response.json()
  const filteredArr = resBody.articles
  const result = shuffle(filteredArr)
  const final = result.slice(0, 5)
  return final
}

async function dogPost() {
  const response = await fetch(dogUrl)
  const resBody = await response.json()
  return resBody.join('')
}


const bot = new Telegraf(process.env.BOT_TOKEN)

bot.use(session())


bot.start(ctx => {
  ctx.reply(`Привет, ${ctx.message.from.first_name}!`, getMainMenu())
  const newsJob = new CronJob('00 30 8 * * 1-5', async function () {
    let arr = await newsPost()
    for (let i of arr) {
      bot.telegram.sendMessage(ctx.chat.id, `${i.title}\n\n${i.url}`)
    }
  });
  const newsJob2 = new CronJob('00 30 13 * * 1-5', async function () {
    let arr = await newsPost()
    for (let i of arr) {
      bot.telegram.sendMessage(ctx.chat.id, `${i.title}\n\n${i.url}`)
    }
  });
  const newsJob3 = new CronJob('00 20 19 * * 1-5', async function () {
    let arr = await newsPost()
    for (let i of arr) {
      bot.telegram.sendMessage(ctx.chat.id, `${i.title}\n\n${i.url}`)
    }
  });


  const a = '00 20 17'
  const presJob = new CronJob(`${a} * * 1-5`, async function () {
    bot.telegram.sendMessage(ctx.chat.id, `Мама, я в телевизоре!`)
  });


  newsJob.start();
  newsJob2.start();
  newsJob3.start();
  presJob.start();
})

bot.command('help', ctx => {
  ctx.replyWithHTML(`· Напиши что-нибудь, чтобы <b>добавить</b> задачу!\n\n· Чтобы удалить задачу, напиши или скопируй задачу еще раз, отправь и нажми <i>Удалить</i>\n\n· Этот бот умеет отправлять напоминания! Для этого, добавь конкретное время в конце твоей задачи, например <i>"Позвонить другу в 15:30"</i>\n\n· И еще кое-что! Этот бот отправляет подборку последних новостей 3 раза в день: утром, в обед и вечером после работы. Если не хочешь ждать - просто нажми на кнопку <i>Новости</i>`)
})

bot.hears('Новости', async ctx => {
  let arr = await newsPost()
  for (let i of arr) {
    await ctx.replyWithHTML(`<b>${i.title}</b>\n\n${i.url}`)
  }
});

bot.hears('Мои задачи', async ctx => {
  const tasks = await getTasks(ctx.chat.id)
  let result = ''
  for (let i = 0; i < tasks.length; i++) {
    result = result + `${i + 1}. ${tasks[i].title}\n`
  }
  ctx.replyWithHTML(`<b>Список твоих дел:</b>\n\n${result}`)
});


bot.hears('Хочу фотку собаки', async ctx => {
  let dogPic = await dogPost()
  ctx.replyWithPhoto(
    dogPic,
    {
      caption: 'Не благодари!'
    }
  )
});

bot.hears('Привет', async ctx => {
  ctx.reply('Привет!')
});
bot.hears('Как дела?', async ctx => {
  ctx.reply('Да норм')
});
bot.hears('Что делаешь?', async ctx => {
  ctx.reply('Работаю')
});

bot.on('text', ctx => {
  ctx.session.taskText = ctx.message.text

  ctx.replyWithHTML(
    `Ты хочешь добавить или удалить задачу?\n\n` +
    `<i>${ctx.message.text}</i>`,
    yesNoKeyboard()
  )
})

bot.action(['yes', 'no', 'delete'], async ctx => {
  if (ctx.callbackQuery.data === 'yes') {
    await addTask(ctx.session.taskText, ctx.chat.id)
    const myTask = await Task.findOne({ title: ctx.session.taskText })

    if (myTask.time !== '') {
      const myText = ctx.session.taskText
      async function jobCreate(myText1) {
        const data = await Task.findOne({ title: myText1 })
        const myTime = data.time
        const newJob = new CronJob(`${myTime} * * 1-5`, async function () {
          bot.telegram.sendMessage(ctx.chat.id, `Не забудь! Ты хотел ${myText1.toLowerCase()}!`)
        });
        newJob.start()
      }
      await jobCreate(myText)
    }

    ctx.editMessageText('Задача успешно добавлена!')

  }
  if (ctx.callbackQuery.data === 'no') {
    ctx.deleteMessage()
  }

  if (ctx.callbackQuery.data === 'delete') {
    deleteTask(ctx.session.taskText)
    ctx.editMessageText('Задача успешно удалена')
  }
})



bot.launch()

app.listen(PORT, () => console.log(`My server is running on port ${PORT}`))






