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
    content = message.messageSnapshots.first() ? message.messageSnapshots.first().content : message.content;
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
  let log = '';
  let isImportant = false;

  switch (auditLog.action) {
    case AuditLogEvent.MemberBanAdd:
      log = `🔨 <@${auditLog.targetId}> was banned by <@${auditLog.executorId}> because: ${auditLog.reason || '???'}`;
      isImportant = true;
      break;
    case AuditLogEvent.MemberBanRemove:
      log = `🔨 <@${auditLog.targetId}> was unbanned by <@${auditLog.executorId}>`;
      isImportant = true;
      break;
    case AuditLogEvent.MemberKick:
      log = `👢 <@${auditLog.targetId}> was kicked by <@${auditLog.executorId}> because: ${auditLog.reason || '???'}`;
      isImportant = true;
      break;
    case AuditLogEvent.MemberUpdate:
      const timeoutInfo = auditLog.changes.find(i => i.key === 'communication_disabled_until');
      if (timeoutInfo) {
        const timeoutExpires = Math.round(Date.parse(timeoutInfo.new) / 1000);
        log = `⏲️ <@${auditLog.targetId}> was timed out by <@${auditLog.executorId}> until <t:${timeoutExpires}:R> because: ${auditLog.reason || '???'}`
        isImportant = true;
      }
      break;
    case AuditLogEvent.InviteCreate:
      log = `🔗 <@${auditLog.executorId}> created a${auditLog.target.temporary ? ' temporary' : 'n'} invite \`${auditLog.target.code}\` with ${
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
      log = `🔗 <@${auditLog.executorId}> deleted an invite \`${auditLog.target.code}\``;
      break;
  }

  if (log) {
    const logChannel = await client.channels.fetch(isImportant ? config.modChannelId : config.logChannelId);
    await logChannel.send({
      content: log,
      allowedMentions: {
        parse: []
      }
    });
  }
};

module.exports = {
  editedMessage,
  deletedMessage,
  purgedMessages,
  voiceChat,
  userJoin,
  userLeave,
  auditLogs
};
