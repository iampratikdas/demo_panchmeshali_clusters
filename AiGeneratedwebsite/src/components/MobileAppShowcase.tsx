
import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Button } from "@/components/ui/button";
import BookCarousel from './BookCarousel';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useInView } from '@/hooks/use-intersection-observer';
import { useIsMobile } from '@/hooks/use-mobile';
import { Smartphone } from 'lucide-react';
import { ClipLoader } from "react-spinners";

// Lazy load the 3D model to improve initial page load
const LazySmartphoneModel = React.lazy(() => import('./3d/SmartphoneModel'));

const MobileAppShowcase: React.FC = () => {
  const { ref: inViewRef, inView } = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });
  
  const isMobile = useIsMobile();
  const [showCanvas, setShowCanvas] = useState(false);
  
  useEffect(() => {
    if (inView) {
      const timer = setTimeout(() => {
        setShowCanvas(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [inView]);
  
  return (
    <section id="app-showcase" ref={inViewRef} className=" py-16 md:py-24 relative overflow-hidden bg-gradient-to-b from-white to-panchmeshali-brownlight relative top-[-45px] rounded-t-[50px]">
      {/* <div className="absolute inset-0 bg-black/60 shadow-[rgba(50,50,93,0.25)_0px_30px_60px_-12px_inset,rgba(0,0,0,0.3)_0px_18px_36px_-18px_inset]"></div> */}
      <div className="absolute w-96 h-96 bg-panchmeshali-accent rounded-full filter blur-3xl opacity-20 -top-48 -right-48"></div>
      <div className="absolute w-96 h-96 bg-panchmeshali-lightPurple rounded-full filter blur-3xl opacity-20 -bottom-48 -left-48"></div>
      
      <div className="container mx-auto px-6 lg:px-8">
        <div className={`text-center mb-16 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6 text-black">
            Coming Soon to <span style={{ color: "hsl(var(--brown))" }}>Android</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
            Publish and discover ebooks on the go with our upcoming Android app,
            connecting writers and readers like never before.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className={`h-[400px] md:h-[500px] relative transition-all duration-700 delay-300 ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            {showCanvas && (
              <Canvas shadows dpr={[1, 2]} className="w-full h-full">
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={45} />
                <Suspense fallback={null}>
                  <LazySmartphoneModel position={[0, 0, 0]} />
                  {/* <img src="/images/mockup.png" alt="Mockup"  className="w-full h-full object-cover" /> */}
                </Suspense>
                <OrbitControls 
                  enableZoom={false} 
                  enablePan={false}
                  minPolarAngle={Math.PI / 2.5}
                  maxPolarAngle={Math.PI / 1.5}
                />
              </Canvas>
            )}
            {!showCanvas && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-pulse text-panchmeshali-purple">
                  <Smartphone className="h-32 w-32 mx-auto" />
                  <p className="mt-4 text-lg font-medium">Loading our App Model...</p>
                </div>
              </div>
            )}
          </div>
          
          <div className={`space-y-6 transition-all duration-700 delay-500 ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <h3 className="text-2xl md:text-3xl font-serif font-bold">
              Publish Your eBooks with Ease
            </h3>
            <div className="space-y-4 text-gray-700">
              <p className="flex items-center gap-2">
                <span className="h-2 w-2 bg-panchmeshali-brown rounded-full"></span>
                Create and format beautiful ebooks in minutes
              </p>
              <p className="flex items-center gap-2">
                <span className="h-2 w-2 bg-panchmeshali-brown rounded-full"></span>
                Reach thousands of poetry / story enthusiasts worldwide
              </p>
              <p className="flex items-center gap-2">
                <span className="h-2 w-2 bg-panchmeshali-brown rounded-full"></span>
                Collaborate with talented recitors to bring your words to life
              </p>
              <p className="flex items-center gap-2">
                <span className="h-2 w-2 bg-panchmeshali-brown rounded-full"></span>
                Track your earnings and reader engagement in real-time
              </p>
            </div>
            {/* <Button onClick={() => (window.location.href = "https://admin.panchmeshali.com")} className="bg-panchmeshali-brown hover:bg-panchmeshali-brownlight text-white rounded-full px-8 py-6 text-lg">
              Join Us As Writer
            </Button> */}
          </div>
        </div>
        
        {/* <div className={`mt-24 transition-all duration-700 delay-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-center mb-10">
            Featured eBooks Coming to the App
          </h3>
          <BookCarousel />
        </div> */}
      </div>
    </section>
  );
};

export default MobileAppShowcase;
