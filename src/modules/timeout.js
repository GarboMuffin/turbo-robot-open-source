const { MessageFlags } = require('discord.js');

const timeout = async (interaction) => {
  const user = interaction.options.getUser('user');
  const member = interaction.options.getMember('user');
  const amount = interaction.options.getInteger('time') ?? 60;
  const reason = interaction.options.getReason('reason') ?? "No reason provided";

  try {
    await member.timeout(amount*60000, reason);
    await user.send({
      content: `⏲️ You have been timed out in the Turbowarp server for the following reason: ${reason}`,
      flags: MessageFlags.SuppressNotifications
    });
  } catch (error) {
    await interaction.reply({
      content: 'Failed to timeout user.',
      flags: MessageFlags.Ephemeral
    });
  }
};

module.exports = {
  timeout
};
