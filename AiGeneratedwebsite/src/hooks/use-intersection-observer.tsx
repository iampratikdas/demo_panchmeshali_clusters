
import { useState, useEffect, useRef } from 'react';

interface UseInViewOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  triggerOnce?: boolean;
}

export function useInView({
  root = null,
  rootMargin = '0px',
  threshold = 0,
  triggerOnce = false,
}: UseInViewOptions = {}) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLElement | null>(null);
  const enteredView = useRef(false);
  
  useEffect(() => {
    const node = ref.current;
    
    // Early return if the ref hasn't been set yet
    if (!node) return;
    
    // Skip if we've already seen it and triggerOnce is true
    if (triggerOnce && enteredView.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;
        
        // Update state
        setInView(isIntersecting);
        
        // Track if element has ever been in view
        if (isIntersecting) {
          enteredView.current = true;
        }
        
        // Unobserve if triggerOnce is true and the element is in view
        if (triggerOnce && isIntersecting && observer) {
          observer.unobserve(node);
        }
      },
      { root, rootMargin, threshold }
    );
    
    observer.observe(node);
    
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [root, rootMargin, threshold, triggerOnce]);
  
  return { ref, inView };
}
