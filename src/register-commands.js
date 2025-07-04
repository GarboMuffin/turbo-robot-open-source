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
        .setName('timeout')
        .setDescription('Timeout a user')
        .addUserOption(option => option
            .setName('user')
            .setDescription('The user to timeout')
            .setRequired(true)
        )
        .addIntegerOption(option => option
            .setName('time')
            .setDescription('Amount of time the user is timed out for')
            .addChoices(
                { name: '1 minute', value: 1 },
                { name: '3 minutes', value: 3 },
                { name: '5 minutes', value: 5 },
                { name: '10 minutes', value: 10 },
                { name: '30 minutes', value: 30 },
                { name: '1 hour', value: 60 },
                { name: '6 hours', value: 360 },
                { name: '12 hours', value: 720 },
                { name: '1 day', value: 1440 },
                { name: '2 days', value: 2880 },
                { name: '3 days', value: 4320 },
                { name: '1 week', value: 10080 },
                { name: '2 weeks', value: 20160 },
                { name: '4 weeks', value: 40320 }
            )
        )
        .addStringOption(option => option
            .setName('reason')
            .setDescription('Reason why timeout is being applied')
            .setMaxLength(1000)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
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
