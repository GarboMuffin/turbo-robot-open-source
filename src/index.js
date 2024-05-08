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
const pingMods = require('./modules/ping-mods');
const threadPin = require('./modules/thread-pin');
const bigBrother = tryRequire('./modules/big-brother');
const ministryOfInformation = tryRequire('./modules/ministry-of-information');

client.once(Events.ClientReady, (client) => {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setActivity({
        type: ActivityType.Watching,
        name: 'for /pingmods'
    });
});

client.on(Events.MessageCreate, async (message) => {
    try {
        if (message.partial) {
            await message.fetch();
        }

        if (message.author.id === client.user.id) {
            return;
        }

        if (ministryOfInformation) ministryOfInformation.onNewMessage(message);
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

        if (ministryOfInformation) ministryOfInformation.onNewMessage(newMessage);
        await bigBrother.checkThoughtcrime(newMessage);
        await starBoard.onEditMessage(newMessage);
    } catch (e) {
        console.error(e);
    }
});

client.on(Events.MessageDelete, async (message) => {
    try {
        if (ministryOfInformation) ministryOfInformation.onDeleteMessage(message);
        await starBoard.onDeleteMessage(message);
    } catch (e) {
        console.error(e);
    }
});

client.on(Events.InteractionCreate, async (interaction) => {
    try {
        if (interaction.commandName === 'pingmods') {
            await pingMods.pingMods(interaction);
        }

        if (interaction.commandName === 'Thread owner: Pin') {
            await threadPin.pin(interaction);
        }

        if (interaction.commandName === 'Thread owner: Unpin') {
            await threadPin.unpin(interaction);
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

client.login(token);
