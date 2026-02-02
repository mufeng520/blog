import React from 'react';
import type { FilterType } from '../types/wjdrgcz';

interface TimerControlsProps {
  totalCount: number;
  phase1Count: number;
  phase2Count: number;
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  onReset: () => void;
}

export default function TimerControls({ 
  totalCount = 0, 
  phase1Count = 0, 
  phase2Count = 0, 
  currentFilter = 'all', 
  onFilterChange, 
  onReset 
}: TimerControlsProps) {
  const handleReset = () => {
    if (window.confirm('确定要删除所有倒计时吗？此操作不可撤销。')) {
      onReset?.();
    }
  };

  return (
    <div className="controls">
      <div className="filter-controls">
        <button 
          className={`filter-btn ${currentFilter === 'all' ? 'active' : ''}`}
          onClick={() => onFilterChange?.('all')}
        >
          显示全部
        </button>
        <button 
          className={`filter-btn ${currentFilter === 'phase1' ? 'active' : ''}`}
          onClick={() => onFilterChange?.('phase1')}
        >
          可争夺阶段
        </button>
        <button 
          className={`filter-btn ${currentFilter === 'phase2' ? 'active' : ''}`}
          onClick={() => onFilterChange?.('phase2')}
        >
          保护阶段
        </button>
      </div>
      <div className="stats-bar">
        <div className="stats-item">
          <span className="label">总数</span>
          <span className="value">{totalCount}</span>
        </div>
        <div className="stats-item">
          <span className="label">可争夺</span>
          <span className="value">{phase1Count}</span>
        </div>
        <div className="stats-item">
          <span className="label">保护</span>
          <span className="value">{phase2Count}</span>
        </div>
      </div>
      <button className="secondary reset-btn" onClick={handleReset}>
        重置所有
      </button>
      
      <style jsx>{`
        .controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .filter-controls {
          display: flex;
          gap: 8px;
        }
        
        .filter-btn {
          background: rgba(30, 41, 59, 0.7);
          color: #94a3b8;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 6px 12px;
          border-radius: 5px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.8rem;
        }
        
        .filter-btn.active {
          background: linear-gradient(90deg, #3b82f6, #6366f1);
          color: white;
          border-color: transparent;
        }
        
        .filter-btn:hover {
          background: rgba(59, 130, 246, 0.2);
        }
        
        .stats-bar {
          display: flex;
          justify-content: space-between;
          margin: 6px 0;
          padding: 5px;
          background: rgba(15, 23, 42, 0.4);
          border-radius: 4px;
          font-size: 0.75rem;
          flex-grow: 1;
          max-width: 300px;
        }
        
        .stats-item {
          text-align: center;
          flex: 1;
        }
        
        .stats-item .label {
          display: block;
          color: #94a3b8;
          font-size: 0.65rem;
          margin-bottom: 1px;
        }
        
        .stats-item .value {
          display: block;
          color: #60a5fa;
          font-weight: 600;
          font-size: 0.8rem;
        }
        
        .reset-btn {
          background: linear-gradient(90deg, #ef4444, #dc2626);
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 5px;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .reset-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
        }
        
        @media (max-width: 768px) {
          .controls {
            flex-direction: column;
            align-items: stretch;
          }
          
          .filter-controls {
            justify-content: center;
          }
          
          .stats-bar {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}