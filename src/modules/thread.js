const {MessageFlags} = require('discord.js');
const config = require('../../config');

const checkPreconditions = async (interaction) => {
    if (!interaction.channel) {
        await interaction.reply({
            content: 'Not in a channel?',
            flags: MessageFlags.Ephemeral
        });
        return false;
    }

    await interaction.channel.fetch();
    if (!interaction.channel.isThread()) {
        await interaction.reply({
            content: 'You are not in a thread',
            flags: MessageFlags.Ephemeral
        });
        return false;
    }

    if (
        interaction.channel.ownerId !== interaction.user.id  &&
        !interaction.member.roles.cache.has(config.modRoleId)
    ) {
        await interaction.reply({
            content: 'You do not own this thread',
            flags: MessageFlags.Ephemeral
        });
        return false;
    }

    return true;
};

const close = async (interaction) => {
    if (!await checkPreconditions(interaction)) return;
    await interaction.reply({
        content: 'Thread has been closed.',
        flags: MessageFlags.Ephemeral
    });
    await interaction.channel.setLocked(true);
    await interaction.channel.setArchived(true);
};

const pin = async (interaction) => {
    if (!await checkPreconditions(interaction)) return;
    const pinnedMessages = await interaction.channel.messages.fetchPinned();
    if (!pinnedMessages.has(interaction.targetMessage.id)) {
        await interaction.targetMessage.pin('bot interaction');
        await interaction.reply({
            content: 'Message pinned!',
            flags: MessageFlags.Ephemeral
        });
    } else {
        await interaction.reply({
            content: 'Message is already pinned!',
            flags: MessageFlags.Ephemeral
        });
    }
};

const unpin = async (interaction) => {
    if (!await checkPreconditions(interaction)) return;
    const pinnedMessages = await interaction.channel.messages.fetchPinned();
    if (pinnedMessages.has(interaction.targetMessage.id)) {
        await interaction.targetMessage.unpin('bot interaction');
        await interaction.reply({
            content: 'Message unpinned!',
            flags: MessageFlags.Ephemeral
        });
    } else {
        await interaction.reply({
            content: 'Message is not pinned!',
            flags: MessageFlags.Ephemeral
        });
    }
};

module.exports = {
    close,
    pin,
    unpin
};
