// Copy this file as "config.js"

module.exports = {
    // Create an application on https://discord.com/developers/applications then
    // copy and paste the application ID here as a string.
    applicationId: '',

    // On https://discord.com/developers/applications enable bot for the application,
    // then copy and paste the bot token here.
    token: '',

    // Create a role for mods (does not need any actual permissions), then
    // copy and paste its ID here as a string.
    modRoleId: '',

    // Create a channel for mod stuff (its where /pingmods goes), then
    // copy and paste its ID here as a string.
    modChannelId: '',

    // Create a channel for the starboard, then
    // copy and paste its ID here as a string.
    starboardChannelId: 'right click on the channel > copy id',

    // Path to where the database is saved. Leave it empty to save it in the
    // same folder as the source code, which is fine for development (it is gitignored).
    // In production see mount-encrypted-storage.example.sh.
    dataPath: ''
};
