const {
    REST,
    Routes,
    SlashCommandBuilder,
    ContextMenuCommandBuilder,
    ApplicationCommandType
} = require('discord.js');
const {
    applicationId,
    token
} = require('../config');

const commands = [
    new SlashCommandBuilder()
        .setName('pingmods')
        .setDescription('Ping moderators without posting a public message')
        .addStringOption(option => option.setName('reason').setDescription('Message will be provided to moderators.')),
    new ContextMenuCommandBuilder()
        .setName('Thread owner: Pin')
        .setType(ApplicationCommandType.Message),
    new ContextMenuCommandBuilder()
        .setName('Thread owner: Unpin')
        .setType(ApplicationCommandType.Message)
];

const run = async () => {
    const rest = new REST().setToken(token);
    await rest.put(
        Routes.applicationCommands(applicationId),
        {
            body: commands
        }
    );
};

run()
    .then(() => {
        console.log('Done');
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
