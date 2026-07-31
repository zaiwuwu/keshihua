import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * 右下角悬浮一键到底/回顶按钮
 * @param {string} containerId - 滚动容器 ID，默认滚动 window
 */
export default function FloatingScrollButton({ containerId }) {
  const [atBottom, setAtBottom] = useState(false);
  const [visible, setVisible] = useState(false);

  const getScrollEl = useCallback(() => {
    if (containerId) return document.getElementById(containerId);
    return null;
  }, [containerId]);

  const isOverflow = useCallback(() => {
    const el = getScrollEl();
    if (el) return el.scrollHeight > el.clientHeight;
    return document.documentElement.scrollHeight > window.innerHeight;
  }, [getScrollEl]);

  const checkPosition = useCallback(() => {
    if (!isOverflow()) { setVisible(false); return; }
    setVisible(true);
    const el = getScrollEl();
    if (el) {
      setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 20);
    } else {
      setAtBottom(window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 20);
    }
  }, [isOverflow, getScrollEl]);

  useEffect(() => {
    checkPosition();
    const el = getScrollEl();
    const target = el || window;
    target.addEventListener('scroll', checkPosition, { passive: true });
    window.addEventListener('resize', checkPosition);
    return () => {
      target.removeEventListener('scroll', checkPosition);
      window.removeEventListener('resize', checkPosition);
    };
  }, [checkPosition, getScrollEl]);

  const handleClick = () => {
    const el = getScrollEl();
    if (el) {
      el.scrollTo({ top: atBottom ? 0 : el.scrollHeight, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: atBottom ? 0 : document.documentElement.scrollHeight, behavior: 'smooth' });
    }
  };

  if (!visible) return null;

  return (
    <button
      onClick={handleClick}
      className="fixed right-4 bottom-20 z-40 w-10 h-10 rounded-full border shadow-lg flex items-center justify-center active:opacity-80 transition-colors"
      style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', color: '#6b7280' }}
      aria-label={atBottom ? '回到顶部' : '滚动到底部'}
    >
      {atBottom ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
    </button>
  );
}
