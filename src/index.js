var Discord = require('discord.io');
var logger = require('winston');
var axios = require('axios');
let dotenv = require('dotenv');
dotenv.config();
let discordToken = process.env.discordToken;

//import jimp from 'jimp';

logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

let discord = axios.create({
    headers: {
        common: {        // can be common or any other method
            Authorization: 'Bot ' + discordToken,
        }
    }
});

var bot = new Discord.Client({
   token: discordToken,
   autorun: true
});

bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');

    let wait = async () => {
        while (true) {
            setTimeout(function() {
                if (bot.api_clear) 
                    return;
            }, 500);
        }
    }


    let check = async () => {
        await wait();
        bot.api_clear = false;
        console.log("hello");
        bot.api_clear = true;
    };
    
    bot.chess_interval = setInterval(check, 5000);
});

// THINGS TO WORK ON
    // DELETE USER MADE MESSAGES IN ARCHIVE
    // CHECK CHANNEL FOR COMMANDS
    // VIEW GAMES
    // TRACK GAMES

bot.on('message', async function (user, userID, channelID, message, evt) {

    let check = () => {
        bot.sendMessage({
            to: channelID,
            message: 'MATE!'
        });
    };

    let setup = async(args) => {
        if (args.length > 0 && args[0] == "understood") {
            // Retrieving Server ID
            let serverID;
            for (let [key, value] of Object.entries(bot.channels)) 
                if (key == channelID) {
                    serverID = value.guild_id;
                    break;
                }

            let roleIDs = await createRoles(serverID);
            // Creating Categories if needed
            console.log("SETUP");
            let categoryIDs = await createCategories(serverID);

            // Adding channels to categories
            await createChannels(serverID, categoryIDs, roleIDs);
        } else {
            await bot.sendMessage({to: channelID, message: 'Setup will create new categories and channels.\n`bb!setup understood` to proceed.'});
        }
    }

    let createRoles = async (serverID) => {
        let roles = [
            {name: "king", permissions: 8, color: 15439924, hoist: true, mentionable: true, present: false, id: null},
            {name: "queen", permissions: 8, color: 3457259, hoist: true, mentionable: true, present: false, id: null},
            {name: "pawns", permissions: 1832373313, color: 13776107, hoist: true, mentionable: true, present: false, id: null},
        ];
        let everyoneID = null;
        let BlunderBotRoleID = null;
        let currRoles = bot.servers[serverID].roles;
        let roleIDs = Object.keys(currRoles);
        for (let i = 0; i < roles.length; i++) {
            for (let j = 0; j < roleIDs.length; j++) {
                if (roles[i].name == currRoles[roleIDs[j]].name) {
                    roles[i].present = true;
                    roles[i].id = roleIDs[j];
                    break;
                } else if (bot.servers[serverID].roles[roleIDs[j]].name == 'BlunderBot'){
                    BlunderBotRoleID = roleIDs[j];
                } else if (bot.servers[serverID].roles[roleIDs[j]].name == '@everyone') {
                    everyoneID = roleIDs[j];
                }
            }
        }
        console.log("EVERYONE ID", everyoneID);
        for (let i = 0; i < roles.length; i++) 
            if (!roles[i].present) 
                try {
                    let response = await discord.post('https://discordapp.com/api/guilds/' + serverID + '/roles', {
                        name: roles[i].name,
                        permissions: roles[i].permissions,
                        color: roles[i].color,
                        hoist: roles[i].hoist,
                        mentionable: roles[i].mentionable,
                    });
                    roles[i].id = response.data.id;
                } catch (error) {
                    console.log(error);
                }
        let userIDs = Object.keys(bot.servers[serverID].members);
        let botID = null;
        
        let owner = bot.servers[serverID].members[userIDs[0]].id;
        let oldestTime = bot.servers[serverID].members[userIDs[0]].joined_at;
        for (let i = 0; i < userIDs.length; i++) {
            if (bot.servers[serverID].members[userIDs[i]].joined_at < oldestTime) {
                owner = bot.servers[serverID].members[userIDs[i]].id;
                oldestTime = bot.servers[serverID].members[userIDs[i]].joined_at;
            }
            if (bot.servers[serverID].members[userIDs[i]].roles.length > 0) {
                for (let j = 0; j < bot.servers[serverID].members[userIDs[i]].roles.length; j++) {
                    if (bot.servers[serverID].members[userIDs[i]].roles[j] == BlunderBotRoleID)
                        botID = bot.servers[serverID].members[userIDs[i]].id;
                }
            }
        }

        for (let i = 0; i < userIDs.length; i++) {
            try {
                if (userIDs[i] == owner) {
                    await discord.put('https://discordapp.com/api/guilds/' + serverID  +'/members/' + userIDs[i] + '/roles/' + roles[0].id);
                } else if (userIDs[i] == botID) {
                    await discord.put('https://discordapp.com/api/guilds/' + serverID  +'/members/' + userIDs[i] + '/roles/' + roles[1].id);
                } else {
                    await discord.put('https://discordapp.com/api/guilds/' + serverID  +'/members/' + userIDs[i] + '/roles/' + roles[2].id);
                }
            } catch (error) {
                console.log(error);
            }
        }

        return {
            king: roles[0].id,
            queen: roles[1].id,
            pawn: roles[2].id,
            everyone: everyoneID,
        }
    };

    let createCategories = async (serverID) => {
        let categoryIDs = {};
        let categories = {
            '\u265F General': {present: false, topic: "General Channels.", position: 1},
            '\u265A Active Games': {present: false, topic: "Text channels and live updates from tracked games.", position: 2},
            '\u265C Tournament': {present: false, topic: "Tournament matches", position: 3},
            '\u265D Archive': {present: false, topic: "Stores relevent data to users and past games. View old games or stats.", position: 4},
        };
        for (let [id, value] of Object.entries(bot.channels)) 
            for (let key of Object.keys(categories)) 
                if (value.name == key && value.guild_id == serverID) {
                    categories[key].present = true;
                    categoryIDs[key] = value.id;
                    break;
                }
        for (let key of Object.keys(categories)) {
            if (!categories[key].present) {
                try {
                    let response = await discord.post('https://discordapp.com/api/guilds/' + serverID + '/channels', {
                        name: key,
                        type: 4,
                        topic: categories[key].topic,
                        rate_limit_per_user: 0,
                        position: 0,
                        permission_overwrites: [],
                        parent_id: null,
                        nsfw: false,
                    });
                    categoryIDs[key] = response.data.id;
                } catch(error) {
                    console.log(error);
                    await bot.sendMessage({to: channel.id, message: 'Failed to create category'});
                }
            }
        } 
        return categoryIDs;
    };

    let createChannels = async (serverID, categoryIDs, roleIDs) => {
        let banned = [
            { id: roleIDs.king, type: 'role', allow: 522304, deny: 0x00000000},
            { id: roleIDs.queen, type: 'role', allow: 522304, deny: 0x00000000},
            { id: roleIDs.pawn, type: 'role', allow: 0x00000400, deny: 456768},
            { id: roleIDs.everyone, type: 'role', allow: 0x00000400, deny: 456768}
        ]
        let channels = {
            // welcome -> text chat
            '\u265F General': [
                {
                    name: "general",
                    type: 0,
                    topic: "General chat.",
                    position: 0,
                    permission_overwrites: [],
                },
                {
                    name: "leaderboards",
                    type: 0,
                    topic: "General chat.",
                    position: 1,
                    permission_overwrites: banned,
                },
                // discussion -> voice chat.
            ],
            '\u265A Active Games': [
                {
                    name: "lobby-ag",
                    type: 0,
                    topic: "Start games.",
                    position: 2,
                    permission_overwrites: [],
                },
            ],
            '\u265C Tournament': [
                {
                    name: "lobby-t",
                    type: 0,
                    topic: "Start tournaments.",
                    position: 2,
                    permission_overwrites: [],
                },
                {
                    name: "tournament",
                    type: 0,
                    topic: "Brackets and stats on current tournament.",
                    position: 2,
                    permission_overwrites: banned,
                },
            ],
            '\u265D Archive': [
                {
                    name: "access",
                    type: 0,
                    topic: "View Archive Data.",
                    position: 0,
                    permission_overwrites: [],
                },
                {
                    name: "game-archive",
                    type: 0,
                    topic: "Blunder Bot's chat for storing game data.",
                    position: 1,
                    permission_overwrites: banned,
                },
                {
                    name: "profile-archive",
                    type: 0,
                    topic: "Blunder Bot's chat for storing user information (win / loss rate)",
                    position: 2,
                    permission_overwrites: banned,
                },
            ],
        };

        let categoryKeys = Object.keys(channels);
        for (let i = 0; i < categoryKeys.length; i++) {
            for (let j = 0; j < channels[categoryKeys[i]].length; j++) {
                let exists = false;
                for (let [key, value] of Object.entries(bot.channels)) 
                    if (value.name == channels[categoryKeys[i]][j].name && value.type == channels[categoryKeys[i]][j].type && value.guild_id == serverID) {
                        exists = true;
                        if (value.parent_id != categoryIDs[categoryKeys[i]]) {
                            try {
                                await discord.put('https://discordapp.com/api/channels/' + value.id, {
                                    parent_id: categoryIDs[categoryKeys[i]],
                                });
                            } catch(error) {
                                console.log("Failed to reset Category");
                            }
                        }
                    }
                if (exists) continue;
                try {
                    await discord.post('https://discordapp.com/api/guilds/' + serverID + '/channels', {
                        name: channels[categoryKeys[i]][j].name,
                        type: channels[categoryKeys[i]][j].type,
                        topic: channels[categoryKeys[i]][j].topic,
                        rate_limit_per_user: 0,
                        position: channels[categoryKeys[i]][j].position,
                        permission_overwrites: channels[categoryKeys[i]][j].permission_overwrites,
                        parent_id: categoryIDs[categoryKeys[i]],
                        nsfw: false,
                    });
                } catch(error) {
                    console.log(error);
                }

            }
        }

        let welcomeExists = false;
        for (let [key, value] of Object.entries(bot.channels)) 
            if (value.name == 'welcome' && value.type == 0 && value.guild_id == serverID) {
                welcomeExists = true;
                if (value.parent_id != null || value.position != 0) {
                    try {
                        await discord.put('https://discordapp.com/api/channels/' + value.id, {
                            position: 0,
                            parent_id: null,
                        });
                    } catch(error) {
                        console.log(error);
                    }
                }
                break;
            }
        if (!welcomeExists) {
            try {
                let response = await discord.post('https://discordapp.com/api/guilds/' + serverID + '/channels', {
                    name: 'welcome',
                    type: 0,
                    topic: "Introduce people to the server",
                    rate_limit_per_user: 0,
                    position: 0,
                    permission_overwrites: banned,
                    parent_id: null,
                    nsfw: false,
                });
                await bot.sendMessage({to: response.data.id, message: 'https://bestanimations.com/Games/Chess/chess-animated-gif-4.gif'});
            } catch(error) {
                console.log(error);
                await bot.sendMessage({to: channel.id, message: 'Failed to create welcome channel.'});
            }
        }

        let discussionExists = false;
        for (let [key, value] of Object.entries(bot.channels)) 
            if (value.name == 'discussion' && value.type == 2 && value.guild_id == serverID) {
                discussionExists = true;
                if (value.parent_id != categoryIDs['\u265F General']) {
                    try {
                        await discord.put('https://discordapp.com/api/channels/' + value.id, {
                            parent_id: categoryIDs['\u265F General'],
                        });
                    } catch(error) {
                        console.log(error);
                    }
                }
                break;
            }
        if (!discussionExists) {
            try {
                await discord.post('https://discordapp.com/api/guilds/' + serverID + '/channels', {
                    name: 'discussion',
                    type: 2,
                    topic: "Voice channel for server.",
                    position: 2,
                    permission_overwrites: [],
                    parent_id: categoryIDs['\u265F General'],
                    nsfw: false,
                });
            } catch(error) {
                console.log(error);
                await bot.sendMessage({to: channel.id, message: 'Failed to create .voice channel'});
            }
        }
    };

    let wait = async () => {
        while (true) {
            setTimeout(function() {
                if (bot.api_clear) 
                    return;
            }, 500);
        }
    }

    let game = async (args) => {
        // Check command has correct arguments
        if (args.length < 2) {
            await bot.sendMessage({to: channelID, message: 'Blunder.\nTry `bb!game <player1> <player2> <gameID>`.'});
            return;
        }
        
        // Get server ID from channels
        let serverID;
        for (let [key, value] of Object.entries(bot.channels)) 
            if (key == channelID) {
                serverID = value.guild_id;
                break;
            }

        // Retrieve games from player 1
        let games;
        try {
            await wait();
            bot.api_clear = false;
            let response = await axios.get('https://api.chess.com/pub/player/' + args[0] + '/games');
            bot.api_clear = true;

            games = response.data.games;
        } catch(error) {
            // Chess.com returned error.
            await bot.sendMessage({to: channelID, message: 'Blunder.\nUser not found.'});
            return;
        }

        // Set Game ID
        let gameID;
        let wURL = null;
        let bURL = null;
        let whiteName = null;
        let blackName = null;
        let gameURL = null;
        let startTime = null;
        if (args.length > 2) gameID = args[2];
     
        // Find GameID if not provided
        let found = 0;
        for (let i = 0; i < games.length; i++) {
            let white = games[i].white.substring(33, games[i].white.length).toLowerCase();
            let black = games[i].black.substring(33, games[i].black.length).toLowerCase();
            let id = games[i].url.substring((games[i].url.length - 9), games[i].url.length);
            if ((white == args[0].toLowerCase() && black == args[1].toLowerCase()) || (white == args[1].toLowerCase() && black == args[0].toLowerCase())) {
                found += 1;
                console.log(id);
                console.log(gameID);
                if (gameID == null || id == gameID) {
                    if (gameID == null)
                        gameID = games[i].url.substring(games[i].url.length - 9, games[i].url.length);
                    wURL = games[i].white;
                    bURL = games[i].black;
                    whiteName = white;
                    blackName = black;
                    startTime = games[i].start_time;
                    gameURL = games[i].url;
                }
            }
        }
        // More than 1 Game Active between users.
        if (found > 1 && gameID == null) {
            await bot.sendMessage({to: channelID, message: 'You both have more than 1 game currently active.\nPlease clarify game ID in command.\n`bb!game <player1> <player2> <gameID>`\n'});
            return;
        } else if (found == 0) {
            await bot.sendMessage({to: channelID, message: 'No Games Found'});
            return;
        }
    

        // Name of Channel
        let name = args[0] + ' vs. ' + args[1] + ' | ' + gameID;

        // Create New Channel
        try {
            let categoryID;
            while (categoryID == null) {
            for (let [key, value] of Object.entries(bot.channels)) {
                if (value.name == "\u265A Active Games" && value.type == 4 && value.guild_id == serverID) {
                    categoryID = key;
                    break;
                }
            }
            if (!categoryID) await createCategories();
            }
            console.log('channelID', channelID);
            let now = new Date(startTime);
            let channel;
            try {
                let response = await discord.post('https://discordapp.com/api/guilds/' + serverID + '/channels', {
                    name: name,
                    type: 0,
                    topic: 'Game between [' + whiteName + '](' + wURL + ') and [' + blackName + '](' + bURL + '). Started ' + (now.getMonth() + 1) + '/' + now.getDate() + '/' + now.getUTCFullYear(),
                    rate_limit_per_user: 0,
                    position: 1,
                    permission_overwrites: [],
                    parent_id: categoryID,
                    nsfw: false,
                });
                channel = response.data;
            } catch(error) {
                console.log(error);
                await bot.sendMessage({to: channelID, message: 'Error creating channel!\n'});
                return;
            }
            await bot.sendMessage({to: channel.id, message: '**' + whiteName.toUpperCase() + ' VS ' + blackName.toUpperCase() + '**\n\nMatch Began: ' + (now.getMonth() + 1) + '/' + now.getDate() + '/' + now.getUTCFullYear() + '\nGame URL: ' + gameURL + '\n\n'});
        } catch(error) {
            console.log(error);
        }
    };

    let help = async () => {
        let message = "";
        message += "**BlunderBot Discoveries:**bb!\n\n";
        message += "`bb!check`\n\t\t*- Mate!*\n\n";
        message += "`bb!help`\n\t\t*- List of commands.*\n\n";
        message += "`bb!setup`\n\t\t*- Reorginize server for BlunderBot.*\n\n";
        message += "`bb!game <player1> <player2> <gameID>`\n\t\t*- Create a new chat and start tracking a game. (gameID only needed if you have more than 1 active game)\n\t\t- Run in `lobby-ag`*\n\n";
        message += "`bb!tournament <player> <player>...`\n\t\t*- Create new tournament. Optionally add `double-elim` before player names.\n\t\t- Run in `lobby-t`*\n\n";
        message += "`bb!archive games <player>`\n\t\t*- View list of archived games.\n\t\t- Run in `access`*\n\n";
        message += "`bb!archive games <player> <index>`\n\t\t*- Choose a game by index to run through.\n\t\t- Run in `access`*\n\n";
        message += "`bb!archive profile <player>`\n\t\t*- View a player's stats.\n\t\t- Run in `access`*\n\n";
        await bot.sendMessage({to: channelID, message: message});
    };

    let invalid = async () => {
        await bot.sendMessage({to: channelID, message: 'That\'s a Blunder.\nTry `bb!help` for options.'});
    };

    let checkChannel = async(cmd) => {
        let channelName = bot.channels[channelID].name;
        let commandChannels = {
            'check': ['all'],
            'sorry': ['all'],
            'cyrus': ['all'],
            'blunder': ['all'],
            'start': ['all'],
            'hi': ['all'],
            'Qh5': ['all'],
            'help': ['all'],
            'setup': ['all'],
            'game': ['lobby-ag'],
            'tournament': ['lobby-t'],
            'archive': ['access'],
        };
        if (!(cmd in commandChannels)) {
            invalid();
            return false;
        }
        if (commandChannels[cmd].includes(channelName)) {
            return true;
        } else if (commandChannels[cmd][0] == 'all') {
            return true;
        } else {
            let valid = "";
            for (let i = 0; i < commandChannels[cmd].length; i++) {
                valid += " ";
                valid += "`" + commandChannels[cmd][i] + "`";
            }
            await bot.sendMessage({to: channelID, message: 'Blunder.\nThis command can only be run in' + valid + '.\n'});
            return false;
        }

    };

    let start = async () => {
        
    }

    if (message.substring(0, 3) == 'bb!') {
        var args = message.substring(3).split(' ');
        var cmd = args[0];
        args = args.splice(1);

        if (await checkChannel(cmd)) {
            switch(cmd) {
                // bb!check
                // Says Mate
                case 'check':
                    check();
                    break;
                // bb!setup
                // Formats Server
                case 'setup':
                    setup(args);
                    break;
                case 'start':
                    start();
                    break;
                // bb!game <player_name> <player_name> <gameID>
                // Creates new channel for tracking and talking about game
                // Displays results and saves them to database.
                case 'game':
                    game(args);
                    break;
                // bb!help
                // Says Instructions
                case 'help':
                    help();
                    break;
                // bb!player <player_name>
                // Displays win loss ratio to other players
                case 'player':
                    help();
                    break;
                // bb!archive <player_name> <index>
                // Shows all games by player
                case 'archive':
                    help();
                    break;
                // bb!tournament <player_names>
                // Starts new channels for tournament
                case 'tournament':
                    help();
                    break;
                case 'sorry':
                    await bot.sendMessage({to: channelID, message: 'Whatever dude\n'});
                    break;
                case 'hi':
                    await bot.sendMessage({to: channelID, message: 'Hi there.\n'});
                    break;
                case 'cyrus':
                    await bot.sendMessage({to: channelID, message: 'That\'s a Blunder.\nTry `bb!help` for options.\n\n\n\n\n\n(his peepee small)\n'});
                    break;
                case 'blunder':
                    await bot.sendMessage({to: channelID, message: 'Okay I\'ll go ahead and add a loss to your record.'});
                    break;
                case 'Qh5':
                    await bot.sendMessage({to: channelID, message: 'g6\nBoomer.'});
                    break;
                // bb!*
                default: 
                    invalid();
                    break;
            }
        }
     }
});


