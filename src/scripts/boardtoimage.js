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
                                    console.log(color);
                                    await image.setPixelColor(color, x, y);
                                } else if ((i + j) % 2 == 1) {
                                    let background = await Jimp.intToRGBA(darkHex);
                                    let newR = (background.r * (1 - (colorObject.a / 255))) + (colorObject.r * (colorObject.a / 255));
                                    let newG = (background.g * (1 - (colorObject.a / 255))) + (colorObject.g * (colorObject.a / 255));
                                    let newB = (background.b * (1 - (colorObject.a / 255))) + (colorObject.b * (colorObject.a / 255));
                                    let newColor = await Jimp.rgbaToInt(newR, newG, newB, 255);
                                    console.log(newColor);
                                    await image.setPixelColor(newColor, x, y);
                                } else {
                                    let background = await Jimp.intToRGBA(lightHex);
                                    let newR = (background.r * (1 - (colorObject.a / 255))) + (colorObject.r * (colorObject.a / 255));
                                    let newG = (background.g * (1 - (colorObject.a / 255))) + (colorObject.g * (colorObject.a / 255));
                                    let newB = (background.b * (1 - (colorObject.a / 255))) + (colorObject.b * (colorObject.a / 255));
                                    let newColor = await Jimp.rgbaToInt(newR, newG, newB, 255);
                                    console.log(newColor);
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
            await image.write(path);
        }));
        return path;
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
}

module.exports = BoardToImage;