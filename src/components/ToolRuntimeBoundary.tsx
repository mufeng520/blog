import React, { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  toolName: string;
};

type State = {
  error: Error | null;
};

const wrapperStyle: React.CSSProperties = {
  minHeight: '100vh',
  background:
    'radial-gradient(circle at top left, rgba(177, 220, 196, 0.42), transparent 36%),' +
    'radial-gradient(circle at top right, rgba(206, 235, 220, 0.5), transparent 32%),' +
    'linear-gradient(180deg, #fafdfe 0%, #f6fbf8 52%, #f9fcfa 100%)',
  color: '#24332d',
  fontFamily: '"Outfit", "PingFang SC", "Microsoft YaHei", sans-serif',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
};

const cardStyle: React.CSSProperties = {
  maxWidth: '420px',
  width: '100%',
  borderRadius: '28px',
  border: '1px solid rgba(142, 175, 156, 0.22)',
  background: 'rgba(255, 255, 255, 0.84)',
  boxShadow: '0 22px 54px rgba(89, 124, 106, 0.12)',
  backdropFilter: 'blur(20px)',
  padding: '32px 28px',
  textAlign: 'center',
};

const eyebrowStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '6px 12px',
  borderRadius: '999px',
  background: 'rgba(105, 179, 143, 0.12)',
  color: '#4d9273',
  fontSize: '0.74rem',
  letterSpacing: '0.08em',
  marginBottom: '14px',
};

const titleStyle: React.CSSProperties = {
  fontFamily: '"Noto Serif SC", serif',
  fontSize: '1.5rem',
  fontWeight: 700,
  color: '#24332d',
  margin: 0,
};

const mutedStyle: React.CSSProperties = {
  marginTop: '10px',
  color: '#6c7f75',
  fontSize: '0.92rem',
  lineHeight: 1.7,
};

const spinnerStyle: React.CSSProperties = {
  width: '44px',
  height: '44px',
  borderRadius: '50%',
  border: '3px solid rgba(105, 179, 143, 0.2)',
  borderTopColor: '#4d9273',
  margin: '0 auto 18px',
  animation: 'mufeng-tool-spin 0.9s linear infinite',
};

const backLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  marginTop: '20px',
  padding: '8px 14px',
  borderRadius: '999px',
  border: '1px solid rgba(142, 175, 156, 0.22)',
  background: 'rgba(248, 252, 249, 0.9)',
  color: '#4d9273',
  fontSize: '0.85rem',
  textDecoration: 'none',
};

export function ToolLoading({ toolName }: { toolName: string }) {
  return (
    <div style={wrapperStyle}>
      <style>{`@keyframes mufeng-tool-spin{to{transform:rotate(360deg)}}`}</style>
      <div style={cardStyle}>
        <div style={spinnerStyle} />
        <span style={eyebrowStyle}>木风 · 工具箱</span>
        <h1 style={titleStyle}>{toolName}</h1>
        <p style={mutedStyle}>正在初始化工具运行时，请稍候…</p>
        <a href="/tools/" style={backLinkStyle}>← 返回工具箱</a>
      </div>
    </div>
  );
}

const errorWrapperStyle: React.CSSProperties = {
  ...wrapperStyle,
  background:
    'radial-gradient(circle at top right, rgba(255, 213, 200, 0.55), transparent 32%),' +
    'linear-gradient(180deg, #fff9f6 0%, #fff3ed 50%, #fdf1ec 100%)',
};

const errorCardStyle: React.CSSProperties = {
  ...cardStyle,
  maxWidth: '640px',
  textAlign: 'left',
};

const errorEyebrowStyle: React.CSSProperties = {
  ...eyebrowStyle,
  background: 'rgba(214, 96, 64, 0.12)',
  color: '#b54a25',
};

const preStyle: React.CSSProperties = {
  marginTop: '16px',
  padding: '14px 16px',
  borderRadius: '16px',
  background: 'rgba(36, 51, 45, 0.92)',
  color: '#f6fbf8',
  fontSize: '0.75rem',
  lineHeight: 1.55,
  maxHeight: '280px',
  overflow: 'auto',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
};

export class ToolRuntimeBoundary extends Component<Props, State> {
  state: State = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`${this.props.toolName} failed to render`, error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={errorWrapperStyle}>
          <div style={errorCardStyle}>
            <span style={errorEyebrowStyle}>运行时报错</span>
            <h1 style={titleStyle}>{this.props.toolName} 启动失败</h1>
            <p style={mutedStyle}>
              工具在加载过程中遇到了异常。已记录到浏览器控制台，可以稍后重试或联系站长。
            </p>
            <pre style={preStyle}>
              {this.state.error.stack || this.state.error.message}
            </pre>
            <a href="/tools/" style={backLinkStyle}>← 返回工具箱</a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
