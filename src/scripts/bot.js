// Dependencies
let Discord = require('discord.js');

// Inherits from Discord.js Client
// Adds functionality for chess.
class BlunderBot extends Discord.Client {
    // Constructor takes authorization token for discord
    constructor(options) {
        // Running Parent Class Constructor
        super();
        // Defining Member Function for Server Connection
        this.on('ready', this.handleConnect);
        // Defining Member Function for Message Event
        this.on('message', this.handleMessage);
        // Blunder Variables
        this.blunder = {
            members: {},
            dailyMatches: [],
            liveMatches: [],
            tournament: null,
        }
    }

    // Upon Connection to Discord => Log Instance
    handleConnect() {
        console.log('Logged in as BOT');
    }

    // Upon Discord Message
    handleMessage(message) {
        // Check if its a relevent command.
        if (message.content.substring(0, 8) != 'blunder/') return;
        // Parse Arguments
        let args = message.content.substring(8).split(' ');
        let cmd = args[0];
        args = args.splice(1);
        // Checks if correct channel
        if (!(await this.commandChannelValid(cmd, message.channel))) return;
        // split commands
        switch (cmd) {
            case 
        }


        console.log(message);
    }

    commandChannelValid(cmd, channel) {
        
    }

    generalCommands(message, cmd, args) {
        switch
    }

    gameCommands(message) {

    }

    adminCommands(message) {

    }

/////////////////////////////////////////////////////////////////
// GENERAL //////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////

    // blunder/help
    // Prints available commands.
    blunderHelp(channel) {
        channel.send("Blunder Commands:");
    }

    // blunder/help archive
    // Prints available commands.

    // blunder/check
    // Prints MATE!

    // blunder/register
    // Creates new member object.

    // blunder/track
    // Creates new channel for game

    // blunder/archive member
    // Looks up member's profile

    // blunder/archive game
    // Looks up players games / particular game

    // blunder/tournament
    // Starts a tournament

    // blunder/tournament cancel
    // Cancels a tournament

    // blunder/Qh5
    // Prints g6 Boomer

    // blunder/hi
    // Prints Hello There

    // blunder/sorry
    // Prints It's okay

/////////////////////////////////////////////////////////////////
// GAME /////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////

    // blunder/help game

    // blunder/stop

    // blunder/public

    // blunder/print [fen, png, gif, ascii, move, none]

/////////////////////////////////////////////////////////////////
// ADMIN ////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////

    // blunder/setup
    // Prompts for "understood" if not provided
    // Creates Roles, Categories and Channels
    serverInitialize() {

    }

    createRoles() {

    }

    createCategories() {

    }

    createChannels() {

    }
}

module.exports = BlunderBot;

// #welcome

// General
//      #general
//      #leaderboard
//      #announcements
//      #discusion

// BlunderBot
//      #commands

// Active Daily Matches
//      #a-vs-b-(Letter)

// Active Live Matches
//      #a-vs-b-(Letter)

// Featured Games
//      #a-vs-b-(date)

// Archives
//      #access
//      #profilelog
//      #gamelog

// Tournament
//      #bracket
//      #a-vs-b

// Admin
//      #settings
