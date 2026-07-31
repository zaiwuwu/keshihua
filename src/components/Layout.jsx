import { useRef, useCallback, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FileText, Bell, User } from 'lucide-react';
import { App } from '@capacitor/app';

const tabs = [
  { to: '/quotation', icon: FileText, label: '产品' },
  { to: '/messages', icon: Bell, label: '消息' },
  { to: '/profile', icon: User, label: '我的' },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const hideTab = location.pathname.includes('/new') || location.pathname.includes('/import') || location.pathname.includes('/volume');
  const touchRef = useRef({ startX: 0, startY: 0 });

  const currentIndex = tabs.findIndex((t) => location.pathname.startsWith(t.to));

  // Android 返回键：逐级返回，不一次性退出
  useEffect(() => {
    let exitTimer = null;
    let pluginHandler = null;
    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        if (exitTimer) {
          App.exitApp();
        } else {
          exitTimer = setTimeout(() => { exitTimer = null; }, 2000);
        }
      }
    }).then((h) => { pluginHandler = h; }).catch(() => {});
    return () => {
      if (pluginHandler) pluginHandler.remove();
      if (exitTimer) clearTimeout(exitTimer);
    };
  }, []);

  const handleTouchStart = useCallback((e) => {
    touchRef.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY };
  }, []);

  const handleTouchEnd = useCallback((e) => {
    const { startX, startY } = touchRef.current;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const dx = endX - startX;
    const dy = endY - startY;

    if (Math.abs(dx) < Math.abs(dy)) return;
    if (Math.abs(dx) < 60) return;
    if (hideTab || currentIndex === -1) return;

    if (dx < 0 && currentIndex < tabs.length - 1) {
      navigate(tabs[currentIndex + 1].to);
    } else if (dx > 0 && currentIndex > 0) {
      navigate(tabs[currentIndex - 1].to);
    }
  }, [currentIndex, hideTab, navigate]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* ===== 桌面端侧边栏 (lg+) ===== */}
      <nav className="hidden lg:flex lg:flex-col lg:w-56 lg:bg-white lg:border-r lg:border-gray-200 lg:flex-shrink-0">
        <div className="p-5 border-b border-gray-100">
          <h1 className="text-lg font-bold text-blue-600">九顺</h1>
          <p className="text-xs text-gray-400 mt-0.5">餐盒报价与成本管控</p>
        </div>
        <div className="flex-1 flex flex-col gap-1 p-3">
          {tabs.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
        <div className="p-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">v1.3.1</p>
        </div>
      </nav>

      {/* ===== 主内容区 ===== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 状态栏安全区（移动端） */}
        <div className="lg:hidden flex-shrink-0" style={{ height: 'var(--sat)', backgroundColor: '#2563eb' }} />

        <div
          id="main-scroll"
          className="flex-1 overflow-y-auto"
          style={{
            overscrollBehavior: 'none',
            WebkitOverflowScrolling: 'touch',
            paddingBottom: 'calc(60px + var(--sab))',
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="max-w-5xl mx-auto">
            <Outlet />
          </div>
        </div>

        {/* 内部人员标识 — 始终显示 */}
        <div
          className="fixed bottom-1 left-0 right-0 text-center pointer-events-none select-none z-40"
          style={{ paddingBottom: hideTab ? 'calc(4px + var(--sab, 0px))' : 'calc(64px + var(--sab, 0px))' }}
        >
          <span className="text-[10px] tracking-wider opacity-40" style={{ color: '#9ca3af' }}>
            仅供天津市九顺科技有限公司内部人员使用
          </span>
        </div>

        {/* ===== 移动端底部导航 (lg以下) ===== */}
        {!hideTab && (
          <nav
            className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex items-center z-50"
            style={{
              borderColor: '#e5e7eb',
              backgroundColor: '#ffffff',
              paddingBottom: 'var(--sab)',
            }}
          >
            {tabs.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center py-2 text-xs gap-1 transition-colors ${
                    isActive ? 'text-blue-600' : 'text-gray-500'
                  }`
                }
                style={({ isActive }) => ({
                  color: isActive ? '#2563eb' : '#6b7280',
                })}
              >
                <Icon size={20} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
