import { useEffect, useRef, useState } from 'react';

export function useInterval(callback: () => void, delay: number | null, shouldPause = false) {
  const savedCallback = useRef(callback);
  const [isPaused, setIsPaused] = useState(shouldPause);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    setIsPaused(shouldPause);
  }, [shouldPause]);

  useEffect(() => {
    if (delay === null || isPaused) return;

    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay, isPaused]);

  return {
    pause: () => setIsPaused(true),
    resume: () => setIsPaused(false),
    isPaused
  };
}