//Mandatory boards.
appState = {
    boards: [],
    currentBoard: null,
    uiState: {}
}

boardStructure = {
    id: "",
    title: "",
    color: "",
    createdAt: new Date(),
    lists: []
}

listsStructure = {
    id: "",
    title: "",
    position: "",
    cards: []
}

cardStructure = {
    id: "",
    title: "",
    description: "",
    createdAt: new Date(),
    position: 0
}

uiStateStructure = {
    activeModal: null,
    editingElement: null,
    dragState: null
}

//Sample board.
const appStateSample = {
    boards: [
        {
            id: "board-1",
            title: "Work tasks",
            color: "#0079bf",
            createdAt: new Date(),
            lists: []
        },
        {
            id: "board-2", 
            title: "Gym workout program",
            color: "#519839",
            createdAt: new Date(),
            lists: []
        }
    ],
    currentBoard: null,
    uiState: {}
}

//Create new board.
function createBoard(boardData) {
    const newBoard = {
        id: generateId(),
        title: boardData.title,
        color: boardData.color || "#0079bf",
        createdAt: new Date(),
        lists: []
    }
    appState.boards.push(newBoard);
    return newBoard;
}

//Generates board IDs.
function generateId() {
    return 'board-' + Date.now();
}

//Event handler.
function handleCreateBoardClick() {
    const title = prompt("Board title:")

    if (title) {
        createBoard({title: title});
        renderDashboard();
        saveState();
    }
}

//Event listener to create board.
function initializeEventListeners() {
    const createNewBoardBtn = document.getElementById("create-new-board-btn");
    createNewBoardBtn.addEventListener("click", handleCreateBoardClick);
}

//Renders dashboard.
function renderDashboard() {
    const boardsGrid = document.getElementById("boards-grid");
    boardsGrid.innerHTML = "";

    appState.boards.forEach(board => {
        const boardElement = document.createElement("div");
        boardElement.className = "board-preview";
        boardElement.dataset.boardId = board.id;
        boardElement.innerHTML = `
        <div class="board-header">
                <h3>${board.title}</h3>
                <button class="delete-board-btn">✕</button>
            </div>
            <p>${board.lists.length} lists</p>
        `;
        boardsGrid.appendChild(boardElement);
        boardElement.addEventListener('click', handleBoardClick);

        //Delete board event listener
        const deleteBoardBtn = boardElement.querySelector(".delete-board-btn");
        deleteBoardBtn.addEventListener("click", handleDeleteBoardClick);
    });
}

//Function for when you click on a board.
function handleBoardClick(event) {
    const boardId = event.currentTarget.dataset.boardId;
    const board = appState.boards.find(b => b.id === boardId);
    appState.currentBoard = board;

    document.getElementById("dashboard").style.display = "none";
    document.getElementById("board-container").style.display = "block";

    renderBoard();
}

//Function for board handling add lists container, render lists & cards.
function renderBoard() {
    const boardHeader = document.getElementById("board-header");
    const listsContainer = document.getElementById("lists-container");

    boardHeader.innerHTML = `
        <button class="back-btn">← Back</button>
        <h1>${appState.currentBoard.title}</h1>
        `;
   
    listsContainer.innerHTML = "";

        //Back Home button event listener.
        const backBtn = boardHeader.querySelector(".back-btn");
        backBtn.addEventListener("click", navigateToDashboard);

    renderLists();
}

//Function to navigate to Home page after clicking the back button.
function navigateToDashboard() {
    document.getElementById("dashboard").style.display = "block";
    document.getElementById("board-container").style.display = "none";
    appState.currentBoard = null;
    renderDashboard();
}

//Delete board.
function deleteBoard(boardId) {
    const boardIndex = appState.boards.findIndex(b => b.id === boardId);

    if (boardIndex !== -1) {
        appState.boards.splice(boardIndex, 1)


    if (appState.currentBoard && appState.currentBoard.id === boardId) {
        appState.currentBoard = null;
        }
    }

}

//Function to render lists in the boards.
function renderLists() {
    const listsContainer = document.getElementById("lists-container");
    listsContainer.innerHTML = "";

    appState.currentBoard.lists.forEach(list => {
        const listElement = document.createElement("div");
        listElement.className = "list";
        listElement.dataset.listId = list.id;
        listElement.innerHTML = `
        <div class="list-header">
            <h3>${list.title}</h3>
            <button class="delete-list-btn">✕</button>
        </div>
        <div class="cards-container"></div>
        <div class="add-card-section">+ Add Card</div>
    `;


        const listTitle = listElement.querySelector("h3");
        listTitle.addEventListener("dblclick", handleListTitleDoubleClick);

        listsContainer.appendChild(listElement);
        
        renderCards(list, listElement);

        listElement.addEventListener('dragover', handleDragOver);
        listElement.addEventListener('drop', handleDrop);

        //Event listener to delete lists.
        const deleteListBtn = listElement.querySelector(".delete-list-btn");
        deleteListBtn.addEventListener("click", () => {
        const listId = listElement.dataset.listId;

        if (confirm("Are you sure you want to delete this list?")) {
            deleteList(listId);
            renderLists();
            saveState();
        }

    });

        const addCardBtn = listElement.querySelector('.add-card-section');
        addCardBtn.addEventListener('click', handleAddCardClick);
    });

        //Add list button
        const addListSection = document.createElement("div");
        addListSection.className = "add-list-section";
        addListSection.innerHTML = `
            <button class="add-list-btn">+ Add List</button>
        `;
        listsContainer.appendChild(addListSection);

        //Event for add list button
        addListSection.addEventListener('click', handleAddListClick);
}

//Function to render cards for drag & drop.
function renderCards(list, listElement) {
    const cardsContainer = listElement.querySelector(".cards-container");
    cardsContainer.innerHTML = "";
    
    list.cards.forEach(card => {
        const cardElement = document.createElement("div");
        cardElement.className = "card";
        cardElement.draggable = true;
        cardElement.dataset.cardId = card.id;
        cardElement.innerHTML = `<h4>${card.title}</h4>`;
        cardsContainer.appendChild(cardElement);
        
        cardElement.addEventListener("dragstart", handleDragStart);
        cardElement.addEventListener("dragend", handleDragEnd);
    });
}

//Functions to handle the drag and drop feature.
function handleDragStart(event) {
    const cardElement = event.currentTarget;
    const cardId = cardElement.dataset.cardId;

    const listElement = cardElement.closest(".list");
    const sourceListId = listElement.dataset.listId;

    const dragData = { cardId: cardId, sourceListId: sourceListId };
    event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
    
    cardElement.classList.add("dragging");
}

function handleDragEnd(event) {
    const cardElement = event.currentTarget;
    cardElement.classList.remove("dragging");

    const dropZones = document.querySelectorAll(".list.drop-zone");
    dropZones.forEach(zone => zone.classList.remove("drop-zone"));
}

function handleDragOver(event) {
    event.preventDefault();
    const listElement = event.currentTarget;

    const dropZones = document.querySelectorAll(".list.drop-zone");
    dropZones.forEach(zone => zone.classList.remove("drop-zone"));

    listElement.classList.add("drop-zone");
}

function handleDrop(event) {
    event.preventDefault();
    const dragData = JSON.parse(event.dataTransfer.getData("text/plain"));

    const targetListElement = event.currentTarget;
    const targetListId = targetListElement.dataset.listId;

    targetListElement.classList.remove("drop-zone");

    moveCard(dragData.sourceListId, targetListId, dragData.cardId);
}

//Function to move card.
function moveCard(sourceListId, targetListId, cardId) {    
    const sourceList = appState.currentBoard.lists.find(l => l.id === sourceListId);
    const targetList = appState.currentBoard.lists.find(l => l.id === targetListId);
  
    const cardIndex = sourceList.cards.findIndex(c => c.id === cardId);
    console.log("cardIndex:", cardIndex);

    if (!sourceList || !targetList || cardIndex === -1) {
        console.error("Move card failed");
        return;
    }

    const [movedCard] = sourceList.cards.splice(cardIndex, 1);
    targetList.cards.push(movedCard);

    renderLists();
    saveState();
}

//Function to handle delete board button
function handleDeleteBoardClick(event) {
    event.preventDefault();
    event.stopImmediatePropagation();

    const boardElement = event.currentTarget.closest('.board-preview');
    const boardId = boardElement.dataset.boardId;

    if (confirm ("Are you sure you want to delete this board?")) {
        deleteBoard(boardId);
        renderDashboard();
        saveState();
    }

    if (appState.currentBoard && appState.currentBoard.id === boardId) {
            document.getElementById("dashboard").style.display = "block";
            document.getElementById("board-container").style.display = "none";
            appState.currentBoard = null;
        }
}

//Delete list function
function deleteList(listId) {
    const listIndex = appState.currentBoard.lists.findIndex(list => list.id === listId);

    if (listIndex !== -1) {
    appState.currentBoard.lists.splice(listIndex, 1);
    }
}

//Function to handle add card button on click.
function handleAddCardClick(event) {
    const listElement = event.currentTarget.closest('.list');
    const listId = listElement.dataset.listId;

    const cardTitle = prompt("Enter card title:");

    if (cardTitle) {
        createCard(listId, { title: cardTitle });
        renderLists();
        saveState();
    }
}

//Function create card.
function createCard(listId, cardData) {
    const list = appState.currentBoard.lists.find(l => l.id === listId);

    const newCard = {
        id: "card" + Date.now(),
        title: cardData.title,
        description: "",
        createdAt: new Date(),
        position: list.cards.length
    };

    list.cards.push(newCard);
    return newCard;
}

//Function to handle add list button on click.
function handleAddListClick() {
    const listTitle = prompt("Enter list title:");
    
    if (listTitle) {
        createList(listTitle);
        renderLists();
        saveState();
    }
}

//Function to create list.
function createList(title) {
    const newList = {
        id: "list-" + Date.now(),
        title: title,
        position: appState.currentBoard.lists.length,
        cards: []
    };
    
    appState.currentBoard.lists.push(newList);
    return newList;
}

//Functions to edit lists, cards, & board titles.
function handleListTitleDoubleClick(event) {    
    const titleElement = event.target;
    const listElement = titleElement.closest('.list'); 
    const listId = listElement.dataset.listId;
    const currentTitle = titleElement.textContent;
    const inputElement = document.createElement('input');
    
    inputElement.type = 'text';
    inputElement.value = currentTitle;
    inputElement.className = 'list-title-input';
    
    titleElement.replaceWith(inputElement);
        
    inputElement.addEventListener('keydown', handleListTitleKeyDown);
    inputElement.addEventListener('blur', handleListTitleBlur);
    
    inputElement.focus();
}

function handleListTitleKeyDown(event) {
    const inputElement = event.target;
    const listElement = inputElement.closest(".list");
    const listId = listElement.dataset.listId;

    if (event.key === "Enter") {
        const newTitle = inputElement.value.trim();
        updateListTitle(listId, newTitle);
        renderLists();
        saveState();
    } else if (event.key === "Escape") {
        renderLists();
        }
}

function updateListTitle(listId, newTitle) {
    const list = appState.currentBoard.lists.find(l => l.id === listId);
    if (list) {
        list.title = newTitle;
    }
}

function handleListTitleBlur(event) {
    const inputElement = event.target;
    const listElement = inputElement.closest('.list');
    const listId = listElement.dataset.listId;
    
    const newTitle = inputElement.value.trim();
    updateListTitle(listId, newTitle);
    renderLists();
    saveState();
}

//Saves state.
function saveState() {
    const stateString = JSON.stringify(appState);

    try {
       localStorage.setItem("trello-app-state", stateString); 
    } catch (error) {
        console.error("Save failed:", error);
    }
}

initializeEventListeners();

//Save boards to local storage.
function loadState() {
    const savedData = localStorage.getItem("trello-app-state");

    if (savedData) {
        const parsedState = JSON.parse(savedData);
        appState = parsedState;
    }
    renderDashboard();
}

loadState();