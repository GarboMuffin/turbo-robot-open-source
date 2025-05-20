const {
    Events,
    ActivityType
} = require('discord.js');
const {
    token
} = require('../config');

const client = require('./client');

const tryRequire = (path) => {
    try {
        return require(path);
    } catch (e) {
        if (e.code === 'MODULE_NOT_FOUND') {
            return null;
        } else {
            throw e;
        }
    }
};

const starBoard = require('./modules/star-board');
const contactMods = require('./modules/contact-mods');
const purgeMessages = require('./modules/purge-messages');
const thread = require('./modules/thread');
const logging = require('./modules/logging');
const bigBrother = tryRequire('./modules/big-brother');

client.once(Events.ClientReady, (client) => {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setActivity({
        type: ActivityType.Watching,
        name: 'for thoughtcrime committers'
    });
});

client.on(Events.ClientReady, (client) => {
    setInterval(contactMods.ticketActivity, 1 * 60 * 1000);
});

client.on(Events.MessageCreate, async (message) => {
    try {
        if (message.partial) {
            await message.fetch();
        }

        if (message.author.id === client.user.id) {
            return;
        }

        if (bigBrother) await bigBrother.checkThoughtcrime(message);
    } catch (e) {
        console.error(e);
    }
});

client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
    try {
        if (newMessage.partial) {
            await newMessage.fetch();
        }

        if (newMessage.author.id === client.user.id) {
            return;
        }

        if (bigBrother) await bigBrother.checkThoughtcrime(newMessage);
        await logging.editedMessage(oldMessage, newMessage);
        await starBoard.onEditMessage(newMessage);
    } catch (e) {
        console.error(e);
    }
});

client.on(Events.MessageDelete, async (message) => {
    try {
        await logging.deletedMessage(message);
        await starBoard.onDeleteMessage(message);
    } catch (e) {
        console.error(e);
    }
});

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
    await logging.voiceChat(oldState, newState);
});

client.on(Events.InteractionCreate, async (interaction) => {
    try {
        switch (interaction.commandName) {
            case 'contactmods':
                await contactMods.contactMods(interaction);
                break;
            case 'purge':
                await purgeMessages.purgeMessages(interaction);
                break;
            case 'closethread':
                await thread.close(interaction);
                break;
            case 'Report User':
                await contactMods.reportUser(interaction);
                break;
            case 'Report Message':
                await contactMods.reportMessage(interaction);
                break;
            case 'Thread owner: Pin':
                await thread.pin(interaction);
                break;
            case 'Thread owner: Unpin':
                await thread.unpin(interaction);
                break;
        }
    } catch (e) {
        console.error(e);
    }
});

client.on(Events.MessageReactionAdd, async (reaction, user) => {
    try {
        await starBoard.onReaction(reaction);
    } catch (e) {
        console.error(e);
    }
});

client.on(Events.GuildMemberAdd, async (member) => {
    await logging.userJoin(member);
});

client.on(Events.GuildMemberRemove, async (member) => {
    await logging.userLeave(member);
});

client.on(Events.GuildAuditLogEntryCreate, async (auditLog) => {
    await logging.auditLogs(auditLog);
});

client.login(token);
