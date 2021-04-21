// It uses data_handler.js to visualize elements
import { dataHandler } from "./data_handler.js";

export let dom = {
    focusTarget: '',

    init: function () {
        dom.initInputClose()
        dom.initModalClose()
    },
    initModalClose: function (){
        document.querySelector('.close').addEventListener('click', this.closeModal)
    },
    initInputClose: function (){
        document.addEventListener('click', this.closeInputFields);
    },
    setDefaultFocusTarget: function (){
        dom.focusTarget = document.querySelector('.card');
    },
    closeInputFields: function (evt){
        let inputField = dom.focusTarget.querySelector('input');
        let isTargetArea = evt.composedPath().includes(dom.focusTarget);
        let cardID = dom.focusTarget.dataset.cardId;
        if (!isTargetArea){
            inputField.closest('.card-title').childNodes[2].textContent = '';
            inputField.classList.remove('display-flex-element');
            inputField.classList.add('hide-element');
            dataHandler.getCardTitle({'card_id': cardID})
                .then((response) => inputField.after(response['title']))
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
            dom.setDefaultFocusTarget()
            dom.initCollapseBoard()
            this.initCardEventListeners()
        })

    },

    showBoards: function (boards) {
        let boardsContainer = document.querySelector('#boards');
        boardsContainer.innerHTML = ''
        boardsContainer.classList.add('board-container')
        for (let board of boards){
            boardsContainer.insertAdjacentHTML('beforeend', `
            <section id="board-id-${board['id']}" class="board" data-board-id="${board['id']}">
                <div class="board-header"><span data-board-title="${board.title}" class="board-title">${board['title']}</span>
                    <button class="board-add">Add Card</button>
                    <button class="board-toggle"><i class="fas fa-chevron-down"></i></button>
                </div>
                <div class="board-columns">Empty column</div>
            </section>
            ` );
            let section = document.querySelector(`#board-id-${board['id']}`);
            section.querySelector(`[data-board-title="${board.title}"]`).addEventListener('click', this.changeBoardName)
        }
    },
    changeBoardName: function (evt){
        dom.modalBoardNameChange(evt)

    },
    closeModal: function (){
        document.querySelector('.bg-modal').style.display = "none";
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
           column.insertAdjacentHTML('beforeend', `
                <div data-card-id="${card.id}" class="card">
                    <div class="card-remove"><i class="fas fa-trash-alt"></i></div>
                    <div class="card-title">
                        <input value="${card.title}" class="card-title-change hide-element">${card.title}
                    </div>
                </div>
           `)
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
    },

    initCardEventListeners: function(){
        let cards = document.querySelectorAll('.card');
        let inputFields = document.querySelectorAll('.card-title-change');
        for(let card of cards){
            card.addEventListener('click', dom.showCardTitleInput)
        }
        for(let field of inputFields){
            field.addEventListener('keydown', dom.initTitleChange)
        }
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
};
