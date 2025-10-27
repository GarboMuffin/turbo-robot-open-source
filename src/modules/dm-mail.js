const { DMChannel } = require('discord.js');
const client = require('../client.js');
const { modChannelId } = require('../../config.js');

const handleDirectMessage = async (message) => {
    if (message.channel instanceof DMChannel) {
        const author = message.author;

        const modChannel = await client.channels.fetch(modChannelId);
        const modMessage = {
            content: `Received a DM from ${author}:\n\`\`\`\n${message.content.replace(/```/g, '[code block]')}\n\`\`\``,
            files: message.attachments.map(i => ({
                name: i.name,
                attachment: i.url
            }))
        };

        await modChannel.send(modMessage);
    }
};

module.exports = {
    handleDirectMessage
};
