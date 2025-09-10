const { MessageFlags, PermissionsBitField } = require('discord.js');

const timeout = async (interaction) => {
  const user = interaction.options.getUser('user');
  const member = interaction.options.getMember('user');
  const amount = interaction.options.getInteger('time') ?? 60;
  const reason = interaction.options.getString('reason') ?? "No reason provided";

  await interaction.deferReply({flags: MessageFlags.Ephemeral});

  if (!member) {
    await interaction.editReply({
      content: `Couldn't find member`,
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  if (member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
    await interaction.editReply({
      content: `Can't time out moderators`,
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  try {
    await member.timeout(amount * 60000, reason);
  } catch (error) {
    console.error(error);
    await interaction.editReply({
      content: 'Failed to timeout user.',
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  let sentMessage = false;
  try {
    await user.send({
      content: `⏲️ You have been timed out in the Turbowarp server for the following reason: ${reason}`
    });
    sentMessage = true;
  } catch (error) {
    console.error(error);
  }

  if (sentMessage) {
    await interaction.editReply({
      content: `⏲️ <@${user.id}> timed out for ${amount} minutes because ${reason} (and DM was sent)`,
      flags: MessageFlags.Ephemeral
    });
  } else {
    await interaction.editReply({
      content: `⏲️ <@${user.id}> timed out for ${amount} minutes because ${reason} (but could not send DM)`,
      flags: MessageFlags.Ephemeral
    });
  }
};

module.exports = {
  timeout
};
