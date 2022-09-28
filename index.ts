const TelegramApi = require('node-telegram-bot-api');
const axios = require('axios');
require('dotenv').config();

const bot = new TelegramApi(process.env.TG_TOKET, { polling: true });

interface ICoin {
  id: string;
  rank: string;
  symbol: string;
  name: string;
  supply: string;
  maxSupply: null;
  marketCapUsd: string;
  volumeUsd24Hr: string;
  priceUsd: string;
  changePercent24Hr: string;
  vwap24Hr: string;
}

const coinOptions = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [
        { text: 'BTC', callback_data: 'bitcoin' },
        { text: 'ETH', callback_data: 'ethereum' },
        { text: 'USDT', callback_data: 'tether' },
      ],
      [
        { text: 'USDC', callback_data: 'usd-coin' },
        { text: 'BNB', callback_data: 'binance-coin' },
        { text: 'BUSD', callback_data: 'binance-usd' },
      ],
      [
        { text: 'XRP', callback_data: 'xrp' },
        { text: 'ADA', callback_data: 'cardano' },
        { text: 'SOL', callback_data: 'solana' },
      ],
      [{ text: 'TRX', callback_data: 'tron' }],
    ],
  }),
};
const start = () => {
  console.log('The bot is running');

  bot.setMyCommands([
    { command: '/start', description: 'Начальное приветствие' },
    { command: '/info', description: 'Информация о создателе' },
    { command: '/coin', description: 'Поиск топ-10 монеты' },
    { command: '/seacrh', description: 'Поиск твоей монеты' },
  ]);

  bot.on('text', async msg => {
    const data = msg.text.toLowerCase().slice(1);
    const chatId = msg.chat.id;

    let coin: ICoin;

    if (msg.text[0] === '/') {
      return;
    }
    await axios
      .get(`https://api.coincap.io/v2/assets/${data}`)
      .then(response => {
        coin = response.data.data;
      })
      .catch(err => {
        bot.sendMessage(chatId, `Ты написал не правильное имя монеты, попробуй ещё раз`);
      });
    if (coin) {
      const change = parseFloat(parseFloat(coin.changePercent24Hr).toFixed(2));
      bot.sendMessage(
        chatId,
        `-----------${coin.name}-----------\nCoin: ${coin.symbol} \nPrice: ${parseFloat(coin.priceUsd).toFixed(5)} \nChange:  ${
          change > 0 ? '+' : ''
        }${change}%`,
      );
    }
  });

  bot.on('message', async msg => {
    const text = msg.text;
    const chatId = msg.chat.id;

    if (text === '/start') {
      await bot.sendSticker(chatId, 'https://tlgrm.eu/_/stickers/ccd/a8d/ccda8d5d-d492-4393-8bb7-e33f77c24907/5.webp');
      return bot.sendMessage(chatId, 'Добро пожаловать я гений своего дела!)');
    }
    if (text === '/info') {
      return bot.sendMessage(chatId, `@${msg.from.username}`);
    }
    if (text === '/coin') {
      return bot.sendMessage(chatId, 'Назови монету я её найду для тебя', coinOptions);
    }
    if (text === '/seacrh') {
      return bot.sendMessage(chatId, 'Назови монету я её найду для тебя, чтоб вписать свою монету начни с "." например .tron');
    }
    if (text[0] === '.') {
      return;
    }
    return bot.sendMessage(chatId, 'Друг я тебя не понимаю, давай ещё раз!');
  });

  bot.on('callback_query', async msg => {
    const data = msg.data;
    const chatId = msg.message.chat.id;
    let coin: ICoin;

    await bot.answerCallbackQuery(msg.id, { text: 'Поиск монеты' });

    await axios
      .get(`https://api.coincap.io/v2/assets/${data}`)
      .then(response => {
        coin = response.data.data;
      })
      .catch(err => {
        bot.sendMessage(chatId, `Произошла ошибка, попробуй ещё раз`);
      });
    if (coin) {
      const change = parseFloat(parseFloat(coin.changePercent24Hr).toFixed(2));

      bot.sendMessage(
        chatId,
        `-----------${coin.name}-----------\nCoin: ${coin.symbol} \nPrice: ${parseFloat(coin.priceUsd).toFixed(5)} \nChange:  ${
          change > 0 ? '+' : ''
        }${change}%`,
      );
    }
  });
};
start();
