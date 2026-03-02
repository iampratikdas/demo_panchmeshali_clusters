
import React, { useRef, useEffect, useState } from "react";

const StatsShowcase: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
   <section
  id="stats"
  className="relative py-16 bg-[url('indianart.png')] bg-cover bg-center"
>
  {/* Dark overlay */}
  <div className="absolute inset-0 bg-black/60 shadow-[rgba(50,50,93,0.25)_0px_30px_60px_-12px_inset,rgba(0,0,0,0.3)_0px_18px_36px_-18px_inset]"></div>

  <div className="relative max-w-6xl mx-auto px-6">
    <div 
      ref={ref}
      className={`text-center transition-all duration-1000 ${
        isVisible ? 'animate-fade-in opacity-100' : 'opacity-0'
      }`}
    >
      <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
        Our Growing Community
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        <div className={`text-center transition-all duration-1000 delay-200 ${
          isVisible ? 'animate-slide-in-left opacity-100' : 'opacity-0'
        }`}>
          <div className="text-5xl md:text-6xl font-bold text-white mb-2">
            2M+
          </div>
          <p className="text-lg text-white/90">Readers Worldwide</p>
        </div>
        
        <div className={`text-center transition-all duration-1000 delay-400 ${
          isVisible ? 'animate-fade-in opacity-100' : 'opacity-0'
        }`}>
          <div className="text-5xl md:text-6xl font-bold text-white mb-2">
            500+
          </div>
          <p className="text-lg text-white/90">Creative Writers</p>
        </div>
        
        <div className={`text-center transition-all duration-1000 delay-600 ${
          isVisible ? 'animate-slide-in-right opacity-100' : 'opacity-0'
        }`}>
          <div className="text-5xl md:text-6xl font-bold text-white mb-2">
            200+
          </div>
          <p className="text-lg text-white/90">Skilled Recitors</p>
        </div>
      </div>
      
      <p className={`text-lg text-white/90 mt-8 max-w-3xl mx-auto transition-all duration-1000 delay-800 ${
        isVisible ? 'animate-fade-in opacity-100' : 'opacity-0'
      }`}>
        Join our vibrant community of passionate readers exploring new worlds through poetry and creative writing.
      </p>
    </div>
  </div>
</section>

  );
};

export default StatsShowcase;
