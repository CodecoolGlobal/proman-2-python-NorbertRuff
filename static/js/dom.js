// It uses data_handler.js to visualize elements
import { dataHandler } from "./data_handler.js";

export let dom = {
    init: function () {
        document.querySelector('.close').addEventListener('click', this.closeModal)
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
            dom.initCollapseBoard()
            dom.initDragAndDrop()
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
        dataHandler.boardNameChange({"board_name": newBoardName, "id": boardID})
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
                <div id="card-id-${card['id']}" class="card" draggable="true">
                    <div class="card-remove"><i class="fas fa-trash-alt"></i></div>
                    <div class="card-title">${card.title}</div>
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
};


