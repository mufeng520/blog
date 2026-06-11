import React, { useState, useEffect, useCallback } from 'react';
import { getAnnouncements } from '../data/changelog';

interface Props {
  onClick?: () => void;
}

const AnnouncementBar: React.FC<Props> = ({ onClick }) => {
  const announcements = getAnnouncements();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'up' | 'down'>('up');

  const goToNext = useCallback(() => {
    if (announcements.length <= 1) return;
    setDirection('up');
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
      setIsAnimating(false);
    }, 300);
  }, [announcements.length]);

  const goToPrev = useCallback(() => {
    if (announcements.length <= 1) return;
    setDirection('down');
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
      setIsAnimating(false);
    }, 300);
  }, [announcements.length]);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (announcements.length <= 1) return;
    const timer = setInterval(goToNext, 5000);
    return () => clearInterval(timer);
  }, [goToNext, announcements.length]);

  if (announcements.length === 0) return null;

  return (
    <div
      onClick={onClick}
      className="h-8 bg-gradient-to-r from-teal-600 to-teal-500 dark:from-teal-800 dark:to-teal-700 flex items-center justify-center relative cursor-pointer hover:brightness-105 transition-all group"
      title="点击查看更新日志"
    >
      {/* Scroll arrows */}
      {announcements.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); goToPrev(); }}
            className="absolute left-2 p-0.5 text-white/60 hover:text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goToNext(); }}
            className="absolute right-2 p-0.5 text-white/60 hover:text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </>
      )}

      {/* Ticker content */}
      <div className="overflow-hidden h-full flex items-center max-w-[70%]">
        <div
          className={`text-xs text-white font-medium whitespace-nowrap transition-transform duration-300 ${
            isAnimating
              ? direction === 'up'
                ? '-translate-y-full opacity-0'
                : 'translate-y-full opacity-0'
              : 'translate-y-0 opacity-100'
          }`}
        >
          {announcements[currentIndex]}
        </div>
      </div>

      {/* Dots indicator */}
      {announcements.length > 1 && (
        <div className="absolute bottom-0.5 flex gap-1">
          {announcements.map((_, idx) => (
            <div
              key={idx}
              className={`w-1 h-1 rounded-full transition-all ${
                idx === currentIndex ? 'bg-white' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      )}

      {/* New badge */}
      <span className="absolute right-8 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-white/20 rounded text-[9px] text-white font-bold">
        NEW
      </span>
    </div>
  );
};

export default AnnouncementBar;
