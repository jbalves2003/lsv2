import React from 'react';

const GameBoard = ({ board, handleCellClick, handleCellContextMenu }) => {
    return (
        <div className="game-board">
            {board.map((row, rowIndex) => (
                <div key={rowIndex} className="row">
                    {row.map((cell, colIndex) => (
                        <div
                            key={colIndex}
                            className={`cell ${cell.clicked ? 'clicked' : ''} ${cell.flagged ? 'flagged' : ''} ${cell.questioned ? 'questioned' : ''}`}
                            onClick={() => handleCellClick(rowIndex, colIndex)}
                            onContextMenu={(e) => handleCellContextMenu(e, rowIndex, colIndex)} >
                            {cell.clicked ? (cell.value === 'mine' ? '💣' : (cell.value > 0 ? cell.value : '')) : (cell.flagged ? '🚩' : (cell.questioned ? '?' : ''))}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default GameBoard;
