import React, { useState } from 'react';
import type { Timer } from '../types/wjdrgcz';

interface TimerFormProps {
  onAddTimer: (timer: Timer) => void;
}

export default function TimerForm({ onAddTimer }: TimerFormProps) {
  const [project, setProject] = useState('');
  const [alliance, setAlliance] = useState('');
  const [days, setDays] = useState('0');
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('0');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!project.trim()) {
      alert('请输入工程站名称');
      return;
    }
    
    if (!alliance.trim()) {
      alert('请输入所属联盟');
      return;
    }
    
    const daysNum = parseInt(days) || 0;
    const hoursNum = parseInt(hours) || 0;
    const minutesNum = parseInt(minutes) || 0;
    
    const totalRemainingSeconds = (daysNum * 24 * 60 * 60) + (hoursNum * 60 * 60) + (minutesNum * 60);
    const totalCycleSeconds = 24 * 60 * 60 + 72 * 60 * 60; // 345600秒
    
    if (totalRemainingSeconds > totalCycleSeconds) {
      alert('剩余时间不能超过4天（96小时）');
      return;
    }
    
    // 根据剩余时间计算开始时间
    const now = new Date();
    const elapsedSeconds = totalCycleSeconds - totalRemainingSeconds;
    const startTime = new Date(now.getTime() - (elapsedSeconds * 1000));
    
    const newTimer: Timer = {
      project: project.trim(),
      alliance: alliance.trim(),
      startTime: startTime.toISOString(),
      createdAt: new Date().toISOString()
    };
    
    if (onAddTimer) {
      onAddTimer(newTimer);
    }
    
    // 清空表单
    setProject('');
    setAlliance('');
    setDays('0');
    setHours('0');
    setMinutes('0');
  };
  
  const setPresetTime = (presetDays: number, presetHours: number, presetMinutes: number) => {
    setDays(presetDays.toString());
    setHours(presetHours.toString());
    setMinutes(presetMinutes.toString());
  };
  
  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <div className="input-item">
            <label htmlFor="projectName">工程站名称</label>
            <input 
              type="text" 
              id="projectName"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              placeholder="例如：阿尔法站、贝塔站"
              required
            />
          </div>
          <div className="input-item">
            <label htmlFor="allianceName">所属联盟</label>
            <input 
              type="text" 
              id="allianceName"
              value={alliance}
              onChange={(e) => setAlliance(e.target.value)}
              placeholder="例如：星辰联盟、光辉联盟"
              required
            />
          </div>
          <div className="input-item">
            <label>剩余时间 (天:时:分)</label>
            <div className="time-input-group">
              <div className="time-input-item">
                <input 
                  type="number" 
                  id="days"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  placeholder="天" 
                  min="0" 
                  max="4"
                  required
                />
              </div>
              <div className="time-separator">:</div>
              <div className="time-input-item">
                <input 
                  type="number" 
                  id="hours"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="时" 
                  min="0" 
                  max="23"
                  required
                />
              </div>
              <div className="time-separator">:</div>
              <div className="time-input-item">
                <input 
                  type="number" 
                  id="minutes"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  placeholder="分" 
                  min="0" 
                  max="59"
                  required
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="preset-times">
          <button 
            type="button" 
            className="preset-time"
            onClick={() => setPresetTime(0, 1, 0)}
          >
            还剩1小时
          </button>
          <button 
            type="button" 
            className="preset-time"
            onClick={() => setPresetTime(0, 6, 0)}
          >
            还剩6小时
          </button>
          <button 
            type="button" 
            className="preset-time"
            onClick={() => setPresetTime(0, 12, 0)}
          >
            还剩12小时
          </button>
          <button 
            type="button" 
            className="preset-time"
            onClick={() => setPresetTime(1, 0, 0)}
          >
            还剩1天
          </button>
          <button 
            type="button" 
            className="preset-time"
            onClick={() => setPresetTime(3, 0, 0)}
          >
            还剩3天
          </button>
        </div>
        
        <div style={{ marginTop: '15px' }}>
          <button type="submit">添加倒计时</button>
        </div>
      </form>
      
      <style jsx>{`
        .form-container {
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(10px);
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 15px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .input-group {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 10px;
        }
        
        .input-item {
          flex: 1;
          min-width: 160px;
        }
        
        .time-input-group {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        
        .time-input-item {
          flex: 1;
        }
        
        .time-input-item input {
          text-align: center;
        }
        
        .time-separator {
          color: #94a3b8;
          font-size: 0.9rem;
        }
        
        label {
          display: block;
          margin-bottom: 3px;
          color: #60a5fa;
          font-weight: 500;
          font-size: 0.8rem;
        }
        
        input {
          width: 100%;
          padding: 7px 9px;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          color: white;
          font-size: 0.85rem;
          transition: all 0.3s ease;
        }
        
        input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }
        
        button {
          background: linear-gradient(90deg, #3b82f6, #6366f1);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-right: 6px;
        }
        
        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
        }
        
        .preset-times {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 10px;
        }
        
        .preset-time {
          background: rgba(59, 130, 246, 0.2);
          border: none;
          color: #60a5fa;
          padding: 6px 10px;
          border-radius: 4px;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .preset-time:hover {
          background: rgba(59, 130, 246, 0.4);
          transform: translateY(-1px);
        }
        
        @media (max-width: 768px) {
          .time-input-group {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
}