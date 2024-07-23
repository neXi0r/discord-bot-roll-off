const { Client, Intents } = require('discord.js');
const { prefix } = require('./config.json');
const {
    addItem,
    editItem,
    removeItem,
    listItem,
    handleRolloff
} = require('./api/commands');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });

client.once('ready', () => {
    console.log('Bot is online!');
});

client.on('messageCreate', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'rolloffadd') {
        addItem(message, args);
    } else if (command === 'rolloffedit') {
        editItem(message, args);
    } else if (command === 'rolloffremove') {
        removeItem(message, args);
    } else if (command === 'rolloff') {
        listItem(message, args);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;
    if (interaction.customId === 'rolloff' && interaction.member.roles.cache.some(role => role.name === 'OFFICER')) {
        handleRolloff(interaction, client);
    }
});

client.login(process.env.DISCORD_TOKEN);
