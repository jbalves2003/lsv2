import React, { useState } from "react";

const Header = ({ time, score, onStartClick, onEndClick, onDifficultyChange }) => {
  const [playerName, setPlayerName] = useState('');

  return (
    <div className="header">
      <h1>Minesweeper</h1>
      <div className="player-name">
        <label htmlFor="playerName">Nome do Jogador:</label>
        <input
          type="text"
          id="playerName"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
      </div>
      <div className="header-controls">
        <div className="header-dropdown">
          <label htmlFor="difficulty">Dificuldade:</label>
          <select id="difficulty" onChange={(e) => onDifficultyChange(e.target.value)}>
            <option value="easy">Fácil</option>
            <option value="medium">Médio</option>
            <option value="hard">Difícil</option>
          </select>
        </div>
        <div>
          <button onClick={() => playerName ? onStartClick(playerName) : alert("Se queres jogar tens de inserir o nome esperto :)).")}>Iniciar</button>
          <button onClick={() => onEndClick("Jogo Terminado")}>Terminar</button>
        </div>
        <div className="header-score">
          <span>Tempo: {time}</span>
          <span>Pontuação: {score}</span>
        </div>
      </div>
    </div>
  );
};

export default Header;
