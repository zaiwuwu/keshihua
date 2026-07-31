import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * 自定义快速滚动条
 * 替代移动端原生滚动条，显示为右侧轨道 + 比例滑块
 * @param {string} containerId - 滚动容器 ID，默认监听 window
 */
export default function CustomScrollbar({ containerId }) {
  const [thumbH, setThumbH] = useState(40);
  const [thumbTop, setThumbTop] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef(null);
  const startRef = useRef({ y: 0, top: 0 });

  const getScrollEl = useCallback(() => {
    if (containerId) return document.getElementById(containerId);
    return null;
  }, [containerId]);

  const updateThumb = useCallback(() => {
    const el = getScrollEl();
    const viewH = el ? el.clientHeight : window.innerHeight;
    const totalH = el ? el.scrollHeight : document.documentElement.scrollHeight;
    const scrollT = el ? el.scrollTop : window.scrollY;

    if (totalH <= viewH) { setVisible(false); return; }
    setVisible(true);

    const trackH = viewH - 16;
    const th = Math.max(30, (viewH / totalH) * trackH);
    const maxTop = trackH - th;
    const pct = scrollT / (totalH - viewH);
    setThumbH(th);
    setThumbTop(pct * maxTop);
  }, [getScrollEl]);

  useEffect(() => {
    updateThumb();
    const el = getScrollEl();
    const target = el || window;
    target.addEventListener('scroll', updateThumb, { passive: true });
    window.addEventListener('resize', updateThumb);
    return () => {
      target.removeEventListener('scroll', updateThumb);
      window.removeEventListener('resize', updateThumb);
    };
  }, [updateThumb, getScrollEl]);

  const handleStart = (e) => {
    setDragging(true);
    const touch = e.touches ? e.touches[0] : e;
    startRef.current = { y: touch.clientY, top: thumbTop };
    e.preventDefault();
  };

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e) => {
      const touch = e.touches ? e.touches[0] : e;
      const dy = touch.clientY - startRef.current.y;
      const el = getScrollEl();
      const viewH = el ? el.clientHeight : window.innerHeight;
      const totalH = el ? el.scrollHeight : document.documentElement.scrollHeight;
      const trackH = viewH - 16;
      const maxTop = trackH - thumbH;
      const newTop = Math.max(0, Math.min(maxTop, startRef.current.top + dy));
      const pct = newTop / maxTop;
      const scrollTarget = pct * (totalH - viewH);
      if (el) {
        el.scrollTop = scrollTarget;
      } else {
        window.scrollTo(0, scrollTarget);
      }
    };
    const handleEnd = () => setDragging(false);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [dragging, thumbH, getScrollEl]);

  if (!visible) return null;

  return (
    <div
      ref={dragRef}
      className="fixed right-0 top-0 h-full z-50 pointer-events-none"
      style={{ width: '10px', touchAction: 'none' }}
    >
      {/* 轨道 */}
      <div
        className="absolute rounded-full"
        style={{ right: '2px', top: '8px', bottom: '8px', width: '4px', backgroundColor: '#e2e8f0' }}
      />
      {/* 滑块 */}
      <div
        className="absolute rounded-full pointer-events-auto cursor-pointer transition-colors duration-150"
        style={{
          right: '0px',
          top: 8 + thumbTop,
          height: thumbH,
          width: '10px',
          backgroundColor: dragging ? '#475569' : '#64748b',
        }}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
      />
    </div>
  );
}
