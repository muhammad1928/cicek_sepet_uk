import { useRef, useState, useEffect, useCallback } from 'react';

export const useScrollContainer = (dependencies = []) => {
  const scrollRef = useRef(null);
  
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const dragState = useRef({ startX: 0, scrollLeft: 0 });

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 2);
    
    const hasOverflow = scrollWidth > clientWidth;
    const isAtEnd = Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 1;
    setCanScrollRight(hasOverflow && !isAtEnd);
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(checkScroll);
    const t1 = setTimeout(checkScroll, 50);
    const t2 = setTimeout(checkScroll, 300);

    window.addEventListener('resize', checkScroll);
    
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', checkScroll);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkScroll, ...dependencies]);

  const scrollBy = useCallback((direction) => {
    const el = scrollRef.current;
    if (!el) return;
    
    const scrollAmount = direction === 'left' ? -300 : 300;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    setTimeout(checkScroll, 350);
  }, [checkScroll]);

  const onMouseDown = useCallback((e) => {
    const el = scrollRef.current;
    if (!el) return;
    
    dragState.current = {
      startX: e.pageX - el.offsetLeft,
      scrollLeft: el.scrollLeft
    };
  }, []);

  const onMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const onMouseUp = useCallback(() => {
    setTimeout(() => setIsDragging(false), 10);
    checkScroll();
  }, [checkScroll]);

  const onMouseMove = useCallback((e) => {
    const el = scrollRef.current;
    if (!el || e.buttons !== 1) return;
    
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - dragState.current.startX) * 2;
    el.scrollLeft = dragState.current.scrollLeft - walk;
    
    if (Math.abs(walk) > 5) {
      setIsDragging(true);
    }
    checkScroll();
  }, [checkScroll]);

  const scrollToStart = useCallback(() => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) {
        el.scrollTo({ left: 0, behavior: 'auto' });
      }
    });
  }, []);

  // Return individual values, not nested objects
  return {
    scrollRef,
    canScrollLeft,
    canScrollRight,
    isDragging,
    scrollBy,
    scrollToStart,
    onScroll: checkScroll,
    onMouseDown,
    onMouseLeave,
    onMouseUp,
    onMouseMove
  };
};