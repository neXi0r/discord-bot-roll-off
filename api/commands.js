const fs = require('fs');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const itemsFilePath = './items.json';

// Helper function to read items from the JSON file
const readItemsFromFile = () => {
    const data = fs.readFileSync(itemsFilePath);
    return JSON.parse(data).items;
};

// Helper function to write items to the JSON file
const writeItemsToFile = (items) => {
    fs.writeFileSync(itemsFilePath, JSON.stringify({ items }, null, 2));
};

const addItem = (message, args) => {
    const items = readItemsFromFile();
    const [name_of_item, ...rest] = args;
    const [prio_for, link] = rest.join(' ').split('" "').map(s => s.replace(/"/g, ''));
    items.push({ name_of_item, prio_for, link });
    writeItemsToFile(items);
    message.channel.send(`Item ${name_of_item} added with priority for ${prio_for}`);
};

const editItem = (message, args) => {
    const items = readItemsFromFile();
    const [name_of_item, ...rest] = args;
    const [prio_for, link] = rest.join(' ').split('" "').map(s => s.replace(/"/g, ''));
    const itemIndex = items.findIndex(item => item.name_of_item === name_of_item);
    if (itemIndex !== -1) {
        items[itemIndex] = { name_of_item, prio_for, link };
        writeItemsToFile(items);
        message.channel.send(`Item ${name_of_item} edited with priority for ${prio_for}`);
    } else {
        message.channel.send(`Item ${name_of_item} not found.`);
    }
};

const removeItem = (message, args) => {
    const items = readItemsFromFile();
    const name_of_item = args.join(' ').replace(/"/g, '');
    const newItems = items.filter(item => item.name_of_item !== name_of_item);
    if (newItems.length !== items.length) {
        writeItemsToFile(newItems);
        message.channel.send(`Item ${name_of_item} removed`);
    } else {
        message.channel.send(`Item ${name_of_item} not found.`);
    }
};

const listItem = async (message, args) => {
    const items = readItemsFromFile();
    const name_of_item = args.join(' ').replace(/"/g, '');
    const item = items.find(item => item.name_of_item === name_of_item);
    if (!item) {
        return message.channel.send(`Item ${name_of_item} not found.`);
    }

    const embed = new MessageEmbed()
        .setTitle(name_of_item)
        .setDescription(`Priority for: ${item.prio_for}`)
        .setURL(item.link || '');

    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('rolloff')
                .setLabel('Start Rolloff')
                .setStyle('PRIMARY'),
        );

    const msg = await message.channel.send({ embeds: [embed], components: [row] });

    await msg.react('👍'); // Need
    await msg.react('💡'); // New Trait
    await msg.react('⚙️'); // Level up Trait
};

const handleRolloff = async (interaction, client) => {
    const message = interaction.message;
    const reactions = message.reactions.cache;
    const users = new Map();

    for (const reaction of reactions.values()) {
        const usersReactions = await reaction.users.fetch();
        for (const user of usersReactions.values()) {
            if (user.bot) continue;
            if (!users.has(user.id)) {
                users.set(user.id, Math.floor(Math.random() * 100) + 1);
            }
        }
    }

    const sortedUsers = [...users.entries()].sort((a, b) => b[1] - a[1]);
    const resultEmbed = new MessageEmbed().setTitle('Rolloff Results');

    sortedUsers.forEach(([userId, roll], index) => {
        resultEmbed.addField(`${index + 1}. ${client.users.cache.get(userId).username}`, `Roll: ${roll}`);
    });

    await interaction.reply({ embeds: [resultEmbed], ephemeral: true });
};

module.exports = {
    addItem,
    editItem,
    removeItem,
    listItem,
    handleRolloff
};
