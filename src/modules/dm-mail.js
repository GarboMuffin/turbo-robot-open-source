const { DMChannel, MessageFlags } = require('discord.js');
const client = require('../client.js');
const { modChannelId } = require('../../config.js');

const handleDirectMessage = async (message) => {
  if (message.channel instanceof DMChannel) {
    const author = message.author;
    const modChannel = await client.channels.fetch(modChannelId);
    const modMessage = {
      content: `Received a DM from ${author}:\n\`\`\`\n${message.content.replace(/```/g, '[code block]')}\n\`\`\`Use \`/botdm user:${author.id}\` to reply`,
      files: message.attachments.map(i => ({
        name: i.name,
        attachment: i.url
      }))
    };

    await modChannel.send(modMessage);
  }
};

const handleSendDirectMessage = async (interaction) => {
  if (interaction.channel.id !== modChannelId) {
    interaction.reply({
      content: `/botdm must be used in <#${modChannelId}> to ensure that other moderators can see you sent the message`,
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const user = interaction.options.getUser('user');
  if (!user) {
    await interaction.reply({
      content: `Couldn't find member`
    });
    return;
  }

  const content = interaction.options.getString('message') ?? '';
  await interaction.deferReply();

  let sentMessage = false;
  try {
    await user.send({
      content: `Message from TurboWarp moderation: ${content}`
    });
    sentMessage = true;
  } catch (error) {
    console.error(error);
  }

  if (sentMessage) {
    await interaction.editReply({
      content: `Sent message to ${user}: ${content}`
    });
  } else {
    await interaction.editReply({
      content: 'Message could not be sent'
    });
  }
};

module.exports = {
  handleDirectMessage,
  handleSendDirectMessage
};
