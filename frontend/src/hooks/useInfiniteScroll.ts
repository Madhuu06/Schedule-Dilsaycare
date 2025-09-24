import { useState, useEffect, useCallback, useRef } from 'react';

export const useInfiniteScroll = (callback: () => void, threshold: number = 200) => {
  const [isFetching, setIsFetching] = useState(false);
  const callbackRef = useRef(callback);
  
  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const handleScroll = useCallback(() => {
    if (isFetching) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    
    // Temporary debug - will remove once working
    console.log('Scroll check:', { distanceFromBottom, threshold, scrollHeight, scrollTop, clientHeight });
    
    if (distanceFromBottom <= threshold) {
      console.log('Triggering infinite scroll');
      setIsFetching(true);
    }
  }, [threshold, isFetching]);

  useEffect(() => {
    const throttledHandleScroll = () => {
      handleScroll();
    };
    
    window.addEventListener('scroll', throttledHandleScroll);
    return () => window.removeEventListener('scroll', throttledHandleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (isFetching) {
      const executeCallback = async () => {
        try {
          await callbackRef.current();
        } catch (error) {
          console.error('Error in infinite scroll callback:', error);
        } finally {
          setIsFetching(false);
        }
      };
      executeCallback();
    }
  }, [isFetching]);

  return [isFetching, setIsFetching] as const;
};