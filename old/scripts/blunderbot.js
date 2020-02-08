// Dependencies
let Discord = require('discord.io');
let ChessAPI = require('./chessapi.js');
let BoardToImage = require('./boardtoimage.js');
let fs = require('fs');
let axios = require('axios');

// Inherits from Discord.io Web Socket
// Adds functionality
class BlunderBot extends Discord.Client {

    // Constructor takes authorization token for discord
    constructor(options) {
        // Running Parent Class Constructor
        super(options);
        // Defines Server Structure Variables
        this.inicializeServerStructure();
        // Defining Member Function for Server Connection
        this.on('ready', this.onDiscordConnection);
        // Defining Member Function for Message Event
        this.on('message', this.onDiscordMessage);
        // Setup Axios for Added Functionality (Discord.io only offers a fraction of the discord API)
        // Discord Secret added to an INSTANCE of axios
        // Axios is used to make API calls.
        this._discordAPI = axios.create({
            baseURL: 'https://discordapp.com/api',
            headers: {
                common: {  // Sets for all call methods
                    Authorization: 'Bot ' + options.token,
                }
            }
        }); // All Axios calls to discord will now be verified
        // Chess API Object manages queue and requests.
        // Passes instance so it can call post-call functions
        this._chessAPI = new ChessAPI(this);
        this._trackedGames = [];
        this._imageCreator = new BoardToImage();
        this._interval = null;
    }

    // Upon Connection to Discord => Log Instance
    async onDiscordConnection(evt) {
        console.log('Connected to Server (' + evt.d.user.username, '-', evt.d.user.id + ')');
        // Collects IDs Relevent to Servers
        this.processCurrentServers();
    }

    // Upon Discord Message
    async onDiscordMessage(user, userID, channelID, message, evt) {
        // Check if its a relevent command.
        if (message.substring(0, 3) != 'bb!') return;
        // Parse Arguments
        let args = message.substring(3).split(' ');
        let cmd = args[0];
        args = args.splice(1);
        // Variables for instance
        let channel = this.channels[channelID];
        let server = this.servers[channel.guild_id];
        // Check if its in the right channel.
        if (!(await this.checkChannel(cmd, channel.name, channelID, evt))) return;
        switch(cmd) {
            case 'check':
                this.checkCommand(channelID);
                break;
            // bb!setup
            // Formats Server
            case 'setup':
                this.setupCommand(args, server, channelID);
                break;
            // bb!game <player_name> <player_name> <gameID>
            // Creates new channel for tracking and talking about game
            // Displays results and saves them to database.
            case 'game':
                this.gameCommand(args, server, channelID);
                break;
            // bb!help
            // Says Instructions
            case 'help':
                this.helpCommand(channelID);
                break;
            // bb!player <player_name>
            // Displays win loss ratio to other players
            case 'player':
                this.helpCommand(channelID);
                break;
            // bb!archive <player_name> <index>
            // Shows all games by player
            case 'archive':
                this.helpCommand(channelID);
                break;
            // bb!tournament <player_names>
            // Starts new channels for tournament
            case 'tournament':
                this.helpCommand(channelID);
                break;
            case 'sorry':
                this.sendMessage({to: channelID, message: 'Whatever dude\n'});
                break;
            case 'hi':
                this.sendMessage({to: channelID, message: 'Hi there.\n'});
                break;
            case 'cyrus':
                this.sendMessage({to: channelID, message: 'That\'s a Blunder.\nTry `bb!help` for options.\n\n\n\n\n\n(his peepee small)\n'});
                break;
            case 'blunder':
                this.sendMessage({to: channelID, message: 'Okay I\'ll go ahead and add a loss to your record.'});
                break;
            case 'Qh5':
                this.sendMessage({to: channelID, message: 'g6\nBoomer.'});
                break;
            // bb!*
            default: 
                this.invalidCommand(channelID);
                break;
        }
    }

    // bb!check 
    // Response "Mate!"
    async checkCommand(channelID) {
        this.sendMessage({ to: channelID, message: 'MATE!' });
        this.sendImage({to: channelID, file: './resources/geri.jpg'});
    }

    // bb!setup 
    // Prompts for "understood" if not provided
    // Creates Roles, Categories and Channels
    async setupCommand(args, server, channelID) {
        if ((args.length > 0 && args[0] != "understood") || args.length == 0) {
            this.sendMessage({to: channelID, message: 'Setup will create new categories and channels.\n`bb!setup understood` to proceed.'});
            return;
        }
        this.sendMessage({to: channelID, message: 'Server Setup: Beginning'});
        let serverID = server.id;
        let roleIDs = await this.createRoles(serverID);
        await this.sendMessage({to: channelID, message: 'Server Setup: Created `Roles`'});
        let categoryIDs = await this.createCategories(serverID);
        await this.sendMessage({to: channelID, message: 'Server Setup: Created `Categories`'});
        await this.createChannels(serverID, categoryIDs, roleIDs);
        await this.sendMessage({to: channelID, message: 'Server Setup: Created `Channels`'});
        await this.sendMessage({to: channelID, message: 'Server Setup: Finished\n\nUse `bb!help` for options.'});
    }

    // Following valid setup, creates roles 
    async createRoles(serverID) {
        let blunderBotRoles = [
            {name: "king", permissions: 8, color: 15439924, hoist: true, mentionable: true, present: false, id: null},
            {name: "queen", permissions: 8, color: 3457259, hoist: true, mentionable: true, present: false, id: null},
            {name: "pawns", permissions: 1832373313, color: 13776107, hoist: true, mentionable: true, present: false, id: null},
        ];
        let everyoneID = null;
        let blunderBotID = null;
        let roleIDs = Object.keys(this.servers[serverID].roles);
        for (let i = 0; i < blunderBotRoles.length; i++) {
            for (let j = 0; j < roleIDs.length; j++) {
                if (blunderBotRoles[i].name == this.servers[serverID].roles[roleIDs[j]].name) {
                    blunderBotRoles[i].present = true;
                    blunderBotRoles[i].id = roleIDs[j];
                    break;
                } else if (this.servers[serverID].roles[roleIDs[j]].name == 'BlunderBot'){
                    blunderBotID = roleIDs[j];
                } else if (this.servers[serverID].roles[roleIDs[j]].name == '@everyone') {
                    everyoneID = roleIDs[j];
                }
            }
        }
        for (let i = 0; i < blunderBotRoles.length; i++) {
            if (blunderBotRoles[i].present) continue;
            try {
                let response = await this._discordAPI.post('/guilds/' + serverID + '/roles', {
                    name: blunderBotRoles[i].name,
                    permissions: blunderBotRoles[i].permissions,
                    color: blunderBotRoles[i].color,
                    hoist: blunderBotRoles[i].hoist,
                    mentionable: blunderBotRoles[i].mentionable,
                });
                blunderBotRoles[i].id = response.data.id;
            } catch (error) {
                console.log(error);
            }
        }
        let userIDs = Object.keys(this.servers[serverID].members);
        let owner = this.servers[serverID].members[userIDs[0]].id;
        let oldestTime = this.servers[serverID].members[userIDs[0]].joined_at;
        for (let i = 0; i < userIDs.length; i++) {
            if (this.servers[serverID].members[userIDs[i]].joined_at < oldestTime) {
                owner = this.servers[serverID].members[userIDs[i]].id;
                oldestTime = this.servers[serverID].members[userIDs[i]].joined_at;
            }
        }

        for (let i = 0; i < userIDs.length; i++) {
            try {
                if (userIDs[i] == owner) {
                    await this._discordAPI.put('/guilds/' + serverID  +'/members/' + userIDs[i] + '/roles/' + blunderBotRoles[0].id);
                } else if (userIDs[i] == this.id) {
                    await this._discordAPI.put('/guilds/' + serverID  +'/members/' + userIDs[i] + '/roles/' + blunderBotRoles[1].id);
                } else {
                    await this._discordAPI.put('/guilds/' + serverID  +'/members/' + userIDs[i] + '/roles/' + blunderBotRoles[2].id);
                }
            } catch (error) {
                console.log(error);
            }
        }

        return {
            king: blunderBotRoles[0].id,
            queen: blunderBotRoles[1].id,
            pawn: blunderBotRoles[2].id,
            everyone: everyoneID,
        }
    }

    // Following valid setup, creates categories 
    async createCategories(serverID) {
        let categoryIDs = {};
        for (let [id, value] of Object.entries(this.channels)) 
            for (let key of Object.keys(this._categories)) 
                if (value.name == key && value.guild_id == serverID) {
                    this._categories[key].present = true;
                    categoryIDs[key] = value.id;
                    break;
                }
        for (let key of Object.keys(this._categories)) {
            if (this._categories[key].present) continue;
            try {
                let response = await this._discordAPI.post('/guilds/' + serverID + '/channels', {
                    name: key,
                    type: 4,
                    topic: this._categories[key].topic,
                    rate_limit_per_user: 0,
                    position: 0,
                    permission_overwrites: [],
                    parent_id: null,
                    nsfw: false,
                });
                categoryIDs[key] = response.data.id;
            } catch(error) {
                console.log(error);
            }
        } 
        return categoryIDs;
    }  

    // Following valid setup, creates channels 
    async createChannels(serverID, categoryIDs, roleIDs) {
        let restricted = [
            { id: roleIDs.king, type: 'role', allow: 522304, deny: 0x00000000},
            { id: roleIDs.queen, type: 'role', allow: 522304, deny: 0x00000000},
            { id: roleIDs.pawn, type: 'role', allow: 0x00000400, deny: 456768},
            { id: roleIDs.everyone, type: 'role', allow: 0x00000400, deny: 456768}
        ];
        for (let i = 0; i < this._channels.length; i++) {
            let currChannels = Object.keys(this.channels);
            let found = false;
            for (let j = 0; j < currChannels.length; j++) {
                if (this.channels[currChannels[j]].guild_id != serverID) continue;
                if (this.channels[currChannels[j]].name == this._channels[i].name) {
                    found = true; 
                    break; 
                }
            } 
            if (found) continue;
            try {
                let categoryID = null;
                if (this._channels[i].category in categoryIDs) categoryID = categoryIDs[this._channels[i].category];
                if (this._channels[i].type == 0) {
                    let permission_overwrites = [];
                    if (this._channels[i].permission_overwrites) permission_overwrites = restricted;
                    let response = await this._discordAPI.post('/guilds/' + serverID + '/channels', {
                        name: this._channels[i].name,
                        type: this._channels[i].type,
                        topic: this._channels[i].topic,
                        rate_limit_per_user: 0,
                        position: this._channels[i].position,
                        permission_overwrites: permission_overwrites,
                        parent_id: categoryID,
                        nsfw: false,
                    });
                    if (this._channels[i].name == 'welcome') {
                        this.sendMessage({to: response.data.id, message: 'https://bestanimations.com/Games/Chess/chess-animated-gif-4.gif'});
                    }
                } else if (this._channels[i].type == 2) {
                    await this._discordAPI.post('/guilds/' + serverID + '/channels', {
                        name: this._channels[i].name,
                        type: 2,
                        topic: this._channels[i].topic,
                        position: this._channels[i].position,
                        permission_overwrites: [],
                        parent_id: categoryID,
                        nsfw: false,
                    });
                }
            } catch(error) {
                console.log(error);
            }
        }
    }

    // bb!game <player1> <player2> <gameID (optional)>
    // Creates a game channel in active games
    async gameCommand(args, server, channelID) {
        // Check command has correct arguments
        if (args.length < 2) {
            this.sendMessage({to: channelID, message: 'Blunder.\nTry `bb!game <player1> <player2> <gameID>`.'});
            return;
        }
        if (this._serverKeys[server.id].categories['\u265A Active Games'] == null) {
            this.notSetup(channelID, 'bb!game');
            return;
        }
        // Generates Request to be Sent
        let request = {
            serverID: server.id,
            channelID: channelID,
            type: 0,
            player1: args[0],
            player2: args[1],
            gameID: null,
        }
        // Adds Game ID for later Processing.
        if (args.length > 2) request.gameID = args[2];
        // Adds to Queue
        this._chessAPI.addRequest(request);
    }

    async gameCommandPost(response) {
        // Following finding its way to the front of the line, requests will return here.
        // Data relevent to where the request came from are in response.req
        // API response is in response.data.
        let request = response.req;
        let data = response.data;

        if (data == null) {
            this.sendMessage({ to: request.channelID, message: 'Blunder.\nUser not found.!' });
            return;
        }
        let game = null;
        let possible;
        if (request.gameID == null) possible = [];
        for (let i = 0; i < data.games.length; i++) {
            let white = data.games[i].white.substring(33, data.games[i].white.length).toLowerCase();
            let black = data.games[i].black.substring(33, data.games[i].black.length).toLowerCase();
            let id = data.games[i].url.substring((data.games[i].url.length - 9), data.games[i].url.length);
            if ((white == request.player1.toLowerCase() && black == request.player2.toLowerCase()) || (white == request.player2.toLowerCase() && black == request.player1.toLowerCase())) {
                if (request.gameID == null) {
                    possible.push(i);
                    continue;
                } else {
                    if (id == request.gameID) {
                        game = data.games[i];
                        break;
                    }
                }
            }
        }
        if (request.gameID == null) {
            if (possible.length == 1) {
                game = data.games[possible[0]];
            } else if (possible.length > 1) {
                await this.sendMessage({to: request.channelID, message: 'You both have more than 1 game currently active.\nPlease clarify game ID in command.\n`bb!game <player1> <player2> <gameID>`\n'});
                return;
            } else if (possible.length == 0) {
                await this.sendMessage({to: request.channelID, message: 'No Games Found'});
                return;
            }
        }
        game.id = game.url.substring((game.url.length - 9), game.url.length);
        for (let i = 0; i < this._trackedGames.length; i++) {
            if (this._trackedGames[i].id == game.id) {
                await this.sendMessage({to: request.channelID, message: 'Already tracking this game.`\n'});
                return;
            }
        }
        game = await this.generateGameObject(game, request.serverID, null);
        try {
            let time = new Date(game.start_time);
            let response = await this._discordAPI.post('/guilds/' + request.serverID + '/channels', {
                name: game.white + '-VS-' + game.black + '-(' + game.id + ")",
                type: 0,
                topic: 'Game between ' + game.white + '(white) and ' + game.black + '(black). Started ' + (time.getMonth() + 1) + '/' + time.getDate() + '/' + time.getUTCFullYear(),
                rate_limit_per_user: 0,
                position: 1,
                permission_overwrites: [],
                parent_id: this._serverKeys[request.serverID].categories['\u265A Active Games'],
                nsfw: false,
            });
            game.channelID = response.data.id;
            this._trackedGames.push(game);
            console.log(this._trackedGames);
            if (this._interval == null) {
                this.startTracking();
            }
            this.sendMessage({to: game.channelID, message:  'Match Began: ' + (time.getMonth() + 1) + '/' + time.getDate() + '/' + time.getUTCFullYear() + '\nWhite: ' + game.white + ' (' + game.whiteElo+ ')\nBlack: ' + game.black + ' (' + game.blackElo + ')\nGame URL: ' + game.url + '\n\n'});
            try {
                let image = await this.generateBoardImage(game.board, game.id);
                this.sendMessage({to: game.channelID, message:  'Current Position:'});
                this.sendImage({to: game.channelID, file: image});
            } catch(error) {
                console.log(error);
            }
        } catch(error) {
            console.log(error);
            this.sendMessage({to: request.channelID, message: 'Error creating channel!\n'});
            return;
        }
    }

    async updateGame(response) {
        console.log("CHECKING FOR UPDATE");
        let data = response.data;
        let request = response.req;
        let newGame;

        for (let i = 0; i < data.games.length; i++) {
            let id = data.games[i].url.substring((data.games[i].url.length - 9), data.games[i].url.length);
            if (id == this._trackedGames[request.index].id) {
                if (this._trackedGames[request.index].last_activity != data.games[i].last_activity) {
                    newGame = data.games[i];
                } else {
                    console.log("Not Updated");
                    return;
                }
            } else {
                continue;
            }
        }
        console.log("UPDATING");
        newGame.id = this._trackedGames[request.index].id;
        newGame = await this.generateGameObject(newGame, this._trackedGames[request.index].serverID, this._trackedGames[request.index].channelID);
        this._trackedGames[request.index] = newGame;
        let player;
        if (newGame.moves[newGame.moves.length - 1].length == 1) player = newGame.white;
        else player = newGame.black;

        this.sendMessage({to: newGame.channelID, message: player + ' moved.'});
        try {
            let image = await this.generateBoardImage(newGame.board, newGame.id);
            await this.sendImage({to: newGame.channelID, file: image});
        } catch(error) {
            console.log(error);
        }
    }



    async startTracking() {
        setInterval(() => {
            try {
                console.log(this._trackedGames.length);
                for (let i = 0; i < this._trackedGames.length; i++) {
                    let request = {
                        type: 1,
                        index: i,
                        white: this._trackedGames[i].white,
                        id: this._trackedGames[i].id,
                    }
                    console.log("ADDING", i);
                    this._chessAPI.addRequest(request);
                }
            } catch (error) {
                console.log(error);
            }
        }, 10000);
        // this._interval = setInterval((trackedGames, chessAPI) => {
        //     
        // }, 10000);
    }

    // bb!help
    // Lists Available commands
    helpCommand(channelID) {
        let message = "";
        message += "**BlunderBot Commands:**\n";
        message += "`bb!check`\n\t\t- *Mate!*\n";
        message += "`bb!help`\n\t\t- *List of commands.*\n";
        message += "`bb!setup`\n\t\t- *Reorginize server for BlunderBot.*\n";
        message += "`bb!game <player1> <player2> <gameID>`\n\t\t- *Create a new chat and start tracking a game.*\n\t\t- *GameID only needed if you have more than 1 active game.*\n\t\t- *Run in `lobby-ag`*\n";
        message += "`bb!tournament <player> <player>...`\n\t\t- *Create new tournament.*\n\t\t- *Optionally add `double-elim` before player names.*\n\t\t- *Run in `lobby-t`*\n";
        message += "`bb!archive games <player>`\n\t\t- *View list of archived games.*\n\t\t- *Run in `access`*\n";
        message += "`bb!archive games <player> <index>`\n\t\t- *Choose a game by index to run through.*\n\t\t- *Run in `access`*\n";
        message += "`bb!archive profile <player>`\n\t\t- *View a player's stats.*\n\t\t- *Run in `access`*\n";
        this.sendMessage({to: channelID, message: message});
    }

    // bb!*
    // For Blunders
    invalidCommand(channelID) {
        this.sendMessage({to: channelID, message: 'That\'s a Blunder.\nTry `bb!help` for options.'});
    }

    // Ensures commands are being run the right channel.
    async checkChannel(cmd, channel, channelID, evt) {
        let schema = this._channels.map(channel => channel.name);
        let index = schema.indexOf(channel);
        if (index == -1) {
            return true;
        } else if (!(cmd in this._permissions)) {
            this.invalidCommand(channelID);
            return false;
        } else if (this._permissions[cmd][index]){
            return true;
        } else {
            let valid = "";
            for (let i = 0; i < this._permissions[cmd].length; i++) 
                if (this._permissions[cmd][i]) 
                    valid += " `" + schema[i] + "`";
            try {
            //console.log( await this._discordAPI.delete('/channels/' + channelID + '/messages/' + evt.d.id));
            this.sendMessage({to: channelID, message: 'Blunder.\nThis command can only be run in' + valid + '.\n'});
            } catch(error) {
                console.log(error);
            }
        }
    }

    notSetup(channelID, command) {
        this.sendMessage({to: channelID, message: 'This server is not setup for that yet.\nUse `bb!setup` to use `' + command + '`'});
    }

    // Sets some variables
    async inicializeServerStructure() {
        this._permissions = {
            'check': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            'sorry': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            'cyrus': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            'blunder': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            'start': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            'hi': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            'Qh5': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            'help': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            'setup': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            'game': [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
            'tournament': [0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
            'archive': [0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
        };
        this._channels = [
            {name: 'welcome', type: 0, topic: '', position: 0, permission_overwrites: true, category: null},
            {name: 'general', type: 0, topic: 'General chat', position: 0, permission_overwrites: false, category: '\u265F General'},
            {name: 'leaderboards', type: 0, topic: 'Leaderboards and winnings.', position: 1, permission_overwrites: true, category: '\u265F General'},
            {name: 'discussion', type: 2, topic: 'General voice channel.', position: 2, permission_overwrites: false, category: '\u265F General'},
            {name: 'lobby-ag', type: 0, topic: 'Start tracking games.', position: 0, permission_overwrites: false, category: '\u265A Active Games'},
            {name: 'lobby-t', type: 0, topic: 'Start tournaments.', position: 0, permission_overwrites: false, category: '\u265C Tournament'},
            {name: 'tournament', type: 0, topic: 'Brackets and stats on current tournament.', position: 1, permission_overwrites: true, category: '\u265C Tournament'},
            {name: 'access', type: 0, topic: 'View Archive Data.', position: 0, permission_overwrites: false, category: '\u265D Archive'},
            {name: 'game-archive', type: 0, topic: 'Blunder Bot\'s chat for storing game data.', position: 1, permission_overwrites: true, category: '\u265D Archive'},
            {name: 'profile-archive', type: 0, topic: 'Blunder Bot\'s chat for storing user information (win / loss rate)', position: 2, permission_overwrites: true, category: '\u265D Archive'},
        ];
        this._categories = {
            '\u265F General': {present: false, topic: "General Channels.", position: 1},
            '\u265A Active Games': {present: false, topic: "Text channels and live updates from tracked games.", position: 2},
            '\u265C Tournament': {present: false, topic: "Tournament matches", position: 3},
            '\u265D Archive': {present: false, topic: "Stores relevent data to users and past games. View old games or stats.", position: 4},
        };
    }

    // Servers, Roles and Channels are stored in the Discord.io bot linked only by ID's
    // Instead of searching for the right channel in the right server each time, this function saves ID's relevent to each server.
    async processCurrentServers() {
        this._serverKeys = {};
        let serverIDs = Object.keys(this.servers);
        for (let i = 0; i < serverIDs.length; i++) {
            let serverInstance = {
                setup: false,
                channels: {
                    'welcome': null,
                    'general': null,
                    'leaderboards': null,
                    'discussion': null,
                    'lobby-ag': null,
                    'lobby-t': null,
                    'tournament': null,
                    'access': null,
                    'game-archive': null,
                    'profile-archive': null,
                },
                categories: {
                    '\u265F General': null,
                    '\u265A Active Games': null,
                    '\u265C Tournament': null,
                    '\u265D Archive':null
                },
                roles: {
                    king: null,
                    queen: null,
                    pawns: null,
                    everyone: null,
                },
            }
            let channelIDs = Object.keys(this.channels);
            for (let j = 0; j < channelIDs.length; j++) {
                if (this.channels[channelIDs[j]].guild_id != serverIDs[i]) continue;
                if (this.channels[channelIDs[j]].name in serverInstance.channels) {
                    serverInstance.channels[this.channels[channelIDs[j]].name] = channelIDs[j];
                } else if (this.channels[channelIDs[j]].name in serverInstance.categories) {
                    serverInstance.setup = true;
                    serverInstance.categories[this.channels[channelIDs[j]].name] = channelIDs[j];
                }
            }
            let roleIDs = Object.keys(this.servers[serverIDs[i]].roles)
            for (let j = 0; j < roleIDs.length; j++) {
                if (this.servers[serverIDs[i]].roles[roleIDs[j]].name == "king") serverInstance.roles.king = roleIDs[j];
                else if (this.servers[serverIDs[i]].roles[roleIDs[j]].name == "queen") serverInstance.roles.queen = roleIDs[j];
                else if (this.servers[serverIDs[i]].roles[roleIDs[j]].name == "pawns") serverInstance.roles.pawns = roleIDs[j];
                else if (this.servers[serverIDs[i]].roles[roleIDs[j]].name == "@everyone") serverInstance.roles.everyone = roleIDs[j];
            }
            this._serverKeys[serverIDs[i]] = serverInstance;
        }
    }

    async generateGameObject(game, serverID, channelID) {
        let pgnData = await this.processPGN(game.pgn);
        game.white = game.white.substring(33, game.white.length);
        game.black = game.black.substring(33, game.black.length);
        game.board = await this.processBoard(game.fen);
        game.moves = pgnData["Moves"];
        game.whiteElo = pgnData["WhiteElo"];
        game.blackElo = pgnData["BlackElo"];
        game.serverID = serverID;
        game.channelID = channelID;
        return game;
    }

    async generateBoardImage(data, gameID) {
        return await this._imageCreator.createImage({type: 'array', data: data, path: './resources/rendered/' + gameID + '.png'});
    }

    // I thought it was tedious to do this each time so heres a function that makes it like sending messages.
    // @params options = { to: channelID, file: path }
    async sendImage(options) {
        let pathSplit = await options.file.split('/');
        let filename = pathSplit[pathSplit.length - 1];
        let file = await fs.readFileSync(options.file);
        this.uploadFile( { to: options.to, file: file, filename: filename});
    }

    processBoard(fen) {
        let board = [];
        let rows = fen.split('/');
        let empty = ['1', '2', '3', '4', '5', '6', '7', '8'];
        for (let i = 0; i < 8; i++) {
            board.push([]);
            for (let j = 0; j < 8; j++) {
                if (j == rows[i].length) break;
                if (rows[i].charAt(j) == " ") break;
                if (empty.includes(rows[i].charAt(j))) 
                    for (let k = 0; k < (empty.indexOf(rows[i].charAt(j)) + 1); k++) 
                        board[i].push(""); 
                 else board[i].push(rows[i].charAt(j));
            }
        }
        return board;
    }

    processPGN(pgn) {
        let data = {
            "Result": null,
            "WhiteElo": null,
            "BlackElo": null,
            "Moves": null
        };
        let pgnSplit = pgn.split('\n');
        for (let i = 0; i < pgnSplit.length; i++) {
            if (pgnSplit[i] == '') break;
            let titleIndex = pgnSplit[i].indexOf(' ');
            let title = pgnSplit[i].substring(1, titleIndex);
            if (title in data) {
                let start = pgnSplit[i].indexOf('"');
                let end = pgnSplit[i].indexOf('"', (start + 1));
                let value = pgnSplit[i].substring(start + 1, end);
                data[title] = value;
            }
        }
        let moves = [];
        let movesSplit = pgnSplit[pgnSplit.length - 1].split(' ');
        let state = 0;
        for (let i = 0; i < movesSplit.length; i++) {
            if (state == 0) {
                let turnIndex = movesSplit[i].indexOf('.');
                let turnNum = movesSplit[i].substring(0, turnIndex);
                if (moves.length < parseInt(turnNum, 10)) {
                    moves.push([]);
                }
                state += 1;
            } else if (state == 1) {
                moves[moves.length - 1].push(movesSplit[i]);
                state += 1;
            } else if (state == 2) {
                i++;
                state = 0;
                continue;
            }
        }
        data["Moves"] = moves;
        return data;
    }
}

module.exports = BlunderBot;