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
        .setDescription('Contact moderators without posting a public message (previously /pingmods)')
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
    new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('Set slowmode in the current channel')
        .addBooleanOption(option => option
            .setName('state')
            .setDescription('Whether or not slowmode is enabled')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('time')
            .setDescription('Amount of time slowmode is set to')
            .addChoices(
                { name: '5 seconds', value: '5' },
                { name: '10 seconds', value: '10' },
                { name: '15 seconds', value: '15' },
                { name: '30 seconds', value: '30' },
                { name: '1 minute', value: '60' },
                { name: '2 minutes', value: '120' },
                { name: '5 minutes', value: '300' },
                { name: '10 minutes', value: '600' },
                { name: '15 minutes', value: '900' },
                { name: '30 minutes', value: '1800' },
                { name: '1 hour', value: '3600' },
                { name: '2 hours', value: '7200' },
                { name: '6 hours', value: '21600' },
                { name: 'freeze', value: 'freeze'}
            )
        )
        .addStringOption(option => option
            .setName('reason')
            .setDescription('Reason why slowmode is being applied')
            .setMaxLength(1000)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
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
