import React, { useState, useEffect } from "react";
import Header from "./Header";
import GameBoard from "./GameBoard";

const Board = () => {
    const [board, setBoard] = useState([]);
    const [time, setTime] = useState(0);
    const [score, setScore] = useState(0);
    const [scoreRanking, setScoreRanking] = useState([]);
    const [playerName, setPlayerName] = useState("");

    // Controle do jogo
    const [gameStarted, setGameStarted] = useState(false);
    const [gamePaused, setGamePaused] = useState(false);
    const [difficulty, setDifficulty] = useState("easy");
    const [intervalId, setIntervalId] = useState(null);

    // tempo
    useEffect(() => {
        // tempo quando o jogo começa 
        if (gameStarted && !gamePaused) {
            const id = setInterval(() => setTime((prevTime) => prevTime + 1), 1000);
            setIntervalId(id);
            return () => clearInterval(id);
        } else if (!gameStarted) {
            setTime(0);
        }

        // clean quando o jogo termina 
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
                setIntervalId(null);
            }
        };
    }, [gameStarted, gamePaused]);

    // tabuleiro dificuldade
    const generateBoard = (difficulty) => {
        let rows, cols, mines;
    
        // dificuldade
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
    
        // cria o tabuleiro
        const newBoard = Array.from({ length: rows }, () =>
            Array.from({ length: cols }, () => ({
                value: 0,
                clicked: false,
                flagged: false,
                questioned: false,
            }))
        );
    
        // minas aleatoria 
        let minesPlaced = 0;
        while (minesPlaced < mines) {
            const randomRow = Math.floor(Math.random() * rows);
            const randomCol = Math.floor(Math.random() * cols);
            if (newBoard[randomRow][randomCol].value !== "mine") {
                newBoard[randomRow][randomCol].value = "mine";
                minesPlaced++;
            }
        }
    
        // calcular adjacentes 
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


    // expande os quadrados adjacentes 
    const expandCells = (row, col, currentBoard) => {
        const rows = currentBoard.length;
        const cols = currentBoard[0].length;
    
        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1],
            [-1, -1], [-1, 1], [1, -1], [1, 1]
        ];
    
        const queue = [{ row, col }];
        const visited = new Set([`${row},${col}`]);
    
        while (queue.length > 0) {
            const { row, col } = queue.shift();
    
            for (const [dx, dy] of directions) {
                const newRow = row + dx;
                const newCol = col + dy;
    
                if (
                    newRow >= 0 &&
                    newRow < rows &&
                    newCol >= 0 &&
                    newCol < cols &&
                    !visited.has(`${newRow},${newCol}`)
                ) {
                    visited.add(`${newRow},${newCol}`);
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

    // reset
    const resetGame = () => {
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

    // pontuacao ao rank 
    const addToScoreRanking = (name, score, time) => {
        const newScore = { name, score, time };
        const updatedRanking = [...scoreRanking, newScore];
        updatedRanking.sort((a, b) => b.score - a.score || a.time - b.time);
        const top10 = updatedRanking.slice(0, 10);
        setScoreRanking(top10);
    };

    // Inicia o jogo
    const handleStartGame = (name) => {
        resetGame();
        setGameStarted(true);
        setGamePaused(false);
        setScore(0);
        setPlayerName(name);
        setBoard(generateBoard(difficulty));
    };

    // Termina o jogo
    const handleEndGame = (message, isWin = false) => {
        setGameStarted(false);
        setGamePaused(false);
        if (intervalId) {
            clearInterval(intervalId);
            setIntervalId(null);
        }

        addToScoreRanking(playerName, score, time);

        alert(message);
        resetGame();
    };

    // Muda a dificuldade do jogo
    const handleDifficultyChange = (selectedDifficulty) => {
        setDifficulty(selectedDifficulty);
        if (gameStarted) {
            handleEndGame("Terminado.");
            handleStartGame(playerName);
        }
    };

    // Função de clique em um quadrado 
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
    
            handleEndGame("CABUMM - GameOver!!!");
            setBoard(newBoard);
        } else {
            newBoard[row][col].clicked = true;
            setScore(score + 1);
    
            if (newBoard[row][col].value === 0) {
                newBoard = expandCells(row, col, newBoard);
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
                handleEndGame("GG EZ", true);
            }
    
            setBoard(newBoard);
        }
    };

    // click direito 
    const handleCellRightClick = (e, row, col) => {
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
                onStartClick={handleStartGame}
                onEndClick={handleEndGame}
                onDifficultyChange={handleDifficultyChange}
            />
            <GameBoard
                board={board}
                handleCellClick={handleCellClick}
                handleCellRightClick={handleCellRightClick}
            />
            <div className="score-ranking">
                <h2>Ranking de Pontuações</h2>
                <ol>
                    {scoreRanking.map((score, index) => (
                        <li key={index}>
                            <span>{score.name}</span> - <span>{score.score} pontos</span> -{" "}
                            <span>{score.time} segundos</span>
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
};

export default Board;