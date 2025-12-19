const {
  AttachmentBuilder,
  AuditLogEvent,
  DMChannel
} = require('discord.js');
const { unifiedDiff } = require('difflib');
const client = require('../client');
const config = require('../../config');

const editedMessage = async (oldMessage, newMessage) => {
  const logChannel = await client.channels.fetch(config.logChannelId);

  if (
    newMessage.channel instanceof DMChannel ||
    newMessage.channel.id === config.modChannelId ||
    newMessage.channel.id === config.adminChannelId ||
    newMessage.channel.id === config.logChannelId ||
    newMessage.channel.id === config.starboardChannelId ||
    oldMessage.partial ||
    (!oldMessage.content && !oldMessage.attachments) ||
    oldMessage.author.bot ||
    newMessage.editedTimestamp == null 
  ) {
    return;
  }

  const diff = unifiedDiff(
    oldMessage.content.split('\n'),
    newMessage.content.split('\n'),
    { lineterm: '' }
  )
  .join('\n')
  .replace(/^-{3} \n\+{3} \n/, '');

  let log = {
    allowedMentions: { parse: [] }
  };
  if (oldMessage.pinned !== newMessage.pinned) {
    log.content = `📌 [Message](${newMessage.url}) by <@${newMessage.author.id}> was ${newMessage.pinned ? '' : 'un'}pinned in ${newMessage.channel.url}`;
  } else if (oldMessage.flags.has('SuppressEmbeds') !== newMessage.flags.has('SuppressEmbeds')) {
    log.content = `📝 Embeds ${newMessage.flags.has('SuppressEmbeds') ? 'removed from' : 'shown on'} [message](${newMessage.url}) by <@${newMessage.author.id}> in ${newMessage.channel.url}`;
    log.embeds = oldMessage.embeds;
  } else {
    log.content = `📝 [Message](${newMessage.url}) by <@${newMessage.author.id}> was edited in ${newMessage.channel.url}`;
    if (oldMessage.attachments !== newMessage.attachments) {
      log.files = oldMessage.attachments.map(attachment => ({
        name: attachment.name,
        attachment: attachment.url
      }));
    }
    if (diff.length <= 250) {
      if (diff) {
        log.content += `\n\`\`\`diff\n${diff}\n\`\`\``;
      } else {
        log.content += `\n\`\`\`[No Content]\`\`\``;
      }
    } else {
      log.files = log.files.concat([
        new AttachmentBuilder(
          Buffer.from(diff),
          { name: 'message.diff' }
        )
      ]);
    }
  }
  await logChannel.send(log);
};

const deletedMessage = async (message) => {
  const logChannel = await client.channels.fetch(config.logChannelId);

  if (
    message.channel instanceof DMChannel ||
    message.channel.id === config.modChannelId ||
    message.channel.id === config.adminChannelId ||
    message.channel.id === config.logChannelId ||
    message.channel.id === config.starboardChannelId
  ) {
    return;
  }

  let log = {
    content: `🗑 [${message.messageSnapshots.first() ? 'Forwarded ' : ''}Message](${message.url}) by ${message.partial ? 'an unknown user' : `<@${message.author.id}>`} was deleted in ${message.channel.url}`,
    allowedMentions: { parse: [] }
  };
  const attachments = message.messageSnapshots.first() ? message.messageSnapshots.first().attachments : message.attachments;
  if (attachments) {
    log.files = attachments.map(attachment => ({
      name: attachment.name,
      attachment: attachment.url
    }));
  }
  if (!message.partial) {
    let content = message.content;
    if (message.messageSnapshots.first()) {
      content = "↱ Forwarded message:\n" + message.messageSnapshots.first().content;
    } else if (message.poll) {
      let poll = message.poll;
      content = `[Poll]\n\n${poll.question.text}`
      let answers = poll.answers.map(answer => answer);
      for (let i = 0; i < answers.length; i++) {
        content += `\n${poll.allowMultiselect ? "☐" : "◯"} `;
        if (answers[i].emoji) {
          if (answers[i].emoji && answers[i].emoji.id) {
            content += `:${answers[i].emoji.name}: `;
          } else if (answers[i].emoji) {
            content += answers[i].emoji.name + " ";
          } 
        }
        content += answers[i].text;
      }
      if (poll.resultsFinalized) {
        content += `\nPoll closed`;
      } else {
        content += `\nPoll open`;
      }
    } else if (message.embeds[0] && message.embeds[0].data.type == "poll_result") {
      embed = message.embeds[0].data;
      content = `[Poll Result]\n\n"${embed.fields[0].value}" results:\nTotal votes: ${embed.fields[2].value}`;
      if (embed.fields[6]) {
        content += `:${embed.fields[6].value}: `;
      } else if (embed.fields[5]) {
        content += embed.fields[5].value + " ";
      }
      if (embed.fields[3]) {
        content += `\nWinner: "${embed.fields[4].value}" with ${embed.fields[1].value} votes`;
      } else {
        if (embed.fields[2].value > 0) {
          content += `\nThe results were tied`;
        } else {
          content += `\nThere was no winner`;
        }
      }
    }
    if (content.length <= 250) {
      log.content += `\n\`\`\`\n${content}\n\`\`\``;
    } else {
      log.files = log.files.concat([
        new AttachmentBuilder(
          Buffer.from(content),
          { name: 'message.txt' }
        )
      ]);
    }
  }

  await logChannel.send(log);
};

const onReactionRemove = async (reaction, user) => {
  const logChannel = await client.channels.fetch(config.logChannelId);
  await reaction.fetch();

  let log = {
    content: `➖ `,
    allowedMentions: { parse: [] }
  };

  if (reaction.emoji.id) {
    if (reaction.emoji.guildId === reaction.message.guild.id) {
      log.content += `<:${reaction.emoji.name}:${reaction.emoji.id}>`;
    } else {
      log.content += `[${reaction.emoji.name}](https://cdn.discordapp.com/emojis/${reaction.emoji.id}.gif?size=48&animated=${reaction.emoji.animated}&name=${reaction.emoji.name})`;
    }
  } else {
    log.content += reaction.emoji.name;
  }

  log.content += ` was unreacted from [Message](${reaction.message.url}) by <@${user.id}> in ${reaction.message.channel.url}`;

  await logChannel.send(log);
}

const onReactionRemovedByModerator = async (reaction) => {
  const logChannel = await client.channels.fetch(config.logChannelId);
  await reaction.fetch();

  let log = {
    content: `➖ `,
    allowedMentions: { parse: [] }
  };

  if (reaction.emoji.id) {
    if (reaction.emoji.guildId === reaction.message.guild.id) {
      log.content += `<:${reaction.emoji.name}:${reaction.emoji.id}>`;
    } else {
      log.content += `[${reaction.emoji.name}](https://cdn.discordapp.com/emojis/${reaction.emoji.id}.gif?size=48&animated=${reaction.emoji.animated}&name=${reaction.emoji.name})`;
    }
  } else {
    log.content += reaction.emoji.name;
  }

  log.content += ` reaction was removed from [Message](${reaction.message.url}) by moderators in ${reaction.message.channel.url}`;

  await logChannel.send(log);
}

const onAllReactionsRemovedByModerator = async (message) => {
  const logChannel = await client.channels.fetch(config.logChannelId);
  await message.fetch();

  let log = {
    content: `➖ All reactions removed from [Message](${message.url}) by moderators in ${message.channel.url}`,
    allowedMentions: { parse: [] }
  };

  await logChannel.send(log);
}

const purgedMessages = async (messages, channelUrl) => {
  const logChannel = await client.channels.fetch(config.logChannelId);

  let deletedMessages = '';
  messages.reverse().forEach(message => {
    deletedMessages += `${message.author.tag} said:\n${(message.messageSnapshots.first() ? "↱ Forwarded message:\n" + message.messageSnapshots.first().content : message.content) || '[No Content]'}\n\n`;
  });

  let log = {
    content: `🗑 \`/purge\` was used in ${channelUrl}`,
    allowedMentions: { parse: [] }
  };
  if (deletedMessages.length <= 250) {
    log.content += `\n\`\`\`\n${deletedMessages}\n\`\`\``;
  } else {
    log.files = [
      new AttachmentBuilder(
        Buffer.from(deletedMessages),
        { name: 'message.txt' }
      )
    ];
  }

  await logChannel.send(log);
}

const voiceChat = async (oldState, newState) => {
  const logChannel = await client.channels.fetch(config.logChannelId);

  let log = {
    allowedMentions: { parse: [] }
  };
  if (oldState.channelId !== newState.channelId) {
    if (oldState.channelId) {
      log.content = (`🔊 <@${oldState.member.user.id}> left voice channel <#${oldState.channel.id}>`);
    }
    if (newState.channelId) {
      log.content = (`🔊 <@${newState.member.user.id}> joined voice channel <#${newState.channel.id}>`);
    }
  } else if (oldState.streaming !== newState.streaming) {
    if (newState.streaming) {
      log.content = (`🖥 <@${newState.member.user.id}> started screensharing in <#${newState.channel.id}>`);
    } else {
      log.content = (`🖥 <@${newState.member.user.id}> stopped screensharing in <#${newState.channel.id}>`);
    }
  } else if (oldState.selfMute !== newState.selfMute) {
    if (newState.selfMute) {
      log.content = (`🎙 <@${newState.member.user.id}> turned off microphone in <#${newState.channel.id}>`);
    } else {
      log.content = (`🎙 <@${newState.member.user.id}> turned on microphone in <#${newState.channel.id}>`);
    }
  } else if (oldState.selfDeaf !== newState.selfDeaf) {
    if (newState.selfDeaf) {
      log.content = (`🎧 <@${newState.member.user.id}> deafened in <#${newState.channel.id}>`);
    } else {
      log.content = (`🎧 <@${newState.member.user.id}> un-deafened in <#${newState.channel.id}>`);
    }
  } else {
    return;
  }

  await logChannel.send(log);
}

const userJoin = async (member,oldInvites) => {
  const logChannel = await client.channels.fetch(config.logChannelId);

  member.guild.invites.fetch().then(newInvites => {
    const matchingInvites = [...newInvites.values()].filter(i => {
      const old = oldInvites.get(i.code);
      return old && i.uses > old.uses;
    });

    let invitestring = ""
    if (matchingInvites[0]) {
      invitestring = "\n🏷️ Invites incremented:"
      for (let i = 0; i < matchingInvites.length; i++) {
        const invite = matchingInvites[i];
        invitestring += ` \`${invite.code}\` by <@${invite.inviterId}>, ${invite.uses} use(s)${i == matchingInvites.length-1 ? "" : ","}`
      }
    }

    if (matchingInvites[0]) {
      logChannel.send({
        content: `👤 <@${member.user.id}> joined the server${invitestring}`,
        allowedMentions: { parse: [] }
      });
    } else {
      logChannel.send({
        content: `👤 <@${member.user.id}> joined the server from an unknown invite`,
        allowedMentions: { parse: [] }
      });
    };
  });
};

const userLeave = async (member) => {
  const logChannel = await client.channels.fetch(config.logChannelId);

  await logChannel.send({
    content: `👤 <@${member.user.id}> left the server`,
    allowedMentions: { parse: [] }
  });
};

const auditLogs = async (auditLog) => {
  let unimportantLog = '';
  let importantLog = '';
  let webhookLog = '';

  switch (auditLog.action) {
    case AuditLogEvent.MemberBanAdd:
      importantLog = `🔨 <@${auditLog.targetId}> was banned by <@${auditLog.executorId}> because: ${auditLog.reason || '???'}`;
      webhookLog = `<@${auditLog.targetId}> (${auditLog.targetId} / ${auditLog.target?.username}) was banned by ${auditLog.executor?.username} (${auditLog.executorId}) because: ${auditLog.reason || '???'}`;
      break;
    case AuditLogEvent.MemberBanRemove:
      importantLog = `🔨 <@${auditLog.targetId}> was unbanned by <@${auditLog.executorId}>`;
      break;
    case AuditLogEvent.MemberKick:
      importantLog = `👢 <@${auditLog.targetId}> was kicked by <@${auditLog.executorId}> because: ${auditLog.reason || '???'}`;
      break;
    case AuditLogEvent.MemberUpdate:
      const timeoutInfo = auditLog.changes.find(i => i.key === 'communication_disabled_until');
      if (timeoutInfo) {
        if (timeoutInfo.new) {
          const expiresUnixSeconds = Math.round(Date.parse(timeoutInfo.new) / 1000);
          const durationMinutes = Math.round((expiresUnixSeconds - Date.now() / 1000) / 60);
          importantLog = `⏲️ <@${auditLog.targetId}> was timed out by <@${auditLog.executorId}> until <t:${expiresUnixSeconds}:f> (${durationMinutes} minutes) because: ${auditLog.reason || '???'}`;
        } else {
          importantLog = `⏲️ <@${auditLog.targetId}> was untimed out by <@${auditLog.executorId}>`;
        }
      }
      break;
    case AuditLogEvent.InviteCreate:
      unimportantLog = `🔗 <@${auditLog.executorId}> created a${auditLog.target.temporary ? ' temporary' : 'n'} invite \`${auditLog.target.code}\` with ${
        auditLog.target.maxUses === 0 ? 'no limit' : `${auditLog.target.maxUses} max use(s)`} and ${
        auditLog.target.maxAge === 0 ? 'no expiration' : `expires in ${
          auditLog.target.maxAge < 86400 ? `${
            auditLog.target.maxAge < 3600 ? `${
              auditLog.target.maxAge / 60} minute(s)` : `${
            auditLog.target.maxAge / 3600} hour(s)`}` : `${
          auditLog.target.maxAge / 86400} day(s)`}`
        }`;
      break;
    case AuditLogEvent.InviteDelete:
      unimportantLog = `🔗 <@${auditLog.executorId}> deleted an invite \`${auditLog.target.code}\``;
      break;
  }

  if (importantLog) {
    const channel = await client.channels.fetch(config.modChannelId);
    await channel.send({
      content: importantLog,
      allowedMentions: {
        parse: []
      }
    });
  }

  if (unimportantLog) {
    const channel = await client.channels.fetch(config.logChannelId);
    await channel.send({
      content: unimportantLog,
      allowedMentions: {
        parse: []
      }
    });
  }

  if (webhookLog && config.majorOffensesSignalingService) {
    await fetch(config.majorOffensesSignalingService, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        content: webhookLog
      })
    });
  }
};

module.exports = {
  editedMessage,
  deletedMessage,
  onReactionRemove,
  onReactionRemovedByModerator,
  onAllReactionsRemovedByModerator,
  purgedMessages,
  voiceChat,
  userJoin,
  userLeave,
  auditLogs
};
