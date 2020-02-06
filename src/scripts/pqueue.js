// Chess.com API rate limits if you have more than 1 request at the same time.
// Since some requests (Start a Game) are more of a priority than others (Check status of tracked game)
// A priority queue allows us to run through requests one after another and prioritize others.

// Elements should have all relevant information to their request.
class QueuedRequest {
    constructor(request, priority) {
        this._request = request;
        this._priority = priority;
    }

    getRequest() {
        return this._request;
    }

    getPriority() {
        return this.priority;
    }
}

class PriorityQueue {
    constructor() {
        this._requests = [];
    }

    enqueue(r, priority) {
        let request = new QueuedRequest(r, priority);
        let contain = false;

        for (let i = 0; i < this._requests.length; i++) {
            if (this._requests[i].getPriority() > request.getPriority()) {
                this._requests.splice(i, 0, request);
                contain = true;
                break;
            }
        }

        if (!contain) {
            this._requests.push(request);
        }
    }

    async dequeue() {
        if (this.isEmpty())
            return null;
        return (await this._requests.shift()).getRequest();
    }

    async front() {
        if (this.isEmpty())
            return null;
        return (await this._requests[0]).getRequest();
    }

    isEmpty() {
        return this._requests.length == 0;
    }
}

module.exports = {
    element: QueuedRequest,
    queue: PriorityQueue,
};