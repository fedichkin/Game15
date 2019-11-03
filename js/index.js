(function() {
    let state, renderPanels, setEventsForPanel, newGame, getCoordinatesEmptyElement, isCompleteGame,
        incrementCountSteps, resetCountSteps, openModalScoreTable, closeModalScoreTable, toggleTitleNewGame,
        onClickPanel, onEndTransitionPanel, recordResultGame;

    state = [
        ["1", "2", "3", "4"],
        ["5", "6", "7", "8"],
        ["9", "10", "11", "12"],
        ["13", "14", "15", ""]
    ];

    renderPanels = () => {
        let gameBoard = document.querySelector(".game-board"), xIndex, yIndex;

        gameBoard.innerHTML = "";

        for (yIndex = 0; yIndex < state.length; yIndex++) {
            let row = state[yIndex];

            for (xIndex = 0; xIndex < row.length; xIndex++) {
                let cell = row[xIndex];

                let elementPanel = document.createElement("div");

                elementPanel.innerText = cell;

                if (cell === "") {
                    elementPanel.classList.add("empty");
                } else {
                    elementPanel.classList.add("panel");
                    setEventsForPanel(elementPanel, xIndex, yIndex);
                }

                gameBoard.appendChild(elementPanel);
            }
        }
    };

    onEndTransitionPanel = (x, y, e) => {
        let panel     = e.currentTarget,
            deltaX    = 0,
            deltaY    = 0,
            direction = "";

        if (state[y][x + 1] === "") {
            deltaX    = 1;
            direction = "right";
        } else if (state[y][x - 1] === "") {
            deltaX    = -1;
            direction = "left";
        } else if (state[y + 1] && state[y + 1][x] === "") {
            deltaY    = 1;
            direction = "down";
        } else if (state[y - 1] && state[y - 1][x] === "") {
            deltaY    = -1;
            direction = "up";
        }

        state[y + deltaY][x + deltaX] = state[y][x];
        state[y][x]                   = "";
        panel.classList.remove(direction);

        renderPanels();

        if (isCompleteGame()) {
            toggleTitleNewGame(true);
            recordResultGame();
        }
    };

    onClickPanel = (x, y, e) => {
        let panel = e.currentTarget;

        if (state[y][x + 1] === "") {
            panel.classList.add("right");
        } else if (state[y][x - 1] === "") {
            panel.classList.add("left");
        } else if (state[y + 1] && state[y + 1][x] === "") {
            panel.classList.add("down");
        } else if (state[y - 1] && state[y - 1][x] === "") {
            panel.classList.add("up");
        }

        incrementCountSteps();
    };

    setEventsForPanel = (panel, x, y) => {
        panel.addEventListener("click", onClickPanel.bind(null, x, y));

        panel.addEventListener("transitionend", onEndTransitionPanel.bind(null, x, y));
    };

    toggleTitleNewGame = (isShow) => {
        let winTitle = document.querySelector(".win-title");

        if (isShow) {
            winTitle.style.display = "block";
        } else {
            winTitle.style.display = "none";
        }
    };

    newGame = () => {
        let { x, y } = getCoordinatesEmptyElement(),
            index    = 0;

        while (index < 100) {
            let directions = [],
                countDirections, randomDirection, newX, newY;

            if (x > 0) {
                directions.push({ deltaX: -1, deltaY: 0 });
            }

            if (x < 3) {
                directions.push({ deltaX: 1, deltaY: 0 });
            }

            if (y > 0) {
                directions.push({ deltaX: 0, deltaY: -1 });
            }

            if (y < 3) {
                directions.push({ deltaX: 0, deltaY: 1 });
            }

            countDirections = directions.length;
            randomDirection = Math.floor(Math.random() * countDirections);

            newX = x + directions[randomDirection].deltaX;
            newY = y + directions[randomDirection].deltaY;

            state[y][x]       = state[newY][newX];
            state[newY][newX] = "";

            x = newX;
            y = newY;

            index++
        }

        renderPanels();
        resetCountSteps();
        toggleTitleNewGame(false);
    };

    getCoordinatesEmptyElement = () => {
        let xIndex, yIndex;

        for (yIndex = 0; yIndex < state.length; yIndex++) {
            let row = state[yIndex];

            for (xIndex = 0; xIndex < row.length; xIndex++) {
                let cell = row[xIndex];

                if (cell === "") {
                    return { x: xIndex, y: yIndex };
                }
            }
        }
    };

    isCompleteGame = () => {
        let xIndex, yIndex,
            counter = 0;

        for (yIndex = 0; yIndex < state.length; yIndex++) {
            let row = state[yIndex];

            for (xIndex = 0; xIndex < row.length; xIndex++) {
                let cell = row[xIndex];

                if (counter < 15 && ("" + ++counter) !== cell) {
                    return false;
                }
            }
        }

        return true;
    };

    incrementCountSteps = () => {
        let scoreElement = document.querySelector(".score span"),
            countSteps   = parseInt(scoreElement.innerText);

        scoreElement.innerText = ++countSteps;
    };

    resetCountSteps = () => {
        let scoreElement = document.querySelector(".score span");

        scoreElement.innerText = "0";
    };

    openModalScoreTable = () => {
        let modalElement          = document.querySelector(".modal"),
            mainElement           = document.documentElement,
            scoreTableBodyElement = modalElement.querySelector(".score-table__body"),
            scoreTableString      = localStorage.getItem("scoreTable") || "[]",
            scoreTable            = JSON.parse(scoreTableString);

        scoreTableBodyElement.innerHTML = "";

        for (let record of scoreTable) {
            let rowElement   = document.createElement("div"),
                stepsElement = document.createElement("div"),
                dateElement  = document.createElement("div");

            rowElement.classList.add("score-table__row");
            stepsElement.classList.add("steps");
            dateElement.classList.add("date");

            stepsElement.innerText = record.steps;
            dateElement.innerText  = record.date;

            rowElement.appendChild(stepsElement);
            rowElement.appendChild(dateElement);
            scoreTableBodyElement.appendChild(rowElement);
        }

        mainElement.classList.add("modal-locked");
        modalElement.style.display = "block";
    };

    closeModalScoreTable = () => {
        let modalElement = document.querySelector(".modal"),
            mainElement  = document.documentElement;

        mainElement.classList.remove("modal-locked");
        modalElement.style.display = "none";
    };

    recordResultGame = () => {
        let scoreElement     = document.querySelector(".score span"),
            countSteps       = parseInt(scoreElement.innerText),
            scoreTableString = localStorage.getItem("scoreTable") || "[]",
            scoreTable       = JSON.parse(scoreTableString);

        scoreTable.push({ steps: countSteps, date: (new Date()).toLocaleString("ua") });

        scoreTable.sort((item1, item2) => {
            if (item1.steps > item2.steps) {
                return 1;
            }

            if (item1.steps < item2.steps) {
                return -1;
            }

            return 0;
        });

        localStorage.setItem("scoreTable", JSON.stringify(scoreTable));
    };

    document.addEventListener("DOMContentLoaded", () => {
        let newGameButton    = document.querySelector(".new-game-button"),
            scoreTableButton = document.querySelector(".score-table-button"),
            modalElement     = document.querySelector(".modal"),
            closeModalButton = document.querySelector(".modal__header .close");

        renderPanels();
        resetCountSteps();

        newGameButton.addEventListener("click", () => newGame());
        scoreTableButton.addEventListener("click", () => openModalScoreTable());
        closeModalButton.addEventListener("click", () => closeModalScoreTable());
        modalElement.addEventListener("click", (e) => {
            let target = e.target;

            if (target.closest(".modal__content")) {
                return;
            }

            closeModalScoreTable();
        });
    });
})();
