const { MessageFlags, Permissions } = require('discord.js');

const slowmode = async (interaction) => {
  const slowmodeTime = interaction.options.getString('time');
  const slowmodeReason = interaction.options.getString('reason');
  const modRole = await interaction.guild.roles.fetch(config.modRoleId);
  let timeInSeconds = 0;
  if(slowmodeTime.match(/t=[0-9]*h?[0-9]*m?[0-9]*s?/g).toString()==slowmodeTime){
    slowmodeTime.replace(/([0-9]+)[h|m|s]/g, function(match, value) {
      if (match.indexOf("h") > -1) {
        timeInSeconds += value * 60 * 60;
      } else if (match.indexOf("m") > -1) {
        timeInSeconds += value * 60;
      } else if (match.indexOf("s") > -1) {
        timeInSeconds += value * 1;
      };
    });
    await interaction.channel.setRateLimitPerUser(timeInSeconds, `Slowmode set by ${interaction.user.username} for reason: ` + (slowmodeReason ?? "No reason provided"));
    if (timeInSeconds == 0) {
      await interaction.reply(`⛅ Removed slowmode from this channel.`);
    } else {
      await interaction.reply(`🌨️ Set slowmode for this channel to **${slowmodeTime.replace(/\s+/g, '');}**.`);
    }
  } else if (slowmodeTime == "freeze") {
    await interaction.channel.permissionOverwrites.edit(message.guild.roles.everyone.id, {
      SendMessages: false,
      AttachFiles: false,
      CreatePrivateThreads: false
    });
    await interaction.channel.permissionOverwrites.edit(modRole.id, {
      SendMessages: true,
      AttachFiles: true,
      CreatePrivateThreads: true
    });
    await interaction.reply(`❄️ Froze the channel.`);
  } else if (slowmodeTime == "unfreeze") {
    await interaction.channel.permissionOverwrites.edit(message.guild.roles.everyone.id, {
      SendMessages: null,
      AttachFiles: null,
      CreatePrivateThreads: null
    });
    await interaction.channel.permissionOverwrites.edit(modRole.id, {
      SendMessages: null,
      AttachFiles: null,
      CreatePrivateThreads: null
    });
    await interaction.reply(`☀️ Unfroze the channel.`);
  } else if (slowmodeTime == "") {
    await interaction.channel.setRateLimitPerUser(0, `Slowmode set by ${interaction.user.username} for reason: ` + (slowmodeReason ?? "No reason provided"));
    await interaction.reply(`⛅ Removed slowmode from this channel.`);
  }
  
  
};

module.exports = {
  slowmode
};
