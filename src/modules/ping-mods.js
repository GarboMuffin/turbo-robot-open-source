const client = require('../client');
const config = require('../../config');

const pingMods = async (interaction) => {
    const reason = interaction.options.getString('reason');
    const recentMessages = await interaction.channel.messages.fetch({
        limit: 1
    });
    const mostRecentMessage = recentMessages.first();
    const modRole = await interaction.guild.roles.fetch(config.modRoleId);
    const modChannel = await client.channels.fetch(config.modChannelId);

    let pingMessage = `${modRole}: ${interaction.user} pinged mods in ${interaction.channel}`;
    if (mostRecentMessage) {
        pingMessage += ` at ${mostRecentMessage.url}`;
    }
    if (reason) {
        pingMessage += ' because:\n\`\`\`';
        pingMessage += reason.replace(/```/g, '[escaped code block]');
        pingMessage += '\n\`\`\`';
    }
    await modChannel.send(pingMessage);

    await interaction.reply({
        content: 'Mods have been pinged. Be patient. Pinging again does not help.',
        ephemeral: true
    });
};

module.exports = {
    pingMods
};