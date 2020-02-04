var Discord = require('discord.io');
var logger = require('winston');
var axios = require('axios');
let dotenv = require('dotenv');
dotenv.config();
let discordToken = process.env.discordToken;


logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

var bot = new Discord.Client({
   token: discordToken,
   autorun: true
});

bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

bot.on('message', async function (user, userID, channelID, message, evt) {

    let check = () => {
        bot.sendMessage({
            to: channelID,
            message: 'MATE!'
        });
        // console.log(user.servers);
    };

    let game = async (args) => {
        // let response = await axios.get('https://api.chess.com/pub/player/andyruwruw/games');
        // console.log(response.data);
    };

    let help = async () => {
        // Will Fix Formating
        // Do Last
        await bot.sendMessage({to: channelID, message: 'Discoveries:\n`!help` - for BlunderBot Commands.\n`!game <player1> <player2> <gameID>` - Start tracking a game. GameID is in the URL or '});
    }

    let invalid = async () => {
        await bot.sendMessage({to: channelID, message: 'That\'s a Blunder.\nTry `!help` for options.'});
    };

    if (message.substring(0, 3) == 'bb!') {
        var args = message.substring(3).split(' ');
        var cmd = args[0];
        args = args.splice(1);

        switch(cmd) {
            // !check
            // Says Mate
            case 'check':
                check();
                break;
            // !game <player_name> <player_name> <gameID>
            // Creates new channel for tracking and talking about game
            // Displays results and saves them to database.
            case 'game':
                game(args);
                break;
            // !help
            // Says Instructions
            case 'help':
                help();
                break;
            // !player <player_name>
            // Displays win loss ratio to other players
            case 'player':
                help();
                break;
            // !archive <player_name> <index>
            // Shows all games by player
            case 'archive':
                help();
                break;
            // !tournament <player_names>
            // Starts new channels for tournament
            case 'tournament':
                help();
                break;
            // !invalid
            default: 
                invalid();
                break;

         }
     }
});


