// It uses data_handler.js to visualize elements
import { dataHandler } from "./data_handler.js";

const io = window.io;
const socket = io();

export let dom = {
    // This function should run once, when the page is loaded.
    init: function () {
        dom.initNewBoardButtons();
        dom.initHeader();
        dom.initLoginForm();
        dom.initRegistrationForm();
        dom.initModalClose();
        dom.connectIo()
        dom.initSyncListener();
        dom.initSyncBTN();
    },
    connectIo: function (event){
            socket.on('connect', function() {
                socket.emit('status', {data: 'connected'});
            });

    },
    broadcastUpdate: function (event){
        console.log('sync request received broadcasting')
        socket.emit('sync_request', {data: 'sync'});
    },
    initSyncListener: function (event){
            socket.on('sync_event', function() {
                console.log('sync request received syncing')
                dom.loadBoards();
            });
    },
    initNewBoardButtons: function () {
        let addNewPublicBoardButton = document.querySelector("#add_public_board");
        addNewPublicBoardButton.addEventListener('click', dom.initNewBoardCreate);

        // TODO ide kell még egy feltétel, hogy ez a button csak akkor látszódjon, ha van belogolt user
        let addNewPrivateBoardButton = document.querySelector("#add_private_board");
        addNewPrivateBoardButton.addEventListener('click', dom.initNewBoardCreate);
    },

    initModalClose: function (){
        document.querySelector('.close').addEventListener('click', this.closeModal)
    },

    initAddNewColumnListeners: function (){
            let addNewColButtons = document.querySelectorAll('[data-button-functionality="column"]');
            for (let button of addNewColButtons){
                button.addEventListener('click', dom.addNewColumn)
            }
        },

    addNewColumn: function (evt){
        let boardID = evt.target.closest('section').dataset.boardId;
        dom.showModal();
        dom.createModal('column')
        let columnArea = evt.currentTarget.closest('section').querySelector(".board-columns");
        document.querySelector('#saveChanges').innerHTML = "Add column"
        document.querySelector('#saveChanges').onclick = function() {
            let customTitle = document.querySelector('#new_title');
            dataHandler.newStatus({"title": customTitle.value, "board_id": boardID})
                .then((response) =>
                    columnArea.insertAdjacentHTML(
                        'beforeend', `
                <div class="board-column">
                <div class="board-column-title">${response.title}<i class="column-delete fas fa-trash-alt"></i></div>
                <div id="status-id-${response.id}" class="board-column-content" data-status-id="${response.id}"></div>
                </div>`))
                .then(() => {
                    dom.checkColumnCount(boardID);
                    dom.loadBoards();
                })
            dom.closeModal()
            dom.broadcastUpdate()
        }
    },

    checkColumnCount: function (boardID){
        let section = document.querySelector(`[data-board-id="${boardID}"]`);
        let columnCount = section.querySelector('.board-columns').children.length;
        let addNewColBtn = section.querySelector('.board-add');
        if(columnCount >= 6 && !addNewColBtn.disabled){
            dom.disableAddNewColumnBtn(addNewColBtn)
        } else{
            dom.enableAddNewColumnBtn(addNewColBtn)
        }
        dom.initStatusDeleteBTN();
    },

    enableAddNewColumnBtn: function (addNewColBtn){
        addNewColBtn.disabled = false;
        addNewColBtn.style.filter = "none";
    },

    disableAddNewColumnBtn: function (addNewColBtn){
        addNewColBtn.disabled = true;
        addNewColBtn.style.filter = "saturate(0%)";
    },

    showCustomStatuses: function (customStatuses){
        let boardsContainer = document.querySelector('#boards');
        for (let child of boardsContainer.children) {
            let boardID = child.dataset.boardId;
            let columnContent = child.querySelector(".board-columns");
                for (let status of customStatuses) {
                    if(status['board_id'] === parseInt(boardID)){
                        columnContent.insertAdjacentHTML('beforeend', `
                        <div class="board-column">
                        <div class="board-column-title custom"><input value="${status['title']}" class="column-title-change hide-element">${status['title']}`+ (status['status_id'] > 3 ? '<i class="column-delete fas fa-trash-alt"></i>': "") + `</div>
                        <div id="status-id-${status['status_id']}" class="board-column-content" data-status-id="${status['status_id']}"></div>
                        </div>`)
                    }
                }
                dom.checkColumnCount(boardID)
        }

    },

    loadBoards: function () {

        // retrieves boards and makes showBoards called
        let promise1 = dataHandler.getBoards()
        let promise2 = dataHandler.getDefaultStatuses()
        let promise3 = dataHandler.getCards()
        let promise4 = dataHandler.getCustomStatuses()
        Promise.all([promise1, promise2, promise3, promise4]).then((data) => {
            document.querySelector('.fa-sync-alt').classList.add('synchronizing')
            let boards = data[0]
            let defaultStatuses = data[1]
            let cards = data[2]
            let customStatuses = data[3]
            let loggedInUser = data[4]
            dom.showBoards(boards);
            dom.showDefaultStatuses(defaultStatuses);
            dom.showCustomStatuses(customStatuses)
            dom.showCards(cards);
            dom.initHeader();
            dom.initCollapseBoard();
            dom.initBoardTitleListeners();
            dom.initCustomColumnTitleListeners();
            dom.initAddNewColumnListeners();
            dom.initCardEventListeners();
            dom.initDragAndDrop();
            dom.setupAddNewCardsBTN();
            dom.setArchiveListener();
            dom.initArchivedCardsButton();
            dom.initStatusDeleteBTN();
            setTimeout(function(){ document.querySelector('.fa-sync-alt').classList.remove('synchronizing') }, 1000);
        })

    },
    initSyncBTN: function () {
      let syncButton = document.querySelector('.fa-sync-alt');
      syncButton.style.cursor = 'pointer';
      syncButton.addEventListener('click', dom.syncAction);
    },
    syncAction: function(event){
        event.target.classList.add('synchronizing')
        dom.loadBoards()
        dom.broadcastUpdate()
    },
    initBoardTitleListeners: function (){
        let boardTitles = document.querySelectorAll('.board-title');
        for(let title of boardTitles){
            title.addEventListener('click', dom.showBoardTitleInput)
            let inputField = title.querySelector('input')
            inputField.addEventListener('keydown', dom.initBoardTitleChange)
            inputField.addEventListener('mouseleave', dom.closeInputBoard)
        }
    },
    initCustomColumnTitleListeners: function (){
        let columnTitles = document.querySelectorAll('.board-column-title.custom');
        for(let title of columnTitles){
            title.addEventListener('click', dom.showColumnTitleInput)
            let inputField = title.querySelector('input')
            inputField.addEventListener('keydown', dom.initColumnTitleChange)
            inputField.addEventListener('mouseleave', dom.closeInputColumn)
        }
    },
    showBoards: function (boards) {
        let boardsContainer = document.querySelector('#boards');
        boardsContainer.classList.remove('center-content');
        boardsContainer.innerHTML = '';
        boardsContainer.classList.add('board-container')
        for (let board of boards){
            let addPrivateClass
            if (board.user_id === null) {
                addPrivateClass = ""
            } else {
                addPrivateClass = "board-private"
            }
            boardsContainer.insertAdjacentHTML('beforeend', `
            <section id="board-id-${board['id']}" class="board ${addPrivateClass}" data-board-id="${board['id']}">
                <div class="board-header">
                    <span data-board-title="${board.title}" class="board-title">
                        <input value="${board.title}" class="board-title-change hide-element">${board['title']}</span>
                    <span class="flex-grow-max"></span>
                    <button data-button-functionality="delete-board" class="button-pure">
                        <i class="board-delete fas fa-trash-alt"></i>
                    </button>
                    <button data-button-functionality="card" class="card-add">Add Card</button>
                    <button data-button-functionality="column" class="board-add">Add Column</button>
                    <button class="board-toggle"><i class="fas fa-chevron-down"></i></button>
                </div>
                <div class="board-columns">Empty column</div>
            </section>
            ` );
            let section = document.querySelector(`#board-id-${board['id']}`);
            section.querySelector(".board-delete").addEventListener('click', dom.deleteBoard)
        }
    },

    closeModal: function (){
        document.querySelector('.bg-modal').style.display = "none";
    },
    showModal: function() {
        document.querySelector(".bg-modal").style.display = "block";
    },

    showDefaultStatuses: function (defaultStatuses) {
        let boardsContainer = document.querySelector('#boards');
        for (let child of boardsContainer.children) {
            let columnContent = child.querySelector(".board-columns")
            columnContent.innerHTML = ''
            for (let status of defaultStatuses) {
                columnContent.insertAdjacentHTML('beforeend', `
                <div class="board-column">
                <div class="board-column-title">${status['title']}</div>
                <div id="status-id-${status['id']}" class="board-column-content" data-status-id="${status['id']}"></div>
                    </div>`)
            }
        }
    },

    showCards: function (cards) {
       for (let card of cards) {
           let board = document.querySelector(`#board-id-${card.board_id}`)
           let column = board.querySelector(`#status-id-${card.status_id}`)
           column.insertAdjacentHTML('beforeend',
               `<div id="card-id-${card['id']}" data-card-id="${card.id}" class="card" draggable="true">
                    <div class="card-remove"><i class="card-delete fas fa-trash-alt"></i></div>
                    <div class="card-archive"><i class="fa fa-cloud"></i></div>
                    <div class="card-title">
                        <input value="${card.title}" class="card-title-change hide-element">${card.title}
                    </div>
                </>`)
       }
    },

    initCollapseBoard: () => {
        let toggleButtons = document.querySelectorAll(".board-toggle");
        for (let button of toggleButtons) {
            button.firstChild.classList.remove('fa-chevron-down') // set default to up button
            button.firstChild.classList.add('fa-chevron-up')      // set default to up button
            button.addEventListener('click', dom.handleToggleButtonClick)
        }
    },

    handleToggleButtonClick: (event) => {
        let boardColumn = event.currentTarget.parentElement.parentElement.querySelector('.board-columns');
        boardColumn.classList.toggle('hide-element');
        event.currentTarget.firstChild.classList.toggle('fa-chevron-down')
        event.currentTarget.firstChild.classList.toggle('fa-chevron-up')
        let addCol = event.currentTarget.closest('.board-header').querySelector('[data-button-functionality="column"]');
        addCol.classList.toggle('hide-element')
        let addCard = event.currentTarget.closest('.board-header').querySelector('[data-button-functionality="card"]');
        addCard.classList.toggle('hide-element')
        let delBoard = event.currentTarget.closest('.board-header').querySelector('[data-button-functionality="delete-board"]');
        delBoard.classList.toggle('hide-element')
    },

    initDragAndDrop: () => {
        const draggables = document.querySelectorAll(".card")
        const containers = document.querySelectorAll(".board-column-content")

        draggables.forEach(draggable => {
            draggable.addEventListener('dragstart', () => {
                draggable.classList.add('dragging');
            })
            draggable.addEventListener('dragend', () => {
                draggable.classList.remove('dragging');
                let cardID = draggable.getAttribute('id').match(/[0-9]+/)[0]
                let statusID =  draggable.parentNode.getAttribute('id').match(/[0-9]+/)[0]
                let boardID = draggable.closest('.board').getAttribute('id').match(/[0-9]+/)[0]
                let allCardsInStatus = dom.getAllCardsIDFromStatus(draggable)
                dataHandler.updateCards({'card_id': cardID, 'status_id': statusID, 'board_id': boardID, 'cards_order': allCardsInStatus})
                dom.broadcastUpdate()
            })
        })
        containers.forEach(container => {
            container.addEventListener('dragover', (event) => {
            event.preventDefault();
                const afterElement = dom.getDragAfterElement(container, event.clientY);
                const draggable = document.querySelector('.dragging');
                if (afterElement === undefined) {
                    let below = true;
                    dom.insertElement(draggable, container, below, afterElement);
                }
                else {
                    let below = false;
                    dom.insertElement(draggable, container, below, afterElement);
                }
            })
       })
    },

    initCardEventListeners: function(){
        let cards = document.querySelectorAll('.card');
        let cardDeleteButtons = document.querySelectorAll('.card-delete.fa-trash-alt');
        let inputFields = document.querySelectorAll('.card-title-change');
        for(let card of cards){
            card.addEventListener('click', dom.showCardTitleInput);
            card.addEventListener('mouseleave', dom.closeInput);
        }
        for(let field of inputFields){
            field.addEventListener('keydown', dom.initCardTitleChange);
        }
        for(let cardDeleteButton of cardDeleteButtons){
            cardDeleteButton.addEventListener('click', dom.deleteCard);
        }
    },
    closeInputBoard: function (evt){
        let inputField = evt.target;
        let boardID = inputField.closest('section').dataset.boardId;
        if(!inputField.classList.contains('hide-element')){
            inputField.classList.add('hide-element');
            dataHandler.getBoard({'board_id': boardID})
                .then((response) => inputField.after(response['title']))
        }
    },
    closeInputColumn: function (evt){
        let inputField = evt.target.closest('input');
        let columnID = inputField.parentElement.parentElement.querySelector('.board-column-content').dataset.statusId;
        let trashCan = inputField.parentElement.querySelector('.column-delete.fa-trash-alt')
        trashCan.classList.remove('hide-element');
        if(!inputField.classList.contains('hide-element')){
            inputField.closest('.board-column-title').childNodes[1].textContent = '';
            inputField.classList.add('hide-element');
            dataHandler.getColumnTitle({'column_id': columnID})
                .then((response) => inputField.after(response['title']))
        }
    },
    closeInput: function (evt){
        let inputField = evt.target.querySelector('input');
        let cardID = inputField.closest('.card').dataset.cardId;
        if(!inputField.classList.contains('hide-element')){
            inputField.closest('.card-title').childNodes[2].textContent = '';
            inputField.classList.add('hide-element');
            dataHandler.getCardTitle({'card_id': cardID})
                .then((response) => inputField.after(response['title']))
        }
    },
    deleteBoard: function(event){
        let board = event.target.closest("section");
        let boardId = board.dataset.boardId;
        dataHandler.removeBoard(boardId)
            .then(() => {
                board.remove()
                dom.broadcastUpdate()
            })
    },
    deleteCard: function(event){
        let card = event.target.parentElement.parentElement
        let cardId = card.dataset.cardId;
        dataHandler.removeCard(cardId)
            .then(() => {
                card.remove()
                dom.broadcastUpdate()
            })
    },

    showBoardTitleInput: function (evt){
        let board = evt.target.closest('section');
        let inputField = board.querySelector('input')
        if(inputField.classList.contains('hide-element')){
            let title = inputField.closest('.board-title');
            let boardNameNode = title.childNodes[2];
            title.removeChild(boardNameNode);
            title.childNodes[1].classList.remove('hide-element');
            title.childNodes[1].classList.add('display-flex-element');
        }
    },
    showColumnTitleInput: function (evt){
        let board = evt.target.closest('.board-column-title');
        let inputField = board.querySelector('input')
        if(inputField.classList.contains('hide-element')){
            let title = inputField.closest('.board-column-title');
            let trashCan = inputField.parentElement.querySelector('.column-delete.fa-trash-alt')
            trashCan.classList.add('hide-element');
            let boardNameNode = title.childNodes[1];
            title.removeChild(boardNameNode);
            title.childNodes[0].classList.remove('hide-element');
            title.childNodes[0].classList.add('display-flex-element');
        }
    },

    initStatusDeleteBTN: function (){
        let statusDeleteButtons = document.querySelectorAll('.column-delete.fa-trash-alt');
        for(let statusDeleteButton of statusDeleteButtons){
            statusDeleteButton.addEventListener('click', dom.deleteStatus)
        }
    },
    deleteStatus: function(event){
        let cards = event.target.parentElement.parentElement.querySelector('.board-column-content')
        for (let card of cards.childNodes){
            let cardId = card.dataset.cardId
            dataHandler.removeCard(cardId)
                .then(() => {
                    card.remove()
                    dom.broadcastUpdate()
                }
                )
        }
        dataHandler.removeStatus(cards.dataset.statusId)
            .then(() => event.target.closest('.board-column').remove())
        dom.checkColumnCount(event.target.closest("section").dataset.boardId)
    },
    showCardTitleInput: function (evt){
        let titleDiv = evt.currentTarget.querySelector('.card-title');
        titleDiv.childNodes[2].textContent = '';
        titleDiv.childNodes[1].classList.remove('hide-element');
        titleDiv.childNodes[1].classList.add('display-flex-element');
    },

    discardTitleChange: function (target){
        let cardID = target.closest('.card').dataset.cardId;
        target.closest('.card-title').childNodes[2].textContent = '';
        target.classList.remove('display-flex-element');
        target.classList.add('hide-element');
            dataHandler.getCardTitle({'card_id': cardID})
                .then((response) => target.after(response['title']))
    },

    discardColumnTitleChange: function (target){
        let columnID = target.parentElement.parentElement.querySelector('.board-column-content').dataset.statusId;
        target.classList.remove('display-flex-element');
        target.classList.add('hide-element');
            dataHandler.getColumnTitle({'column_id': columnID})
                .then((response) => target.after(response['title']))
    },

    insertElement: (draggable, container, below, afterElement) => {
            if (below) {
                container.appendChild(draggable);
            } else {
                container.insertBefore(draggable, afterElement)
            }
    },

    getDragAfterElement: (container, y) => {
    const draggableElements = [...container.querySelectorAll('.card:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return {offset: offset, element: child};
        }
        else {
            return closest;
        }
    }, {offset: Number.NEGATIVE_INFINITY}).element;
    },

    getAllCardsIDFromStatus: (draggable) => {
        let allCardsInStatus = [...draggable.parentNode.children]
        return allCardsInStatus.map((item) => {
            return item.getAttribute('id').match(/[0-9]+/)[0]
        })
    },

    saveBoardTitleChange: function (evt, titleInput){
        let newTitle = evt.currentTarget.value;
        let boardID = titleInput.closest('section').dataset.boardId;
        let titleDiv = titleInput.closest('.board-title');
        dataHandler.updateBoardTitle({"board_name": newTitle, "id": boardID})
            .then(() => titleInput.value = newTitle)
            .then(() => titleInput.after(newTitle))
            .then(() => titleInput.classList.add('hide-element'))
            .then(() => titleInput.classList.remove('display-flex-element'))
            .then(() => dom.broadcastUpdate)
    },

    saveColumnTitleChange: function (evt, titleInput){
        let newTitle = evt.currentTarget.value;
        let columnID = evt.currentTarget.parentElement.parentElement.querySelector('.board-column-content').dataset.statusId;
        dataHandler.updateColumnTitle({"column_name": newTitle, "id": columnID})
            .then(() => titleInput.value = newTitle)
            .then(() => titleInput.after(newTitle))
            .then(() => titleInput.classList.add('hide-element'))
            .then(() => titleInput.classList.remove('display-flex-element'))
            .then(() => dom.broadcastUpdate)
    },

    saveTitleChange: function (evt, titleInput) {
        let newTitle = evt.currentTarget.value;
        let cardID = titleInput.closest("[data-card-id]").dataset.cardId;
        titleInput.value = newTitle;
        titleInput.after(newTitle) // put the new title after the hidden input field
        dataHandler.updateCardTitle({'new_title': newTitle, 'card_id': cardID})
            .then(() => titleInput.classList.add('hide-element'))
            .then(() => titleInput.classList.remove('display-flex-element'))
            .then(() => dom.broadcastUpdate)
    },

    initBoardTitleChange: function(evt){
        let titleInput = evt.currentTarget;
        if(evt.key === 'Enter'){
            dom.saveBoardTitleChange(evt, titleInput);
            dom.broadcastUpdate()
        } else if(evt.key === 'Escape'){
            dom.discardTitleChange(titleInput)
        }
    },
    initColumnTitleChange: function(evt){
        let titleInput = evt.currentTarget;
        if(evt.key === 'Enter'){
            dom.saveColumnTitleChange(evt, titleInput);
            dom.broadcastUpdate()
        } else if(evt.key === 'Escape'){
            dom.discardColumnTitleChange(titleInput)
        }
    },

    initCardTitleChange: function (evt){
        let titleInput = evt.currentTarget;
        if(evt.key === 'Enter'){
            dom.saveTitleChange(evt, titleInput);
            dom.broadcastUpdate()
        } else if(evt.key === 'Escape'){
            dom.discardTitleChange(titleInput)
        }
    },

    // Main function for setting up, creating, saving new board
     initNewBoardCreate: function(event){
        dom.showModal()
        dom.createModal("Board")
        document.querySelector('#saveChanges').innerHTML = "Add board"
        document.querySelector('#saveChanges').onclick = function() {
            let customTitle = document.querySelector('#new_title')
            if (event.target.id === "add_public_board") {
                dataHandler.createNewPublicBoard(customTitle.value)
                .then(dom.loadBoards);
            }
            else if (event.target.id === "add_private_board") {
                dataHandler.createNewPrivateBoard(customTitle.value)
                .then(dom.loadBoards);
            }
            dom.closeModal()
            dom.broadcastUpdate()
            }
        },

        // Creates modal element
         createModal: function(title){
            let modalContent = document.querySelector('.modal-content')
            modalContent.innerHTML = '';
            modalContent.insertAdjacentHTML('beforeend', `
                  <h2>Create new ${title}</h2>
                  <input id="new_title" class="modalInput">
            `);
        },


        setupAddNewCardsBTN: function(){
            let addCardButtons = document.getElementsByClassName("card-add");
            for (let addCardButton of addCardButtons) {
                addCardButton.addEventListener('click', dom.createNewCard)
                }
        },
         createNewCard: function(evt) {
            let cardContainers = evt.currentTarget.parentElement
            let cardContainer = cardContainers.nextSibling.nextSibling;
            let boardId = evt.currentTarget.parentElement.parentElement.dataset.boardId
            let lastCard = cardContainer.querySelectorAll(".board-column-content .card");
            let cardOrder = lastCard.length+1;
            let statusId =  0;
            dom.showModal()
            dom.createModal("Card")
            document.querySelector('#saveChanges').innerHTML = "Add card"
            document.querySelector('#saveChanges').onclick = function() {
            let customTitle = document.querySelector('#new_title')
                dom.addNewCardToBoard(customTitle.value, cardContainers);
                dom.closeModal()
                dataHandler.createNewCard(boardId, customTitle.value, statusId, cardOrder)
                    .then(dom.loadBoards)
                    .then(dom.broadcastUpdate)

            }
         },
         addNewCardToBoard: function(customTitle, cardContainers) {
            let cardContainer = cardContainers.nextSibling.nextSibling;
            let lastCard = cardContainer.querySelector(".board-column-content");
            lastCard.insertAdjacentHTML("beforeend", `
                            <div class="card">
                            <div class="card-remove"><i class="fas fa-trash-alt"></i></div>
                            <div class="card-title">${customTitle}</div>
                            </div>`);
        },

        initRegistrationForm: function() {
            document.getElementById("sign-up").addEventListener('click', dom.showRegistrationForm)
        },

        initLoginForm: function() {
            document.getElementById("login").addEventListener('click', dom.showLoginForm)
        },

        createRegistrationModal: function(){
            let modalContent = document.querySelector('.modal-content')
            modalContent.innerHTML = '';
            modalContent.insertAdjacentHTML('beforeend', `
                  <h2>Sign Up</h2>
                  <br>
                  <label for="new_username">Username:</label>
                  <input id="new_username" class="modalInput"><br><br>
                  <label for="new_password">Password:</label>
                  <input id="new_password" class="modalInput" type="password">
            `);
        },

        showRegistrationForm: function() {
            dom.showModal()
            dom.createRegistrationModal()
            dom.initRegistrationDataSubmit()
        },

        initRegistrationDataSubmit: function() {
            document.querySelector('#saveChanges').innerHTML = "Submit"
            document.querySelector('#saveChanges').onclick = function() {
                dom.postDataFromRegistrationForm();
            }
        },

        postDataFromRegistrationForm: function() {
            let new_username = document.getElementById("new_username").value
            let new_password = document.getElementById("new_password").value
            if (new_username.length > 0 && new_password.length > 0) {
                dom.closeModal()
                dataHandler.createNewUser(new_username, new_password).then(dom.loadBoards)
            }
        },

        showLoginForm: function() {
            dom.showModal()
            dom.createLoginModal()
            dom.initLoginDataSubmit()
        },

        createLoginModal: function(){
            let modalContent = document.querySelector('.modal-content')
            modalContent.innerHTML = '';
            modalContent.insertAdjacentHTML('beforeend', `
                  <h2>Welcome Back</h2>
                  <br>
                  <label for="username">Username:</label>
                  <input id="username" class="modalInput"><br><br>
                  <label for="password">Password:</label>
                  <input type="password" id="password" class="modalInput">
            `);
        },

        initLoginDataSubmit: function() {
            document.querySelector('#saveChanges').innerHTML = "Login"
            document.querySelector('#saveChanges').onclick = function() {
                dom.postDataFromLoginForm();
            }
        },

        postDataFromLoginForm: function() {
            let username = document.getElementById("username").value
            let password = document.getElementById("password").value
            if (username.length > 0 && password.length > 0) {
                dom.closeModal()
                dataHandler.postLoginData(username, password).then(dom.loadBoards)
            }
        },

        initHeader: function() {
            dataHandler.getLoggedInUser().then(function(data) {

                if (data.username === "") {
                    document.getElementById("login").classList.remove('hide-element');
                    document.getElementById("sign-up").classList.remove('hide-element');
                    document.getElementById("logout").classList.add('hide-element');
                    document.getElementById("user-display").classList.add('hide-element');
                    document.getElementById("add_private_board").classList.add('hide-element');
                } else {
                    document.getElementById("login").classList.add('hide-element');
                    document.getElementById("sign-up").classList.add('hide-element');
                    document.getElementById("logout").classList.remove('hide-element');
                    document.getElementById("user-display").classList.remove('hide-element');
                    document.getElementById("add_private_board").classList.remove('hide-element');
                    document.getElementById("user-display").innerHTML = data.username
                }
            })
        },

        setArchiveListener: () => {
            let archiveButtons = document.querySelectorAll(".card-archive")
            archiveButtons.forEach((item) => {
                item.addEventListener('click', () => {
                    let card = item.closest(".card")
                    let cardID = card.getAttribute('id').match(/[0-9]+/)[0]
                    dataHandler.archiveCard({'card_id': cardID })
                    card.remove();
                })
            })
        },

        initArchivedCardsButton: () => {
            let archivedCardsButton = document.querySelector("#archived_cards");
            archivedCardsButton.addEventListener('click', dom.showArchivedMessages);
        },

        showArchivedMessages: () => {
            dom.showModal()
            dom.createArchivedCardsModal()
            document.querySelector('#saveChanges').innerHTML = "Save changes"
            document.querySelector('#saveChanges').onclick = function() {
                dom.closeModal()
            }
            document.querySelector('#close').onclick = function() {
                dom.closeModal()
            }
        },

        createArchivedCardsModal: function(){
            let modalContent = document.querySelector('.modal-content')
            modalContent.innerHTML = '<h2>Archived cards</h2>';
            dataHandler.getArchivedCards()
                .then((cards) => {
                    for (let card of cards) {
                        modalContent.insertAdjacentHTML('beforeend', `
                       <div id="card-id-${card['id']}" data-card-id="${card.id}" class="card">
                        <div class="card-remove"><i class="fas fa-trash-alt"></i></div>
                        <div class="card-restore"><i class="fa fa-history"></i></div>
                        <div class="card-title">${card.title}</div>
                        </div>`)
                    }
                    let restoreCardButtons = document.querySelectorAll(".card-restore")
                    restoreCardButtons.forEach((item) => {
                        item.addEventListener('click', () => {
                        let card = item.closest(".card")
                        let cardID = card.getAttribute('id').match(/[0-9]+/)[0]
                        dataHandler.restoreCard({'card_id': cardID })
                            .then((data) => {
                               let cardData = data[0]
                               let board = document.querySelector(`#board-id-${cardData.board_id}`)
                               let column = board.querySelector(`#status-id-${cardData.status_id}`)
                               column.insertAdjacentHTML('beforeend',
                           `<div id="card-id-${card['id']}" data-card-id="${cardData.id}" class="card" draggable="true">
                                <div class="card-remove"><i class="card-delete fas fa-trash-alt"></i></div>
                                <div class="card-archive"><i class="fa fa-cloud"></i></div>
                                <div class="card-title">
                                    <input value="${cardData.title}" class="card-title-change hide-element">${cardData.title}
                                </div>
                            </>`)
                            dom.initCardEventListeners();
                               dom.initDragAndDrop();
                               dom.setArchiveListener();
                            card.remove();})
                                                })
                    })
                    let cardDeleteButtons = document.querySelectorAll('.card-remove');
                    for(let cardDeleteButton of cardDeleteButtons){
                                cardDeleteButton.addEventListener('click', dom.deleteCard);
                    }
                })
        },
};

