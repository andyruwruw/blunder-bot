
var ChessWebAPI = require('chess-web-api');

var chessAPI = new ChessWebAPI({
    queue: true,
});

let printResults = function(response) {
    console.log(response.body);
}

console.log(typeof(printResults));

chessAPI.dispatch(chessAPI.getPlayer, printResults, ["andyruwruw"], {}, 1);
chessAPI.dispatch(chessAPI.getTitled, printResults, ["GM"], {}, 1);
chessAPI.dispatch(chessAPI.getPlayerCurrentDailyChess, printResults, ["andyruwruw"], {}, 1);
chessAPI.dispatch(chessAPI.getPlayerCompleteMonthlyArchives, printResults, ["andyruwruw", 2019, 10], {}, 1);


// import { Collection } from "discord.js";

// let Message = {
//     channel: {
//         type: 'text',
//         delete: false,
//         id: String,
//         name: String,
//         position: Number,
//         parentID: String,
//         //permissionOverwrites: Collection [Map] {},
//         topic: String,
//         nsfw: false,
//         lastMessageID: String,
//         lastPinTimestamp: null,
//         rateLimitPerUser: 0,
//         guild: {
//             members: [Collection],
//             channels: [Collection],
//             roles: [Collection],
//             presences: [Collection],
//             deletes: false,
//             available: true,
//             id: String,
//             name: String,
//             icon: String,
//             splash: null,
//             memberCount: Number,
//             joinedTimestamp: Number,
//             ownerID: String,
//         }
//         //messages: Collection [Map] {'String' => [Circular},]
//     },
//     deleted: false,
//     id: String,
//     type: 'DEFAULT',
//     content: String,
//     author: {
//         id: String,
//         username: String,
//     },
//     member: {
//         guild: {
//             // same
//         },
//         user: {
//             // same
//         },
//         joinedTimestamp: Number,
//         _roles: ['String'],
//         nickname: String,
//         lastMessageID: String,
//         speaking: false,
//     },
//     pinned: false,
//     tts: false,
//     nonce: String,
//     // attachments: Collection [Map] {},
//     createdTimestamp: Number,
//     editedTimestamp: null,
//     // reactions: Collection [Map] {},
//     mentions: {
//         everyone: false,
//         // users: Collection [Map] {},
//         // roles: Collection [Map] {},,
//         _content: String,
//         _client: //BlunderBot 
//         {
//                 // Whole Object
//         },
//         _guild: {
//             // Whole OBject
//         },
//         _members: null,
//         _channels: null,
//     },
//         webhookID: null,
//         hit: null,
//         _edits: []
// }