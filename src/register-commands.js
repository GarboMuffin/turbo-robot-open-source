const {
    REST,
    Routes,
    SlashCommandBuilder,
    ContextMenuCommandBuilder,
    ApplicationCommandType,
    PermissionFlagsBits
} = require('discord.js');
const {
    applicationId,
    token
} = require('../config');

const commands = [
    new SlashCommandBuilder()
        .setName('contactmods')
        .setDescription('Contact moderators without posting a public message')
        .addStringOption(option => option
            .setName('topic')
            .setDescription('What are you contacting us about?')
            .setMaxLength(50)
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('information')
            .setDescription('Give us information on why you are contacting us.')
            .setMaxLength(1000)
            .setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Purge messages in the current channel')
        .addIntegerOption(option => option
            .setName('amount')
            .setDescription('Amount of messages to purge')
            .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    new SlashCommandBuilder()
        .setName('closethread')
        .setDescription('Locks and closes a thread')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageThreads),
    new ContextMenuCommandBuilder()
        .setName('Report User')
        .setType(ApplicationCommandType.User),
    new ContextMenuCommandBuilder()
        .setName('Report Message')
        .setType(ApplicationCommandType.Message),
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
            body: [] // Delete all existing commands
        }
    );
    await rest.put(
        Routes.applicationCommands(applicationId),
        {
            body: commands // Update the commands
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
