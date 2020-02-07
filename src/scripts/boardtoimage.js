// Dependencies
let Jimp = require('jimp');

class BoardToImage {
    // @param options {
    //     type: 'pgn' | 'array' | 'fen',
    //     board: String | Array | String,
    //     path: String,
    //}
    constructor() {
        this.darkHex = Jimp.rgbaToInt(181, 136, 99, 255);
        this.lightHex = Jimp.rgbaToInt(240, 217, 181, 255);
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
        this.p = Jimp.read('./resources/chesspieces/Chess_klt60.png');
        this.k = Jimp.read('./resources/chesspieces/Chess_kdt60.png');
    }

    async createImage(options) {
        let type, board, path;
        type = options.type;
        board = options.board;
        path = options.path;
        let image = new Jimp(720, 720, this.lightHex, (error, image) => {});
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if ((i + j) % 2 == 1) {
                    for (let k = 0; k < 90; k++) {
                        for (let m = 0; m < 90; m++) {
                            await image.setPixelColor(this.darkHex, (m + (j * 90)), (k + (i * 90)));
                        }
                    }
                }
            }
        }
        console.log("DOING");
        await image.write(path);
        console.log("DONE");
        return path;
    }
}

module.exports = BoardToImage;