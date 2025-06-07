const { MessageFlags, PermissionsBitField } = require('discord.js');

const timeout = async (interaction) => {
  const user = interaction.options.getUser('user');
  const member = interaction.options.getMember('user');
  const amount = interaction.options.getInteger('time') ?? 60;
  const reason = interaction.options.getString('reason') ?? "No reason provided";

  try {
    if (!member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      await member.timeout(amount*60000, reason);
      await user.send({
        content: `⏲️ You have been timed out in the Turbowarp server for the following reason: ${reason}`,
        flags: MessageFlags.SuppressNotifications
      });
      await interaction.reply({
        content: `⏲️ Successfully timed out <@${user.id}> for ${amount} minutes with reason: ${reason}`,
        flags: MessageFlags.Ephemeral
      })
    } else {
      await interaction.reply({
        content: `Failed to timeout user: You can't timeout moderators!`,
        flags: MessageFlags.Ephemeral
      })
    }
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
