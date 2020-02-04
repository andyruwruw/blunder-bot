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

function check() {

}

bot.on('message', function (user, userID, channelID, message, evt) {

    let check = () => {
        bot.sendMessage({
            to: channelID,
            message: 'MATE!'
        });
    };

    let game = async (args) => {
        let response = await axios.get('https://api.chess.com/pub/player/andyruwruw/games');
        console.log(response.data);
    };

    let invalid = async () => {
        await bot.sendMessage({to: channelID, message: 'That\'s a Blunder.\nTry `!help` for options.'});
    };

    let help = async() => {
        await bot.sendMessage({to: channelID, message: 'Discoveries:\n`!help` - for BlunderBot Commands.\n`!game <player1> <player2> <gameID>` - Start tracking a game. GameID is in the URL or '});
    }

    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
        args = args.splice(1);

        switch(cmd) {
            // !check
            case 'check':
                check();
                break;
            case 'game':
                game(args);
                break;
            case 'help':
                help();
                break;
            default: 
                invalid();
                break;

         }
     }
});


