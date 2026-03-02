import { useEffect } from 'react';

const useScrollerUp = (scrollPosition: number = 0) => {
  useEffect(() => {
    console.log("scroller")
    
    window.scrollTo({
      top: scrollPosition,
      behavior: 'smooth',
    });
  }, [scrollPosition]);
};

export default useScrollerUp;

