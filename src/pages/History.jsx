import React, { useState } from 'react';
import './History.css';

const History = () => {
  const [expandedRows, setExpandedRows] = useState([]);
  const [hoveredRow, setHoveredRow] = useState(null);

  // Sample data for the document history
  const historyData = [
    { id: 1, date: '1/01/2023', change: 'Initial document creation', author: 'John Doe' },
    { id: 2, date: '2/15/2023', change: 'Updated financial figures', author: 'Jane Smith' },
    { id: 3, date: '3/22/2023', change: 'Revised project timeline', author: 'Mike Johnson' },
    // Add more entries as needed
  ];

  const toggleRow = (id) => {
    setExpandedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  return (
    <div className="History-container">
      {/* Left Panel */}
      <div className="History-panel">
        <div className="History-header">
          <h2>Document history</h2>
          <button className="History-close-button">×</button>
        </div>
        <div className="History-list">
          {historyData.map((item) => (
            <div 
              key={`left-${item.id}`}
              className={`History-row ${hoveredRow === item.id ? 'History-hovered' : ''} ${expandedRows.includes(item.id) ? 'History-expanded' : ''}`}
              onMouseEnter={() => setHoveredRow(item.id)}
              onMouseLeave={() => setHoveredRow(null)}
              onClick={() => toggleRow(item.id)}
            >
              <div className="History-row-content">
                <span className="History-date">{item.date}</span>
                <span className="History-change">{item.change}</span>
                <span className="History-author">({item.author})</span>
              </div>
              <span className="History-expand-icon">›</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel (identical to left) */}
      <div className="History-panel">
        <div className="History-header">
          <h2>Document history</h2>
          <button className="History-close-button">×</button>
        </div>
        <div className="History-list">
          {historyData.map((item) => (
            <div 
              key={`right-${item.id}`}
              className={`History-row ${hoveredRow === item.id ? 'History-hovered' : ''} ${expandedRows.includes(item.id) ? 'History-expanded' : ''}`}
              onMouseEnter={() => setHoveredRow(item.id)}
              onMouseLeave={() => setHoveredRow(null)}
              onClick={() => toggleRow(item.id)}
            >
              <div className="History-row-content">
                <span className="History-date">{item.date}</span>
                <span className="History-change">{item.change}</span>
                <span className="History-author">({item.author})</span>
              </div>
              <span className="History-expand-icon">›</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default History;