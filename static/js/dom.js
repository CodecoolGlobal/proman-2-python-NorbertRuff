// It uses data_handler.js to visualize elements
import { dataHandler } from "./data_handler.js";

export let dom = {
    init: function () {

        // This function should run once, when the page is loaded.
    },
    loadBoards: function () {
        // retrieves boards and makes showBoards called
        let promise1 = dataHandler.getBoards()
        let promise2 = dataHandler.getDefaultStatuses()
        Promise.all([promise1, promise2]).then((data) => {
            let boards = data[0]
            let defaultStatuses = data[1]
            dom.showBoards(boards);
            dom.showDefaultStatuses(defaultStatuses);
        })

    },
    showBoards: function (boards) {
        let boardsContainer = document.querySelector('#boards');
        boardsContainer.innerHTML = ''
        boardsContainer.classList.add('board-container')
        for (let board of boards){
            boardsContainer.insertAdjacentHTML('beforeend', `
            <section class="board" data-board-id="${board['id']}">
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
                <div class="board-column-content"></div>
                    </div>`)
            }
        }
    },

    loadCards: function (boardId) {
        // retrieves cards and makes showCards called
    },
    showCards: function (cards) {
        // shows the cards of a board
        // it adds necessary event listeners also
    },
    // here comes more features
};
