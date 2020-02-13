// Dependencies
let Discord = require('discord.js');
let ChessWebAPI = require('chess-web-api');
let ChessImageGenerator = require('chess-image-generator');

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
            commandColors: {
                'any': '#03cffc',
                'game': '#fca903',
                'command': '#03fc73',
                'archive': '#ca03fc'
            }
        }
        // Libraries I wrote just for this :')
        this._chessWebAPI = new ChessWebAPI({
            queue: true,
        });
        this._imageGenerator = new ChessImageGenerator();
    }

    // Upon Connection to Discord => Log Instance
    handleConnect() {
        console.log('Logged in as BOT');
    }

    // Upon Discord Message
    async handleMessage(message) {
        // Check if its a relevent command.
        if (message.content.substring(0, 8) != 'blunder/') return;
        // Parse Arguments
        let args = message.content.substring(8).split(' ');
        let cmd = args[0];
        args = args.splice(1);
        // Checks if correct channel
        if (!(await this.commandChannelValid(cmd, message.channel))) return;
        // split commands
        switch(cmd) {
            case 'help':
                this.blunderHelp(message.channel);
                break;
            case 'check':
                break;
            case 'Qh5':
                break;
            case 'hi':
                break;
            case 'sorry':
                break;
            case 'register':
                break;
            case 'track':
                break;
            case 'stop':
                break;
            case 'public': 
                break;
            case 'print':
                break;
            case 'tournament':
                break;
            case 'archive':
                break;
            case 'setup':
                break;
            default:
                this.invalidCommand(message.channel);
                break;
        }
    }

    commandChannelValid(cmd, channel) {
        console.log(cmd);
        let cmds = {
            'help': true,
            'check': true,
            'Qh5': true,
            'hi': true,
            'sorry': true,

            'register': ['commands'],

            'track': ['commands'],
            'stop': ['game'],
            'public': ['game'],
            'display': ['game'],

            'tournament': ['commands'],

            'archive': ['access'],

            'setup': ['settings'],
        };
        if (!(cmd in cmds)) {
            return this.invalidCommand(channel);
        }
        else if (typeof cmds[cmd] == 'boolean') return cmds[cmd];
        else if (cmds[cmd].includes(channel.name)) return true;
        else if (cmds[cmd].includes('game') && channel.guild.channels[channel.parentID].name.substring(2) == "Active Daily Matches") return true;
        return false;
    } 

    invalidCommand(channel) {
        channel.sendMessage("Blunder.\nInvalid command. Try `blunder/help`.");
        return false;
    }


/////////////////////////////////////////////////////////////////
// GENERAL //////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////

    // blunder/help
    // Prints available commands.
    blunderHelp(channel) {
        const anyChannel = new Discord.RichEmbed()
        .setColor(this.blunder.commandColors.any)
        .setTitle('Any Channel')
        .addField('blunder/help', 'List of available commands.')
        channel.send(anyChannel);
        const commandChannel = new Discord.RichEmbed()
        .setColor(this.blunder.commandColors.command)
        .setTitle('Command Channel')
        .setImage('./assets/messages/commandhelp.png')
        channel.send(commandChannel);
        const gameChannel = new Discord.RichEmbed()
        .setColor(this.blunder.commandColors.game)
        .setTitle('Tracked Game Channels')
        .addField('blunder/stop', 'Stops tracking game and deletes channel.')
        .addField('blunder/public', 'Toggles channel\'s visability to other members besides opponents.')
        .addField('blunder/display', 'Change the way moves are displayed.\nOptions: fen, png, ascii, move, none.')
        channel.send(gameChannel);
        const accessChannel = new Discord.RichEmbed()
        .setColor(this.blunder.commandColors.archive)
        .setTitle('Archive Access Channel')
        .addField('blunder/archive profile <Chess.com Username>', 'Display user\'s profile information.')
        .addField('blunder/archive games <Chess.com Username>', 'Display user\'s games. Requires they were tracked.')
        .addField('blunder/archive games <Chess.com Username> <index>', 'Selects a certain game to view.')
        channel.send(accessChannel);
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

    // blunder/displaly [fen, png, gif, ascii, move, none]

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
