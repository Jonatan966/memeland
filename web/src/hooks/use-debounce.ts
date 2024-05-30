import { useRef } from "react";

export function useDebounce<F extends () => void>(func: F, delayInMs: number) {
  const timerRef = useRef(-1);

  const executeFunc = () => {
    clearTimeout(timerRef.current);

    timerRef.current = Number(setTimeout(func, delayInMs));
  };

  return executeFunc;
}
