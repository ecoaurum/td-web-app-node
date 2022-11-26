const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

const token = '5755917870:AAH13q409zZjobt25puXcLXnclCsIHNzPJE';
const webAppUrl = 'https://calm-baklava-4c09ea.netlify.app/';

const bot = new TelegramBot(token, {polling: true});
const app = express();
const PORT = 8000;

app.use(express.json());
app.use(cors());


bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if(text === '/start') {
    await bot.sendMessage(chatId, 'Ниже появится кнопка. Заполнить форму', {
        reply_markup: {
            keyboard: [
                [{text: 'Заполнить форму', web_app: {url: webAppUrl + 'form'}}]
            ]
        }
    });

    await bot.sendMessage(chatId, 'Заходите в наш интернет магазин', {
      reply_markup: {
          inline_keyboard: [
              [{text: 'Зделать заказ', web_app: {url: webAppUrl}}]
          ]
      }
  });
  }

  if (msg?.web_app_data?.data) {
    try {
        const data = JSON.parse(msg?.web_app_data?.data);
        // console.log(data);

        await bot.sendMessage(chatId, 'Спасибо за обратную связь!');
        await bot.sendMessage(chatId, 'Ваша страна: ' + data.country);
        await bot.sendMessage(chatId, 'Ваша улица: ' + data.street);

        setTimeout(async () => {
        await bot.sendMessage(chatId, 'Всю информацию вы получите в этом чате');
        }, 3000);
    } catch (e) {
        console.log(e);
    }
  }
});

app.post('/web-data', async (req, res) => {
    const { queryId, products, totalPrice} = req.body;
    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успешная покупка',
            input_message_content: { message_text: 'Поздравляем с покупкой, вы приобрели товар на сумму' + totalPrice}
        });
        return res.status(200).json({});
    } catch (e) {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Не удалось приобрести товар',
            input_message_content: { message_text: 'Не удалось приобрести товар'}
        });
        return res.status(500).json({});
    }
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

