import { useEffect } from 'react';

const useScrollerUp = (scrollPosition: number = 0) => {
  useEffect(() => {
    window.scrollTo({
      top: scrollPosition,
      behavior: 'instant',
    });
  }, [scrollPosition]);
};

export default useScrollerUp;

