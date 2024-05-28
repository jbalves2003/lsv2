import React from 'react';

const Cell = ({ value, onClick, onContextMenu }) => {
  return (
    <div className="cell" onClick={onClick} onContextMenu={onContextMenu}>
      {value}
    </div>
  );
};

export default Cell;