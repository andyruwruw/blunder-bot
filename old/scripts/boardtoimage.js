// Dependencies
let Jimp = require('jimp');

class BoardToImage {
    // @param options {
    //     type: 'pgn' | 'array' | 'fen',
    //     data: String | Array | String,
    //     path: String,
    //}
    constructor() {
        this._darkHex = Jimp.rgbaToInt(181, 136, 99, 255);
        this._lightHex = Jimp.rgbaToInt(240, 217, 181, 255);
        this.P = Jimp.read('./resources/chesspieces/Chess_plt60.png');
        this.p = Jimp.read('./resources/chesspieces/Chess_pdt60.png');
        this.B = Jimp.read('./resources/chesspieces/Chess_blt60.png');
        this.b = Jimp.read('./resources/chesspieces/Chess_bdt60.png');
        this.N = Jimp.read('./resources/chesspieces/Chess_nlt60.png');
        this.n = Jimp.read('./resources/chesspieces/Chess_ndt60.png');
        this.R = Jimp.read('./resources/chesspieces/Chess_rlt60.png');
        this.r = Jimp.read('./resources/chesspieces/Chess_rdt60.png');
        this.Q = Jimp.read('./resources/chesspieces/Chess_qlt60.png');
        this.q = Jimp.read('./resources/chesspieces/Chess_qdt60.png');
        this.K = Jimp.read('./resources/chesspieces/Chess_klt60.png');
        this.k = Jimp.read('./resources/chesspieces/Chess_kdt60.png');
    }

    async createImage(options) {
        let type, data, path;
        type = options.type;
        data = options.data;
        path = options.path;
        let board;

        if (type == 'array') board = data;
        else if (type == 'fen') board = await this.fenToArray(data);
        else if (type == 'pgn') board = await this.pgnToArray(data);
        let lightHex = this._lightHex;
        let darkHex = this._darkHex
        let image = await (new Jimp(480, 480, lightHex, async (error, image) => {
            for (let i = 0; i < 8; i++) {
                for (let j = 0; j < 8; j++) {
                    let piece = board[i][j];
                    for (let k = 0; k < 60; k++) {
                        for (let m = 0; m < 60; m++) {
                            let x = (m + (j * 60));
                            let y = (k + (i * 60));
                            let color, colorObject, broke;
                            if (piece != '') {
                                try {
                                    color = (await this[piece]).getPixelColor(m, k);
                                    colorObject = await Jimp.intToRGBA(color);
                                } catch(error) {
                                    broke = true;
                                }
                            }
                            if (piece != '' && !broke && colorObject != null && 'a' in colorObject && colorObject.a != 0) {
                                if (colorObject.a == 255) {
                                    await image.setPixelColor(color, x, y);
                                } else if ((i + j) % 2 == 1) {
                                    let background = await Jimp.intToRGBA(darkHex);
                                    let newR = (background.r * (1 - (colorObject.a / 255))) + (colorObject.r * (colorObject.a / 255));
                                    let newG = (background.g * (1 - (colorObject.a / 255))) + (colorObject.g * (colorObject.a / 255));
                                    let newB = (background.b * (1 - (colorObject.a / 255))) + (colorObject.b * (colorObject.a / 255));
                                    let newColor = await Jimp.rgbaToInt(newR, newG, newB, 255);
                                    await image.setPixelColor(newColor, x, y);
                                } else {
                                    let background = await Jimp.intToRGBA(lightHex);
                                    let newR = (background.r * (1 - (colorObject.a / 255))) + (colorObject.r * (colorObject.a / 255));
                                    let newG = (background.g * (1 - (colorObject.a / 255))) + (colorObject.g * (colorObject.a / 255));
                                    let newB = (background.b * (1 - (colorObject.a / 255))) + (colorObject.b * (colorObject.a / 255));
                                    let newColor = await Jimp.rgbaToInt(newR, newG, newB, 255);
                                    await image.setPixelColor(newColor, x, y);
                                }
                            } else if ((i + j) % 2 == 1) {
                                await image.setPixelColor(darkHex, x, y);
                            } else {
                                continue;
                            }
                        }
                    }
                
                }
            }
            await image.writeAsync(path);
        }));
        return path;
    }

    async createGif(options) {
        data = options.data;
        path = options.path;


    }

    fenToArray(fen) {
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

    pgnToArray(pgn) {
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
        return moves;
    }

    movesToBoard(moves) {
        let simpleMove = new RegExp('^[BNRQK][a-h][1-8]$');
        let simpleMovePawn = new RegExp('^[a-h][1-8]$');
        let castleKingSide = new RegExp('O-O');
        let castleQueenSide = new RegExp('O-O-O');
        let pawnCapture = new RegExp('^[a-h][a-h][1-8]$');
        let abiguousFile = new RegExp('^[BNRQK][a-h][a-h][1-8]$');
        let abiguousRank = new RegExp('^[BNRQK][1-8][a-h][1-8]$');
        let promotion = new RegExp('^[a-h][1-8][BNRQ]$');
        let promCapture = new RegExp('^[a-h][a-h][1-8][BNRQ]$');

        let board = [['r','n','b','q','k','b','n','r'], ['p','p','p','p','p','p','p','p'], ['','','','','','','',''], ['','','','','','','',''], ['','','','','','','',''], ['','','','','','','',''], ['P','P','P','P','P','P','P','P'], ['R','N','B','Q','K','B','N','R']];
        for (let i = 0; i < moves.length; i++) {
            for (let j = 0; j < 2; j++) {
                if (moves[i].length == j) break;
                let move = moves[i][j];
                move = move.split('x').join('');
                move = move.split('+').join('');
                if (move.match(simpleMove)) {
                    console.log("Simple Move:", move);
                } else if (move.match(simpleMovePawn)) {
                    console.log("Simple Move Pawn:", move);
                } else if (move.match(castleKingSide)) {
                    console.log("Castle King Side:", move);
                } else if (move.match(castleQueenSide)) {
                    console.log("Castle Queen Side:", move);
                } else if (move.match(pawnCapture)) {
                    console.log("Pawn Capture:", move);
                } else if (move.match(abiguousFile)) {
                    console.log("Abiguous File:", move);
                } else if (move.match(abiguousRank)) {
                    console.log("Abiguous Rank:", move);
                } else if (move.match(promotion)) {
                    console.log("Promotion:", move);
                } else if (move.match(promCapture)) {
                    console.log("Prom Capture:", move);
                } else {
                    console.log("INVALID", move);
                }
            }
        }    
    }
}

module.exports = BoardToImage;