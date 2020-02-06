// Chess.com API rate limits if you have more than 1 request at the same time.
// Since some requests (Start a Game) are more of a priority than others (Check status of tracked game)
// A priority queue allows us to run through requests one after another and prioritize others.

// Dependencies
var axios = require('axios');

// Queue Class
var pqueue = require('./pqueue.js');
let QueuedRequest = pqueue.element;
let PriorityQueue = pqueue.queue;

// Request Types
// Get Daily Chess
// Get To-Move Daily Chess
// List of Monthly Archives

class ChessAPI {
    constructor(bot) {
        // Queue for requests
        this._queue = new PriorityQueue();
        // Axios instance for Chess.com
        this._chessAPI = axios.create({
            baseURL: 'https://api.chess.com',
        });
        // Instance of bot to return values.
        this._bot = bot;
        // Turns off and on.
        this._running = false;
    }

    // Should the engine be off, we can turn it back on
    async startRequests() {
        try {
            // While more requests are in line.
            while (!this._queue.isEmpty()) {
                if (!this._running) this._running = true;
                // Runs the Requests
                let response = await this.runRequest();
                // Runs the appropriate function back on bot given the type.
                switch (response.req.type) {
                    case 0:
                        this._bot.gameCommandPost(response);
                        break;
                    case 1: 
                        this._bot.updatesGame(response);
                    default:
                        break;
                }
            }
            // Turns off.
            this._running = false;
        } catch(error) {
            console.log(error);
        }
    }

    async runRequest() {
        // Gets a request from line.
        let request = await this._queue.dequeue();
        // API endpoint based on type of request
        // lets the engine handle multiple types of requests.
        let url;
        switch (request.type) {
            case 0:
                url = "/pub/player/" + request.player1 + "/games";
                break;
            case 1: 
                url = "/pub/player/" + request.player1 + "/games/" + request.year + "/" + request.month;
            default:
                break;
        }
        try {
            let response = await this._chessAPI.get(url);
            let final = {
                req: request,
                data: response.data,
            }
            return final;
        } catch(error) {
            console.log(error);
            return {
                req: request,
                data: null,
            };
        }
    }

    async addRequest(r) {
        let priority = 0;
        if (r.type == 1) priority = 1;
        await this._queue.enqueue(r, priority);
        if (!this._running) this.startRequests();
    }
}

module.exports = ChessAPI;