// this object contains the functions which handle the data and its reading/writing
// feel free to extend and change to fit your needs

// (watch out: when you would like to use a property/function of an object from the
// object itself then you must use the 'this' keyword before. For example: 'this._data' below)
export let dataHandler = {
    _data: {}, // it is a "cache for all data received: boards, cards and statuses. It is not accessed from outside.
    _api_get: function (url, callback) {
        // it is not called from outside
        // loads data from API, parses it and calls the callback with it

        fetch(url, {
            method: 'GET',
            credentials: 'same-origin'
        })
        .then(response => response.json())  // parse the response as JSON
        .then(json_response => callback(json_response));  // Call the `callback` with the returned object
    },
    _api_post: function (url, data, callback) {
        // it is not called from outside
        // sends the data to the API, and calls callback function
        fetch(url, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                "content-type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(json_response => callback(json_response));
    },
    init: function () {
    },
    getBoards: function () {
        return new Promise ((resolve, reject) => {
            this._api_get('/get-boards', (response) => {
            this._data['boards'] = response;
            resolve(response)
            // callback(response);
        });
    })
    },

    getBoard: function (boardId, callback) {
        // the board is retrieved and then the callback function is called with the board
    },

    getDefaultStatuses: function () {
        return new Promise ((resolve, reject) => {
            this._api_get('/get-default-statuses', (response) => {
            resolve(response)
            // callback(response);
        });
    })
    },

    getCards: function () {
        return new Promise ((resolve, reject) => {
            this._api_get('/get-cards', (response) => {
            this._data['cards'] = response;
            resolve(response)
        });
    })
    },
    updateBoardTitle: function (data){
        return new Promise ((resolve, reject) => {
            this._api_post('/update-board-title', data,(response) => {
            resolve(response)
        });
    })
    },
    getCardTitle: function (data){
        return new Promise ((resolve, reject) => {
            this._api_post('/get-card-title', data,(response) => {
            resolve(response)
        });
    })
    },
    updateCardTitle: function (data){
        return new Promise ((resolve, reject) => {
            this._api_post('/update-card-title', data,(response) => {
            resolve(response)
        });
    })
    },

    updateCards: function (data){
        this._api_post('/update-cards', data, () => {
        });
    },
    removeCard: function (data){
        return new Promise ((resolve, reject) => {
            this._api_post('/remove-card', data,(response) => {
            resolve(response)
        });
    })
    },
    removeBoard: function (data){
        return new Promise ((resolve, reject) => {
            this._api_post('/remove-board', data,(response) => {
            resolve(response)
        });
    })
    },
    newStatus: function (data) {
        return new Promise ((resolve, reject) => {
            this._api_post('/new-status', data,(response) => {
            resolve(response)
        });
    })
    },

    getStatus: function (statusId, callback) {
        // the status is retrieved and then the callback function is called with the status
    },
    getCardsByBoardId: function (boardId, callback) {
        // the cards are retrieved and then the callback function is called with the cards
    },
    getCard: function (cardId, callback) {
        // the card is retrieved and then the callback function is called with the card
    },

    createNewPublicBoard: function (boardTitle) {
        // creates new board, saves it and calls the callback function with its data
        return new Promise ((resolve, reject) => {
            this._api_post('/create-board', boardTitle,(response) => {
            resolve(response)
            });
        })
    },

    createNewPrivateBoard: function (boardTitle) {
        // creates new board, saves it and calls the callback function with its data
        return new Promise ((resolve, reject) => {
            this._api_post('/create-private-board', boardTitle, (response) => {
            resolve(response)
            });
        })
    },

    createNewCard: function (boardId, title, statusId, cardOrder, callback) { // TODO
        // creates new card, saves it and calls the callback function with its data
        let data = {'boardId': boardId, 'title': title, 'statusId': statusId, 'cardOrder': cardOrder, 'archived': 'False'}
        return new Promise ((resolve, reject) => {
        this._api_post('/create-card', data,(response) => {
             resolve(response)
        });
        });
    },
    // here comes more features
    createNewUser: function (new_username, new_password){
        let data = {'new_username': new_username, 'new_password': new_password}
        return new Promise ((resolve, reject) => {
            this._api_post('/register', data,(response) => {
            resolve(response)
        });
    })
    },

    postLoginData: function (username, password) {
        let data = {'username': username, 'password': password}
        return new Promise ((resolve, reject) => {
            this._api_post('/login', data,(response) => {
            resolve(response)
        });
    })
    },
    getLoggedInUser: function () {
        return new Promise ((resolve, reject) => {
            this._api_get('/get-logged-in-user', (response) => {
            //this._data['username'] = response;
            resolve(response)
        });
    })
    },
};
