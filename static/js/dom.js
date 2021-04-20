// It uses data_handler.js to visualize elements
import { dataHandler } from "./data_handler.js";

export let dom = {
    init: function () {
        // This function should run once, when the page is loaded.
    },
    loadBoards: function () {
        // retrieves boards and makes showBoards called
        dataHandler.getBoards(function(boards){
            dom.showBoards(boards);
        });
    },
    showBoards: function (boards) {
        // shows boards appending them to #boards div
        // it adds necessary event listeners also
        console.log(boards)
        let boardsContainer = document.querySelector('#boards');
        for (let board of boards){
            boardsContainer.insertAdjacentHTML('beforeend', `
            <section class="board" data-board-id="${board['id']}">
                <div class="board-header"><span class="board-title">Board 1</span>
                    <button class="board-add">Add Card</button>
                    <button class="board-toggle"><i class="fas fa-chevron-down"></i></button>
                </div>
            </section>
            ` );
        }

        // let boardList = '';
        //
        // for(let board of boards){
        //     boardList += `
        //         <li>${board.title}</li>
        //     `;
        // }
        //
        // const outerHtml = `
        //     <ul class="board-container">
        //         ${boardList}
        //     </ul>
        // `;


        // boardsContainer.insertAdjacentHTML("beforeend", outerHtml);
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
