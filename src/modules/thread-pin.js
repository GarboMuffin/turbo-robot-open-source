const checkPreconditions = async (interaction) => {
    if (!interaction.channel) {
        await interaction.reply({
            content: 'Not in a channel?',
            ephemeral: true
        });
        return false;
    }

    await interaction.channel.fetch();
    if (!interaction.channel.isThread()) {
        await interaction.reply({
            content: 'Not in a thread',
            ephemeral: true
        });
        return false;
    }

    if (interaction.channel.ownerId !== interaction.user.id) {
        await interaction.reply({
            content: 'You do not own this thread',
            ephemeral: true
        });
        return false;
    }

    return true;
};

const pin = async (interaction) => {
    if (!await checkPreconditions(interaction)) return;
    await interaction.targetMessage.pin('bot interaction');
    await interaction.reply({
        content: 'If the message was not pinned, now it is.',
        ephemeral: true
    });
};

const unpin = async (interaction) => {
    if (!await checkPreconditions(interaction)) return;
    await interaction.targetMessage.unpin('bot interaction');
    await interaction.reply({
        content: 'If the message was pinned, now it isn\'t.',
        ephemeral: true
    });
};

module.exports = {
    pin,
    unpin
};
