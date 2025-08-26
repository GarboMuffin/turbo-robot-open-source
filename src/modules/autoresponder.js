const { DMChannel } = require('discord.js');

/** @type {Map<number, number>} */
const lastMessageTimes = new Map();

const autorespond = async (message) => {
    if (message.channel instanceof DMChannel) {
        const author = message.author;

        console.log(`Received DM from ${author.username} (${author.id}): ${message.content}`);

        // avoid async operations until the final send() to avoid any races where we might get two
        // messages very closely together and then respond twice if unlucky race
        const threshold = Date.now() - 1000 * 60 * 60;
        const lastMessageTime = lastMessageTimes.get(author.id);

        if (lastMessageTime === undefined || lastMessageTime <= threshold) {
            lastMessageTimes.set(author.id, Date.now());
            await message.channel.send('Messages sent to this account are not monitored and will not be seen by a human.');
        }
    }
};

module.exports = {
    autorespond
};
