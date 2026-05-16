import { useEffect, useMemo, useState } from 'react'

type ClockThemeId =
  | 'skeuomorphic'
  | 'flat-design'
  | 'material-design'
  | 'neumorphism'
  | 'glassmorphism'
  | 'claymorphism'
  | 'brutalism'
  | 'minimalism'

const CLOCK_THEME_IDS: ClockThemeId[] = [
  'skeuomorphic',
  'flat-design',
  'material-design',
  'neumorphism',
  'glassmorphism',
  'claymorphism',
  'brutalism',
  'minimalism',
]

const clockStyles = `
  .home-clock-wrap {
    display: grid;
    place-items: center;
  }

  .clock-card {
    position: relative;
    width: 356px;
    height: 426px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 24px;
    overflow: hidden;
  }

  .clock-container {
    position: relative;
    width: 280px;
    height: 280px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .clock-face {
    position: absolute;
    width: 280px;
    height: 280px;
    border-radius: 50%;
  }

  .hour-marks {
    position: absolute;
    width: 100%;
    height: 100%;
  }

  .hour-mark {
    position: absolute;
    left: 50%;
    transform-origin: 0 140px;
  }

  .minute-mark {
    position: absolute;
    left: 50%;
    transform-origin: 0 140px;
  }

  .hour-number {
    position: absolute;
    text-align: center;
    transform-origin: center;
  }

  .hand {
    position: absolute;
    transform-origin: bottom center;
    bottom: 140px;
    left: 140px;
  }

  .skeuomorphic {
    background: linear-gradient(140deg, rgba(245, 245, 245, 1) 0%, rgba(230, 230, 230, 1) 50%, rgba(214, 214, 214, 1) 100%);
  }

  .skeuomorphic .clock-container {
    background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
    box-shadow: rgba(0, 0, 0, 0.07) 0px 1px 2px, rgba(0, 0, 0, 0.07) 0px 2px 4px, rgba(0, 0, 0, 0.07) 0px 4px 8px, rgba(0, 0, 0, 0.07) 0px 8px 16px, rgba(0, 0, 0, 0.07) 0px 16px 32px, rgba(0, 0, 0, 0.07) 0px 32px 64px, 0 2px 5px rgba(0, 0, 0, 0.3);
    border: 8px solid #fff;
    border-radius: 50%;
  }

  .skeuomorphic .clock-face {
    background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2), inset 0 0 20px rgba(0, 0, 0, 0.1), 0 2px 5px rgba(0, 0, 0, 0.3);
  }

  .skeuomorphic .clock-reflection {
    position: absolute;
    width: 260px;
    height: 130px;
    top: 20px;
    left: 10px;
    border-radius: 130px 130px 0 0;
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 100%);
    pointer-events: none;
    z-index: 11;
  }

  .skeuomorphic .clock-center {
    position: absolute;
    width: 14px;
    height: 14px;
    background: #333;
    border-radius: 50%;
    top: 133px;
    left: 133px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
    z-index: 10;
  }

  .skeuomorphic .clock-center::after {
    content: "";
    position: absolute;
    width: 6px;
    height: 6px;
    background: #888;
    border-radius: 50%;
    top: 4px;
    left: 4px;
  }

  .skeuomorphic .hour-mark {
    width: 4px;
    height: 12px;
    background: #333;
    margin-left: -2px;
  }

  .skeuomorphic .minute-mark {
    width: 2px;
    height: 6px;
    background: #666;
    margin-left: -1px;
  }

  .skeuomorphic .hour-number {
    font-size: 24px;
    font-weight: 500;
    color: #333;
    width: 40px;
    height: 40px;
    line-height: 40px;
  }

  .skeuomorphic .hour-hand {
    width: 8px;
    height: 75px;
    background: #333;
    border-radius: 10px 10px 0 0;
    box-shadow: 2px 0px 7px rgba(0, 0, 0, 0.5);
    z-index: 7;
    margin-left: -4px;
  }

  .skeuomorphic .minute-hand {
    width: 6px;
    height: 105px;
    background: #444;
    border-radius: 10px 10px 0 0;
    box-shadow: 2px 0px 6px rgba(0, 0, 0, 0.5);
    z-index: 8;
    margin-left: -3px;
  }

  .skeuomorphic .second-hand {
    width: 2px;
    height: 115px;
    background: #c00;
    box-shadow: 2px 0px 5px rgba(0, 0, 0, 0.5);
    z-index: 9;
  }

  .skeuomorphic .clock-bezel {
    position: absolute;
    width: 290px;
    height: 290px;
    top: -5px;
    left: -5px;
    border-radius: 50%;
    background: linear-gradient(135deg, #d0d0d0 0%, #f8f8f8 100%);
    z-index: -1;
  }

  .flat-design {
    background: #f2f2f7;
  }

  .flat-design .clock-face {
    background: #ffffff;
    border: 3px solid #191919;
  }

  .flat-design .clock-center {
    position: absolute;
    width: 12px;
    height: 12px;
    background: #ffcd50;
    border-radius: 50%;
    top: 134px;
    left: 134px;
    z-index: 10;
  }

  .flat-design .hour-mark {
    width: 3px;
    height: 10px;
    background: #555;
  }

  .flat-design .minute-mark {
    width: 2px;
    height: 8px;
    background: #bcbcbc;
  }

  .flat-design .hour-number {
    font-size: 24px;
    font-weight: 400;
    color: #555;
    width: 40px;
    height: 40px;
    line-height: 40px;
  }

  .flat-design .hour-hand {
    width: 6px;
    height: 70px;
    background: #555;
    z-index: 7;
    margin-left: -3px;
  }

  .flat-design .minute-hand {
    width: 4px;
    height: 95px;
    background: #777;
    z-index: 8;
    margin-left: -2px;
  }

  .flat-design .second-hand {
    width: 2px;
    height: 110px;
    background: #ffcd50;
    z-index: 9;
  }

  .material-design {
    background: #ede7f6;
  }

  .material-design .clock-face {
    background: #512da8;
    box-shadow: rgba(0, 0, 0, 0.3) 0px 19px 38px, rgba(0, 0, 0, 0.22) 0px 15px 12px;
  }

  .material-design .clock-face-inner {
    width: 62%;
    height: 62%;
    border-radius: 50%;
    background: #7e57c2;
    box-shadow: rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .material-design .clock-center {
    position: absolute;
    width: 12px;
    height: 12px;
    background: #f44336;
    border-radius: 50%;
    top: 134px;
    left: 134px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
    z-index: 10;
  }

  .material-design .hour-mark,
  .material-design .minute-mark {
    display: none;
  }

  .material-design .hour-number {
    font-size: 20px;
    font-weight: 500;
    color: #ede7f6;
    width: 40px;
    height: 40px;
    line-height: 40px;
    text-shadow: rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px;
  }

  .material-design .hour-hand {
    width: 6px;
    height: 60px;
    background: #fff;
    border-radius: 4px;
    z-index: 7;
    margin-left: -2px;
    box-shadow: rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px;
  }

  .material-design .minute-hand {
    width: 6px;
    height: 98px;
    background: #ede7f6;
    border-radius: 4px;
    z-index: 8;
    margin-left: -2px;
    box-shadow: rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px;
  }

  .material-design .second-hand {
    width: 2px;
    height: 110px;
    background: #f44336;
    z-index: 9;
    box-shadow: rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px;
  }

  .neumorphism {
    border-radius: 30px;
    background: #e8eaf6;
    box-shadow: 10px 10px 20px #d1d1d1, -10px -10px 20px #ffffff;
  }

  .neumorphism .clock-face {
    border-radius: 50%;
    background: linear-gradient(145deg, #d1d3dd, #f8faff);
    box-shadow: 20px 20px 60px #c5c7d1, -20px -20px 60px #ffffff;
  }

  .neumorphism .clock-face-inner {
    width: 62%;
    height: 62%;
    border-radius: 50%;
    z-index: 1;
    background: #e8eaf6;
    box-shadow: 20px 20px 40px #b0b2bb, -20px -20px 40px #ffffff;
  }

  .neumorphism .clock-center {
    position: absolute;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    top: 132.5px;
    left: 132.5px;
    background: linear-gradient(145deg, #f8faff, #d1d3dd);
    box-shadow: 1px 1px 2px #797a80, -1px -1px 2px #ffffff;
    z-index: 10;
  }

  .neumorphism .hour-mark {
    width: 2px;
    height: 24px;
  }

  .neumorphism .hour-mark::after {
    content: '';
    display: block;
    position: absolute;
    bottom: 0;
    width: 2px;
    height: 16px;
    border-radius: 10px;
    background: #e8eaf6;
    box-shadow: inset 1px 1px 7px #bec0ca, inset -1px -1px 7px #ffffff;
  }

  .neumorphism .minute-mark,
  .neumorphism .hour-number {
    display: none;
  }

  .neumorphism .hour-hand {
    width: 6px;
    height: 70px;
    background: #030943;
    border-radius: 3px;
    z-index: 7;
    margin-left: -2px;
  }

  .neumorphism .minute-hand {
    width: 4px;
    height: 95px;
    background: #fb9135;
    border-radius: 2px;
    z-index: 8;
    margin-left: -1px;
  }

  .neumorphism .second-hand {
    width: 3px;
    height: 110px;
    background: #b2b3c4;
    border-radius: 3px;
    z-index: 9;
  }

  .glassmorphism {
    background: linear-gradient(135deg, #cfe9dc 0%, #ddeee5 100%);
  }

  .glassmorphism .clock-face {
    background: rgba(255, 255, 255, 0.18);
    border: 1px solid rgba(255, 255, 255, 0.4);
    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.12);
    backdrop-filter: blur(8px);
  }

  .glassmorphism .clock-face::after {
    content: "";
    position: absolute;
    inset: 14px;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.18);
  }

  .glassmorphism .clock-center {
    position: absolute;
    width: 12px;
    height: 12px;
    background: rgba(255,255,255,0.94);
    border: 2px solid rgba(31, 38, 135, 0.25);
    border-radius: 50%;
    top: 134px;
    left: 134px;
    z-index: 10;
  }

  .glassmorphism .hour-mark {
    width: 4px;
    height: 14px;
    background: rgba(40, 72, 55, 0.55);
    margin-left: -2px;
    border-radius: 999px;
  }

  .glassmorphism .hour-mark::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(180deg, rgba(255,255,255,0.5), rgba(255,255,255,0));
  }

  .glassmorphism .minute-mark {
    width: 2px;
    height: 8px;
    background: rgba(40, 72, 55, 0.28);
    margin-left: -1px;
    border-radius: 999px;
  }

  .glassmorphism .minute-mark::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(180deg, rgba(255,255,255,0.45), rgba(255,255,255,0));
  }

  .glassmorphism .hour-number {
    font-size: 20px;
    font-weight: 500;
    color: rgba(27, 51, 39, 0.8);
    width: 40px;
    height: 40px;
    line-height: 40px;
  }

  .glassmorphism .hour-hand {
    width: 6px;
    height: 72px;
    background: rgba(28, 53, 41, 0.78);
    border-radius: 999px 999px 0 0;
    z-index: 7;
    margin-left: -3px;
  }

  .glassmorphism .minute-hand {
    width: 4px;
    height: 100px;
    background: rgba(40, 72, 55, 0.82);
    border-radius: 999px 999px 0 0;
    z-index: 8;
    margin-left: -2px;
  }

  .glassmorphism .second-hand {
    width: 2px;
    height: 112px;
    background: rgba(218, 91, 91, 0.95);
    z-index: 9;
  }

  .glassmorphism .shapes-container {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .glassmorphism .shapes-container::after {
    content: "";
    position: absolute;
    width: 180px;
    height: 180px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(123, 184, 151, 0.28), rgba(123, 184, 151, 0));
    top: -30px;
    right: 20px;
  }

  .glassmorphism .shape {
    position: absolute;
    border: 1px solid rgba(255,255,255,0.25);
    background: rgba(255,255,255,0.18);
    backdrop-filter: blur(8px);
  }

  .glassmorphism .shape.circle {
    width: 76px;
    height: 76px;
    border-radius: 50%;
    top: 48px;
    left: 38px;
  }

  .glassmorphism .shape.rounded-square {
    width: 92px;
    height: 92px;
    border-radius: 24px;
    bottom: 44px;
    right: 36px;
    transform: rotate(18deg);
  }

  .claymorphism {
    background: #edf3ee;
  }

  .claymorphism .clock-face {
    background: linear-gradient(145deg, #f5faf6, #d9e8dd);
    box-shadow: 0 18px 28px rgba(91, 124, 104, 0.16), inset 0 10px 14px rgba(255,255,255,0.9);
  }

  .claymorphism .clock-center {
    position: absolute;
    width: 14px;
    height: 14px;
    background: #4b6255;
    border-radius: 50%;
    top: 133px;
    left: 133px;
    z-index: 10;
  }

  .claymorphism .hour-mark {
    width: 4px;
    height: 12px;
    background: #7ea48b;
    margin-left: -2px;
    border-radius: 999px;
  }

  .claymorphism .minute-mark {
    width: 2px;
    height: 6px;
    background: rgba(126, 164, 139, 0.55);
    margin-left: -1px;
    border-radius: 999px;
  }

  .claymorphism .hour-number {
    font-size: 20px;
    font-weight: 600;
    color: #50685b;
    width: 40px;
    height: 40px;
    line-height: 40px;
  }

  .claymorphism .hour-hand {
    width: 6px;
    height: 68px;
    background: #567462;
    border-radius: 999px 999px 0 0;
    z-index: 7;
    margin-left: -3px;
  }

  .claymorphism .minute-hand {
    width: 5px;
    height: 96px;
    background: #70947e;
    border-radius: 999px 999px 0 0;
    z-index: 8;
    margin-left: -2.5px;
  }

  .claymorphism .second-hand {
    width: 2px;
    height: 110px;
    background: #d66a6a;
    z-index: 9;
  }

  .brutalism {
    background: #ffffff;
    border: 4px solid #111111;
    box-shadow: 12px 12px 0 #111111;
  }

  .brutalism .clock-face {
    background: #ffffff;
    border: 4px solid #111111;
  }

  .brutalism .clock-face-inner {
    width: 62%;
    height: 62%;
    border-radius: 50%;
    background: #ffea00;
    border: 4px solid #111111;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .brutalism .clock-face-inner-2 {
    width: 38%;
    height: 38%;
    border-radius: 50%;
    background: #ffffff;
    border: 4px solid #111111;
  }

  .brutalism .clock-center {
    position: absolute;
    width: 12px;
    height: 12px;
    background: #111111;
    border-radius: 50%;
    top: 134px;
    left: 134px;
    z-index: 10;
  }

  .brutalism .hour-mark {
    width: 4px;
    height: 18px;
    background: #111111;
    margin-left: -2px;
  }

  .brutalism .hour-mark::after {
    content: "";
    position: absolute;
    width: 10px;
    height: 10px;
    background: #ff4f4f;
    left: -3px;
    top: 0;
  }

  .brutalism .minute-mark,
  .brutalism .second-hand,
  .brutalism .hour-number {
    display: none;
  }

  .brutalism .hour-hand {
    width: 8px;
    height: 40px;
    background: #000;
    z-index: 7;
    border-radius: 5px;
    margin-left: -4px;
  }

  .brutalism .minute-hand {
    width: 8px;
    height: 64px;
    background: #000;
    z-index: 8;
    border-radius: 5px;
    margin-left: -4px;
  }

  .minimalism {
    background: #ffffff;
  }

  .minimalism .clock-face {
    background: #ffffff;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  }

  .minimalism .clock-center {
    position: absolute;
    width: 8px;
    height: 8px;
    background: #111;
    border-radius: 50%;
    top: 136px;
    left: 136px;
    z-index: 10;
  }

  .minimalism .hour-mark {
    width: 1px;
    height: 8px;
    background: #111;
    margin-left: -0.5px;
    opacity: 0.2;
  }

  .minimalism .minute-mark {
    width: 1px;
    height: 4px;
    background: #111;
    margin-left: -0.5px;
    opacity: 0.1;
  }

  .minimalism .hour-number {
    font-size: 18px;
    font-weight: 300;
    color: #111;
    width: 40px;
    height: 40px;
    line-height: 40px;
    opacity: 0.5;
  }

  .minimalism .hour-number:nth-child(3n) {
    opacity: 1;
  }

  .minimalism .hour-hand {
    width: 3px;
    height: 65px;
    background: #111;
    border-radius: 1.5px;
    z-index: 7;
  }

  .minimalism .minute-hand {
    width: 2px;
    height: 90px;
    background: #111;
    border-radius: 1px;
    z-index: 8;
  }

  .minimalism .second-hand {
    width: 1px;
    height: 110px;
    background: #ff3b30;
    z-index: 9;
  }

  @media (max-width: 1024px) {
    .clock-card {
      width: 320px;
      height: 392px;
      transform: scale(0.94);
      transform-origin: center;
    }
  }

  @media (max-width: 768px) {
    .clock-card {
      width: 100%;
      max-width: 356px;
      height: 392px;
      transform: scale(0.92);
    }
  }
`

function getThemeDecor(themeId: ClockThemeId) {
  return {
    showBezel: themeId === 'skeuomorphic',
    showReflection: themeId === 'skeuomorphic',
    showInnerFace: themeId === 'material-design' || themeId === 'neumorphism' || themeId === 'brutalism',
    showInnerFaceSecond: themeId === 'brutalism',
    showShapes: themeId === 'glassmorphism',
  }
}

function formatTime(now: Date): string {
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
}

export default function HomeClock() {
  const [now, setNow] = useState(() => new Date())
  const [themeId] = useState<ClockThemeId>(() => {
    const randomIndex = Math.floor(Math.random() * CLOCK_THEME_IDS.length)
    return CLOCK_THEME_IDS[randomIndex]
  })

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => {
      window.clearInterval(timer)
    }
  }, [])

  const themeDecor = useMemo(() => getThemeDecor(themeId), [themeId])
  const hours24 = now.getHours()
  const hours = hours24 % 12 || 12
  const minutes = now.getMinutes()
  const seconds = now.getSeconds()
  const hourDegrees = (hours % 12) * 30 + minutes * 0.5
  const minuteDegrees = minutes * 6 + seconds * 0.1
  const secondDegrees = seconds * 6

  return (
    <div className="home-clock-wrap">
      <style>{clockStyles}</style>
      <div className={`clock-card ${themeId}`} aria-label={`当前时间 ${formatTime(now)}`}>
        <div className="clock-container">
          {themeDecor.showShapes ? (
            <div className="shapes-container">
              <div className="shape circle" />
              <div className="shape rounded-square" />
            </div>
          ) : null}
          {themeDecor.showBezel ? <div className="clock-bezel" /> : null}
          {themeDecor.showInnerFace ? (
            <div className="clock-face-inner">
              {themeDecor.showInnerFaceSecond ? <div className="clock-face-inner-2" /> : null}
            </div>
          ) : null}
          <div className="clock-face">
            {Array.from({ length: 12 }, (_, index) => {
              const label = index === 0 ? 12 : index
              const angle = index * 30
              const radius = 112
                const x = 140 + radius * Math.sin((angle * Math.PI) / 180)
                const y = 140 - radius * Math.cos((angle * Math.PI) / 180)

              return (
                <div
                  key={`number-${index}`}
                  className="hour-number"
                  style={{
                    left: x - 20,
                    top: y - 20,
                  }}
                >
                  {label}
                </div>
              )
            })}
          </div>
          {themeDecor.showReflection ? <div className="clock-reflection" /> : null}
          <div className="hour-marks">
            {Array.from({ length: 12 }, (_, index) => (
              <div
                key={`hour-${index}`}
                className="hour-mark"
                style={{ transform: `rotate(${index * 30}deg)` }}
              />
            ))}
            {Array.from({ length: 60 }, (_, index) => {
              if (index % 5 === 0) {
                return null
              }

              return (
                <div
                  key={`minute-${index}`}
                  className="minute-mark"
                  style={{ transform: `rotate(${index * 6}deg)` }}
                />
              )
            })}
          </div>
          <div className="hour-hand hand" style={{ transform: `rotate(${hourDegrees}deg)` }} />
          <div className="minute-hand hand" style={{ transform: `rotate(${minuteDegrees}deg)` }} />
          <div className="second-hand hand" style={{ transform: `rotate(${secondDegrees}deg)` }} />
          <div className="clock-center" />
        </div>
      </div>
    </div>
  )
}
