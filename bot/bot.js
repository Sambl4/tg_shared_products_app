bot.js
import { Telegraf, Markup } from'telegraf';
import dotenv from 'dotenv';
dotenv.config();

const token  = process.env.BOT_TOKEN;
console.log('Bot token:', token);
const bot = new Telegraf(process.env.BOT_TOKEN);
const webAppUrl = 'https://sambl4.github.io/tg_shared_products_app/'; // Replace with your actual Web App URL

bot.command('start', (ctx) => ctx.reply(
    'Welcome to the tgApp bot!',
    Markup.keyboard([
        Markup.button.webApp('Open Web App', webAppUrl)
    ])
));
// bot.help((ctx) => ctx.reply('Send me a message and I will echo it.'));
// bot.on('text', (ctx) => ctx.reply(`Echo: ${ctx.message.text}`));

bot.launch();

console.log('Bot started...');

// // Enable graceful stop
// process.once('SIGINT', () => bot.stop('SIGINT'));
// process.once('SIGTERM', () => bot.stop('SIGTERM'));


