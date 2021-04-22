// It uses data_handler.js to visualize elements
import { dataHandler } from "./data_handler.js";

export let dom = {
    focusTarget: '',
    // This function should run once, when the page is loaded.
    init: function () {
        dom.initNewBoardButtons();
        dataHandler.getLoggedInUser().then(r => console.log(r.username));
        dom.initLoginForm();
        dom.initRegistrationForm();
        dom.initInputClose();
        dom.initModalClose();
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

    initInputClose: function (){
        window.addEventListener('click', this.closeInputFields);
    },

    setDefaultFocusTarget: function (){
        dom.focusTarget = document.querySelector('.card');
    },

    closeInputFields: function (evt){
        let inputField = dom.focusTarget.querySelector('input');
        if(!inputField.classList.contains('hide-element')){
            let isTargetArea = evt.composedPath().includes(dom.focusTarget);
            let cardID = dom.focusTarget.dataset.cardId;
            if (!isTargetArea){
                inputField.closest('.card-title').childNodes[2].textContent = '';
                inputField.classList.remove('display-flex-element');
                inputField.classList.add('hide-element');
                dataHandler.getCardTitle({'card_id': cardID})
                    .then((response) => inputField.after(response['title']))
            }
        }
    },
    initAddNewColumnListeners: function (){
            let addNewColButtons = document.querySelectorAll('[data-button-functionality="column"]');
            for (let button of addNewColButtons){
                button.addEventListener('click', dom.addNewColumn)
            }
        },

    addNewColumn: function (evt){
        evt.stopImmediatePropagation();
        evt.preventDefault();
        dom.showModal();
        dom.createModal('column')
        let columnArea = evt.currentTarget.closest('section').querySelector(".board-columns");
        document.querySelector('#saveChanges').onclick = function() {
            let customTitle = document.querySelector('#new_title');
            dataHandler.newStatus({"title": customTitle.value})
                .then((response) =>
                    columnArea.insertAdjacentHTML(
                        'beforeend', `
                <div class="board-column">
                <div class="board-column-title">${response.title}</div>
                <div id="status-id-${response.id}" class="board-column-content" data-status-id="${response.id}"></div>
                </div>`))
            dom.closeModal()
        }
    },

    loadBoards: function () {
        // retrieves boards and makes showBoards called
        let promise1 = dataHandler.getBoards()
        let promise2 = dataHandler.getDefaultStatuses()
        let promise3 = dataHandler.getCards()
        Promise.all([promise1, promise2, promise3]).then((data) => {
            let boards = data[0]
            let defaultStatuses = data[1]
            let cards = data[2]
            dom.showBoards(boards);
            dom.showDefaultStatuses(defaultStatuses);
            dom.showCards(cards);
            dom.setDefaultFocusTarget();
            dom.initCollapseBoard();
            dom.initAddNewColumnListeners()
            dom.initCardEventListeners();
            dom.initDragAndDrop();
            dom.setupAddNewCardsBTN()
        })

    },

    showBoards: function (boards) {
        let boardsContainer = document.querySelector('#boards');
        boardsContainer.innerHTML = ''
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
                    <span data-board-title="${board.title}" class="board-title">${board['title']}</span>
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
            section.querySelector(`[data-board-title="${board.title}"]`).addEventListener('click', this.changeBoardName)
            section.querySelector(".board-delete").addEventListener('click', dom.deleteBoard)
        }
    },
    changeBoardName: function (evt){
        dom.modalBoardNameChange(evt)

    },
    closeModal: function (){
        document.querySelector('.bg-modal').style.display = "none";
    },
    showModal: function() {
        document.querySelector(".bg-modal").style.display = "block";
    },
    saveBoardNameChange: function (evt){
        let newBoardName = document.querySelector('.modalInput').value;
        let boardID = document.querySelector('.modalInput').id;
        dataHandler.updateBoardTitle({"board_name": newBoardName, "id": boardID})
            .then(() => document.querySelector(
                `#board-id-${boardID} span`).innerHTML = newBoardName)
            .then(() => document.querySelector('.bg-modal').style.display = 'none')
    },

    modalBoardNameChange: function (evt){
        document.querySelector('.modal-content').innerHTML = '';
        let parentSection = evt.target.parentNode.parentNode;
        let boardID = parentSection.getAttribute('data-board-id');
        let boardName = evt.target.dataset.boardTitle;
        document.querySelector('.bg-modal').style.display = "block";
        document.querySelector('.modal-content').insertAdjacentHTML(
            'beforeend',
            `<h2>Change board name</h2>
                  <input id="${boardID}" class="modalInput" value="${boardName}">`)
        document.querySelector('#saveChanges').addEventListener('click', this.saveBoardNameChange)

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
                    <div class="card-title">
                        <input value="${card.title}" class="card-title-change hide-element">${card.title}
                    </div>
                </div>`)
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
            card.addEventListener('click', dom.showCardTitleInput)
        }
        for(let field of inputFields){
            field.addEventListener('keydown', dom.initTitleChange)
        }
        for(let cardDeleteButton of cardDeleteButtons){
            cardDeleteButton.addEventListener('click', dom.deleteCard)
        }
    },
    deleteBoard: function(event){
        let board = event.target.closest("section");
        let boardId = board.dataset.boardId;
        dataHandler.removeBoard(boardId)
            .then(() => board.remove())
    },
    deleteCard: function(event){
        let card = event.target.parentElement.parentElement
        let cardId = card.dataset.cardId;
        dataHandler.removeCard(cardId)
            .then(() => card.remove())
    },
    showCardTitleInput: function (evt){
        let titleDiv = evt.currentTarget.querySelector('.card-title');
        titleDiv.childNodes[2].textContent = '';
        titleDiv.childNodes[1].classList.remove('hide-element');
        titleDiv.childNodes[1].classList.add('display-flex-element');
        dom.focusTarget = titleDiv.closest('.card');
    },

    discardTitleChange: function (target){
        let cardID = dom.focusTarget.dataset.cardId;
        target.closest('.card-title').childNodes[2].textContent = '';
        target.classList.remove('display-flex-element');
        target.classList.add('hide-element');
            dataHandler.getCardTitle({'card_id': cardID})
                .then((response) => target.after(response['title']))
    },

    insertElement: (draggable, container, below, afterElement) => {
            if (below) {
                container.appendChild(draggable);
            }
            else {
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
    saveTitleChange: function (evt, titleInput) {
        let newTitle = evt.currentTarget.value;
        let cardID = titleInput.closest("[data-card-id]").dataset.cardId;
        titleInput.value = newTitle;
        titleInput.after(newTitle) // put the new title after the hidden input field
        dataHandler.updateCardTitle({'new_title': newTitle, 'card_id': cardID})
            .then(() => titleInput.classList.add('hide-element'))
            .then(() => titleInput.classList.remove('display-flex-element'))
    },

    initTitleChange: function (evt){
        let titleInput = evt.currentTarget;
        if(evt.key === 'Enter'){
            dom.saveTitleChange(evt, titleInput);
        } else if(evt.key === 'Escape'){
            dom.discardTitleChange(titleInput)
        }
    },

    // Main function for setting up, creating, saving new board
     initNewBoardCreate: function(event){
        dom.showModal()
        dom.createModal("Board")
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

        // Creates new public board with title adds after last board
         createNewPublicBoard: function(customTitle) {
            let boards = document.querySelectorAll('section');
            let lastBoard = document.querySelector('section:last-child');
            lastBoard.insertAdjacentHTML('afterend', `
                        <section id="board-id-${boards.length + 1}" class="board" data-board-id="${boards.length + 1}">
                            <div class="board-header"><span class="board-title">${customTitle}</span>
                                <button class="card-add">Add Card</button>
                                <button class="board-toggle"><i class="fas fa-chevron-down"></i></button>
                            </div>
                            <div class="board-columns"></div>
                        </section>
                    `);
        },

        // Creates new private board with title adds after last board
         createNewPrivateBoard: function(customTitle) {
            let boards = document.querySelectorAll('section');
            let lastBoard = document.querySelector('section:last-child');
            lastBoard.insertAdjacentHTML('afterend', `
                        <section id="board-id-${boards.length + 1}" class="board private-board" data-board-id="${boards.length + 1}">
                            <div class="board-header"><span class="board-title">${customTitle}</span>
                                <button class="card-add">Add Card</button>
                                <button class="board-toggle"><i class="fas fa-chevron-down"></i></button>
                            </div>
                            <div class="board-columns"></div>
                        </section>
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
            document.querySelector('#saveChanges').onclick = function() {
            let customTitle = document.querySelector('#new_title')
                dom.addNewCardToBoard(customTitle.value, cardContainers);
                dom.closeModal()
                dataHandler.createNewCard(boardId, customTitle.value, statusId, cardOrder).then(dom.loadBoards)
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
                  <input id="new_password" class="modalInput">
            `);
        },

        showRegistrationForm: function() {
            dom.showModal()
            dom.createRegistrationModal()
            dom.initRegistrationDataSubmit()
        },

        initRegistrationDataSubmit: function() {
            document.querySelector('#saveChanges').onclick = function() {
                dom.postDataFromRegistrationForm();
            }
        },

        postDataFromRegistrationForm: function() {
            let new_username = document.getElementById("new_username").value
            let new_password = document.getElementById("new_password").value
            dom.closeModal()
            dataHandler.createNewUser(new_username, new_password).then(dom.loadBoards)
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
                  <input id="password" class="modalInput">
            `);
        },

        initLoginDataSubmit: function() {
            document.querySelector('#saveChanges').onclick = function() {
                dom.postDataFromLoginForm();
            }
        },

        postDataFromLoginForm: function() {
            let username = document.getElementById("username").value
            let password = document.getElementById("password").value
            dom.closeModal()
            dataHandler.postLoginData(username, password).then(dom.loadBoards)
        },

        initHeader: function() {
            dataHandler.getLoggedInUser().then(data => {

            });
        }
};

