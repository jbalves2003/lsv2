import React, { useState } from "react";
import Header from "./Header";
import GameBoard from "./GameBoard";

const Board = () => {
    const [board, setBoard] = useState([]);
    const [time, setTime] = useState(0);
    const [score, setScore] = useState(0);
    const [scoreRanking, setScoreRanking] = useState([]);
    const [playerName, setPlayerName] = useState("");

    const [gameStarted, setGameStarted] = useState(false);
    const [gamePaused, setGamePaused] = useState(false);
    const [difficulty, setDifficulty] = useState("easy");
    const [intervalId, setIntervalId] = useState(null);

    const generateBoard = (difficulty) => {
        let rows, cols, mines;

        switch (difficulty) {
            case "easy":
                rows = 9;
                cols = 9;
                mines = 10;
                break;
            case "medium":
                rows = 16;
                cols = 16;
                mines = 40;
                break;
            case "hard":
                rows = 16;
                cols = 30;
                mines = 99;
                break;
            default:
                rows = 9;
                cols = 9;
                mines = 10;
        }

        const newBoard = Array.from({ length: rows }, () =>
            Array.from({ length: cols }, () => ({
                value: 0,
                clicked: false,
                flagged: false,
                questioned: false,
            }))
        );

        let minesPlaced = 0;
        while (minesPlaced < mines) {
            const randomRow = Math.floor(Math.random() * rows);
            const randomCol = Math.floor(Math.random() * cols);
            if (!newBoard[randomRow][randomCol].value) {
                newBoard[randomRow][randomCol].value = "mine";
                minesPlaced++;
            }
        }

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (newBoard[i][j].value === "mine") {
                    for (let dx = -1; dx <= 1; dx++) {
                        for (let dy = -1; dy <= 1; dy++) {
                            const newRow = i + dx;
                            const newCol = j + dy;
                            if (
                                newRow >= 0 &&
                                newRow < rows &&
                                newCol >= 0 &&
                                newCol < cols &&
                                newBoard[newRow][newCol].value !== "mine"
                            ) {
                                newBoard[newRow][newCol].value++;
                            }
                        }
                    }
                }
            }
        }

        return newBoard;
    };

    const expandEmptyCells = (row, col, currentBoard) => {
        const rows = currentBoard.length;
        const cols = currentBoard[0].length;

        const directions = [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
            [-1, -1],
            [-1, 1],
            [1, -1],
            [1, 1],
        ];

        const queue = [{ row, col }];

        while (queue.length > 0) {
            const { row, col } = queue.shift();

            for (const [dx, dy] of directions) {
                const newRow = row + dx;
                const newCol = col + dy;

                if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                    const cell = currentBoard[newRow][newCol];

                    if (!cell.clicked && cell.value === 0) {
                        currentBoard[newRow][newCol].clicked = true;
                        queue.push({ row: newRow, col: newCol });
                    } else if (!cell.clicked && cell.value !== "mine") {
                        currentBoard[newRow][newCol].clicked = true;
                    }
                }
            }
        }

        return currentBoard;
    };

    const resetGameState = () => {
        setBoard([]);
        setTime(0);
        setScore(0);
        setGameStarted(false);
        setGamePaused(false);
        if (intervalId) {
            clearInterval(intervalId);
            setIntervalId(null);
        }
    };

    const addToScoreRanking = (name,score, time) => {
        const newScore = { name,score, time };
        const updatedRanking = [...scoreRanking, newScore];
        updatedRanking.sort((a, b) => b.score - a.score || a.time - b.time);
        const top10 = updatedRanking.slice(0, 10);
        setScoreRanking(top10);
    };

    const handleStartClick = (name) => {
        resetGameState();
        setGameStarted(true);
        setGamePaused(false);
        setScore(0);
        setPlayerName(name);
        setBoard(generateBoard(difficulty));
        const id = setInterval(() => setTime((prevTime) => prevTime + 1), 1000);
        setIntervalId(id);
    };

    const handleEndClick = (message, isWin = false) => {
        setGameStarted(false);
        setGamePaused(false);
        if (intervalId) {
            clearInterval(intervalId);
            setIntervalId(null);
        }

        addToScoreRanking(playerName, score, time);

        alert(message);
        resetGameState();
    };

    const handleDifficultyChange = (selectedDifficulty) => {
        setDifficulty(selectedDifficulty);
        if (gameStarted) {
            handleEndClick("Terminado.");
            handleStartClick();
        }
    };

    const handleCellClick = (row, col) => {
        if (gamePaused || !gameStarted) {
            return;
        }

        if (
            board[row][col].clicked ||
            board[row][col].flagged ||
            board[row][col].questioned
        ) {
            return;
        }

        let newBoard = board.map((row) => row.map((cell) => ({ ...cell })));

        if (newBoard[row][col].value === "mine") {
            console.log("Game Over! - CABUMMM");

            newBoard = newBoard.map((row) =>
                row.map((cell) => ({
                    ...cell,
                    clicked: true,
                }))
            );

            if (intervalId) {
                clearInterval(intervalId);
                setIntervalId(null);
            }

            handleEndClick("CABUMM - GameOver!!!");
            setBoard(newBoard);
        } else {
            newBoard[row][col].clicked = true;
            setScore(score + 1);

            if (newBoard[row][col].value === 0) {
                newBoard = expandEmptyCells(row, col, newBoard);
            }

            let allSafeCellsRevealed = true;
            for (let i = 0; i < newBoard.length; i++) {
                for (let j = 0; j < newBoard[i].length; j++) {
                    if (newBoard[i][j].value !== "mine" && !newBoard[i][j].clicked) {
                        allSafeCellsRevealed = false;
                        break;
                    }
                }
                if (!allSafeCellsRevealed) {
                    break;
                }
            }

            if (allSafeCellsRevealed) {
                console.log("GG EZ - Concluiste o jogo");
                handleEndClick("GG EZ", true);
            }

            setBoard(newBoard);
        }
    };

    const handleCellContextMenu = (e, row, col) => {
        e.preventDefault();
        if (gamePaused || !gameStarted) {
            return;
        }

        const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));

        if (!newBoard[row][col].clicked) {
            if (newBoard[row][col].flagged) {
                newBoard[row][col].flagged = false;
                newBoard[row][col].questioned = true;
            } else if (newBoard[row][col].questioned) {
                newBoard[row][col].questioned = false;
            } else {
                newBoard[row][col].flagged = true;
            }
            setBoard(newBoard);
        }
    };

    return (
        <div className="board">
            <Header
                time={time}
                score={score}
                onStartClick={handleStartClick}
                onEndClick={handleEndClick}
                onDifficultyChange={handleDifficultyChange}
            />
            <GameBoard
                board={board}
                handleCellClick={handleCellClick}
                handleCellContextMenu={handleCellContextMenu}
            />
            <div className="score-ranking">
                <h2>Ranking de Pontuações</h2>
                <ol>
                    {scoreRanking.map((score, index) => (
                        <li key={index}>
                            <span>{score.name}</span> - <span>{score.score} pontos</span> - <span>{score.time} segundos</span>
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
};

export default Board;
