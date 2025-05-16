const { MessageFlags } = require('discord.js');
const { purgedMessages } = require('./logging');

const purgeMessages = async (interaction) => {
  const amount = interaction.options.getInteger('amount');

  try {
    const messages = await interaction.channel.messages.fetch({ limit: amount });
    await interaction.channel.bulkDelete(messages);
    await purgedMessages(messages, interaction.channel.url);
    await interaction.reply({
      content: `Deleted ${Array.from(messages).length} messages.`,
      flags: MessageFlags.Ephemeral
    });
  } catch (error) {
    await interaction.reply({
      content: 'Failed to delete messages. This may be caused by attempting to delete messages that are over 2 weeks old.',
      flags: MessageFlags.Ephemeral
    });
  }
};

module.exports = {
  purgeMessages
};
