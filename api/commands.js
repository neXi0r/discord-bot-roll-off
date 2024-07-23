const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

const items = new Map(); // In-memory database for items

const addItem = (message, args) => {
    const [name_of_item, ...rest] = args;
    const [prio_for, link] = rest.join(' ').split('" "').map(s => s.replace(/"/g, ''));
    items.set(name_of_item, { prio_for, link });
    message.channel.send(`Item ${name_of_item} added with priority for ${prio_for}`);
};

const editItem = (message, args) => {
    const [name_of_item, ...rest] = args;
    const [prio_for, link] = rest.join(' ').split('" "').map(s => s.replace(/"/g, ''));
    items.set(name_of_item, { prio_for, link });
    message.channel.send(`Item ${name_of_item} edited with priority for ${prio_for}`);
};

const removeItem = (message, args) => {
    const name_of_item = args.join(' ').replace(/"/g, '');
    items.delete(name_of_item);
    message.channel.send(`Item ${name_of_item} removed`);
};

const listItem = async (message, args) => {
    const name_of_item = args.join(' ').replace(/"/g, '');
    const item = items.get(name_of_item);
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