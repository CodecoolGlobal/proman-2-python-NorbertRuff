// It uses data_handler.js to visualize elements
import { dataHandler } from "./data_handler.js";

export let dom = {
    init: function () {
        let addNewPublicBoardBTN = document.querySelector("#add_public_board");
        addNewPublicBoardBTN.addEventListener('click', addNewPBoard);
        // This function should run once, when the page is loaded.
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
        })

    },
    showBoards: function (boards) {
        let boardsContainer = document.querySelector('#boards');
        boardsContainer.innerHTML = ''
        boardsContainer.classList.add('board-container')
        for (let board of boards){
            boardsContainer.insertAdjacentHTML('beforeend', `
            <section id="board-id-${board['id']}" class="board" data-board-id="${board['id']}">
                <div class="board-header"><span class="board-title">${board['title']}</span>
                    <button class="board-add">Add Card</button>
                    <button class="board-toggle"><i class="fas fa-chevron-down"></i></button>
                </div>
                <div class="board-columns">Empty column</div>
            </section>
            ` );
        }
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
                <div class="card">
                    <div class="card-remove"><i class="fas fa-trash-alt"></i></div>
                    <div class="card-title">${card.title}</div>
                </div>
           `)
       }
    },

};

// Main function for setting up, creating, saving new board
function addNewPBoard(){
    const modal = document.querySelector(".bg-modal");
    const closeSpan = document.querySelector(".close");
    createModal()
    modal.style.display = "block";
    closeSpan.onclick = function() {modal.style.display = "none";}
    window.onclick = function(event) {if (event.target == modal) modal.style.display = "none";}
    document.querySelector('#save_new_title').onclick = function() {
        let customTitle = document.querySelector('#new_title')
        createNewPBoard(customTitle.value);
        modal.style.display = "none";
    }
    saveNewBoardToDB()
}

// Creates modal element
function createModal(){
    let modalContent = document.querySelector('.modal-content')
    modalContent.innerHTML = '';
    modalContent.insertAdjacentHTML('afterbegin', ` 
            <label for="new_title">Add title for new board</label>
            <br><br>
            <input type="text" name="new_title" id="new_title">
            <br><br>
    `);
    document.querySelector('.modal-footer').innerHTML='<button id="save_new_title">Save</button>';
}

// Creates new public board with title adds after last board
function createNewPBoard(customTitle){
        let boards = document.querySelectorAll('section');
        let lastBoard = document.querySelector('section:last-child');
        lastBoard.insertAdjacentHTML('afterend', `
                <section id="board-id-${boards.length + 1}" class="board" data-board-id="${boards.length + 1}">
                    <div class="board-header"><span class="board-title">${customTitle}</span>
                        <button class="board-add">Add Card</button>
                        <button class="board-toggle"><i class="fas fa-chevron-down"></i></button>
                    </div>
                    <div class="board-columns"></div>
                </section>
            `);
}

// Saves new board to DB
function saveNewBoardToDB(){

}

