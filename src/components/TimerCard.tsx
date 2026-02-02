import React, { useState, useEffect } from 'react';
import type { Timer, RemainingTime } from '../types/wjdrgcz';

interface TimerCardProps {
  timer: Timer;
  remaining: RemainingTime;
  index: number;
  onDelete: (index: number) => void;
}

export default function TimerCard({ timer, remaining: initialRemaining, index, onDelete }: TimerCardProps) {
  const [currentRemaining, setCurrentRemaining] = useState<RemainingTime>(initialRemaining);
  
  // 计算周期倒计时函数
  const calculateRemainingTime = (startDate: string): RemainingTime | null => {
    if (!startDate) return null;
    
    const start = new Date(startDate);
    const now = new Date();
    
    const elapsedMs = now.getTime() - start.getTime();
    const elapsedSec = elapsedMs / 1000;
    
    const phase1Seconds = 24 * 60 * 60;
    const phase2Seconds = 72 * 60 * 60;
    const totalCycleSeconds = phase1Seconds + phase2Seconds;
    
    let currentCycle = Math.floor(elapsedSec / totalCycleSeconds);
    let elapsedInCurrentCycle = elapsedSec % totalCycleSeconds;
    
    let currentPhase: 1 | 2 = 1;
    let phaseRemaining = 0;
    let totalRemaining = 0;
    let phaseProgress = 0;
    
    if (elapsedInCurrentCycle < phase1Seconds) {
      currentPhase = 1;
      phaseRemaining = phase1Seconds - elapsedInCurrentCycle;
      phaseProgress = (elapsedInCurrentCycle / phase1Seconds) * 100;
    } else {
      currentPhase = 2;
      const elapsedInPhase2 = elapsedInCurrentCycle - phase1Seconds;
      phaseRemaining = phase2Seconds - elapsedInPhase2;
      phaseProgress = (elapsedInPhase2 / phase2Seconds) * 100;
    }
    
    totalRemaining = totalCycleSeconds - elapsedInCurrentCycle;
    
    const days = Math.floor(totalRemaining / (24 * 60 * 60));
    const hours = Math.floor((totalRemaining % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((totalRemaining % (60 * 60)) / 60);
    const seconds = Math.floor(totalRemaining % 60);
    
    const phaseHours = Math.floor(phaseRemaining / (60 * 60));
    const phaseMinutes = Math.floor((phaseRemaining % (60 * 60)) / 60);
    const phaseSeconds = Math.floor(phaseRemaining % 60);
    
    return {
      days,
      hours,
      minutes,
      seconds,
      currentPhase,
      phaseRemaining,
      phaseHours,
      phaseMinutes,
      phaseSeconds,
      phaseProgress,
      totalRemaining,
      totalCycleSeconds,
      currentCycle,
      elapsedInCurrentCycle,
      formatted: `${days}天 ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
      phaseFormatted: `${phaseHours.toString().padStart(2, '0')}:${phaseMinutes.toString().padStart(2, '0')}:${phaseSeconds.toString().padStart(2, '0')}`
    };
  };
  
  // 每秒更新倒计时
  useEffect(() => {
    if (!timer?.startTime) return;
    
    const updateRemaining = () => {
      const newRemaining = calculateRemainingTime(timer.startTime);
      if (newRemaining) {
        setCurrentRemaining(newRemaining);
      }
    };
    
    // 立即更新一次
    updateRemaining();
    
    // 设置每秒更新
    const interval = setInterval(updateRemaining, 1000);
    
    return () => clearInterval(interval);
  }, [timer?.startTime]);
  
  const handleDelete = () => {
    if (window.confirm('确定要删除这个倒计时吗？')) {
      if (onDelete && typeof onDelete === 'function') {
        onDelete(index);
      }
    }
  };
  
  if (!currentRemaining || !timer) return null;
  
  return (
    <div className={`timer-card phase-${currentRemaining.currentPhase}`}>
      <div className="timer-header">
        <div className="timer-title-container">
          <div className="project-name">{timer.project}</div>
          <div className="alliance-name">{timer.alliance}</div>
        </div>
        <div className="header-actions">
          <div className={`phase-indicator ${currentRemaining.currentPhase === 1 ? '' : 'phase-2'}`}>
            {currentRemaining.currentPhase === 1 ? '可争夺阶段' : '保护阶段'}
          </div>
          <button 
            className="delete-btn" 
            onClick={handleDelete}
          >
            ×
          </button>
        </div>
      </div>
      
      <div className="timer-display">
        <div className="time-left">{currentRemaining.formatted}</div>
        <div className="time-label">当前周期剩余时间</div>
      </div>
      
      <div className="integrated-progress">
        <div className="phase-progress-info">
          <div className="phase-label">
            <div className="phase-dot"></div>
            <div className="phase-text">
              {currentRemaining.currentPhase === 1 ? '可争夺阶段 (第一天)' : '保护阶段 (后三天)'}
            </div>
          </div>
          <div className="phase-time">{currentRemaining.phaseFormatted}</div>
        </div>
        <div className="progress-container">
          <div 
            className="progress-fill" 
            style={{ width: `${currentRemaining.phaseProgress}%` }}
          ></div>
          <div className="progress-percent">{currentRemaining.phaseProgress.toFixed(1)}%</div>
        </div>
      </div>
      
      <style jsx>{`
        .timer-card {
          background: linear-gradient(145deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9));
          border-radius: 8px;
          padding: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: transform 0.3s ease, opacity 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .timer-card.phase-1 {
          border-left: 4px solid #ef4444;
        }
        
        .timer-card.phase-2 {
          border-left: 4px solid #10b981;
        }
        
        .timer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .timer-title-container {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
        }
        
        .project-name {
          font-size: 1rem;
          font-weight: 600;
          color: #fff;
        }
        
        .alliance-name {
          font-size: 0.75rem;
          color: #94a3b8;
        }
        
        .header-actions {
          display: flex;
          align-items: flex-start;
          gap: 6px;
        }
        
        .phase-indicator {
          background: rgba(239, 68, 68, 0.2);
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 0.7rem;
          font-weight: 600;
          color: #ef4444;
          white-space: nowrap;
          margin-top: 2px;
        }
        
        .phase-2 {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }
        
        .delete-btn {
          background: rgba(239, 68, 68, 0.2);
          color: #f87171;
          border: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }
        
        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.4);
          transform: scale(1.1);
        }
        
        .timer-display {
          text-align: center;
          margin: 15px 0;
        }
        
        .time-left {
          font-size: 1.3rem;
          font-weight: 700;
          background: linear-gradient(90deg, #60a5fa, #a78bfa);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          margin-bottom: 3px;
          font-family: 'Courier New', monospace;
        }
        
        .time-label {
          font-size: 0.75rem;
          color: #94a3b8;
          margin-top: 2px;
        }
        
        .integrated-progress {
          margin: 15px 0 10px;
        }
        
        .phase-progress-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
          font-size: 0.7rem;
        }
        
        .phase-label {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .phase-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #ef4444;
        }
        
        .phase-2 .phase-dot {
          background: #10b981;
        }
        
        .phase-text {
          color: #cbd5e1;
          font-weight: 500;
        }
        
        .phase-time {
          color: #fbbf24;
          font-weight: 600;
        }
        
        .progress-container {
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
          position: relative;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #60a5fa, #a78bfa);
          border-radius: 3px;
          transition: width 1s ease;
          position: relative;
        }
        
        .progress-fill::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          width: 2px;
          background: rgba(255, 255, 255, 0.5);
        }
        
        .progress-percent {
          position: absolute;
          right: 4px;
          top: -14px;
          font-size: 0.65rem;
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
}