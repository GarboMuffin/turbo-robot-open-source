const { purgedMessages } = require('./logging');

const purgeMessages = async (interaction) => {
  const amount = interaction.options.getInteger('amount');

  interaction.channel.messages.fetch({ limit: amount })
  .then(messages => {
    if (!(messages.size === 1)) {
      purgedMessages(messages, interaction.channel.url);
    }
    interaction.channel.bulkDelete(messages);
    interaction.reply({
      content: `Deleted ${Array.from(messages).length} messages.`,
      ephemeral: true
    });
  })
  .catch(error => {
    interaction.reply({
      content: 'Failed to delete messages. This may be caused by attempting to delete messages that are over 2 weeks old.',
      ephemeral: true
    });
  });
};

module.exports = {
  purgeMessages
};
