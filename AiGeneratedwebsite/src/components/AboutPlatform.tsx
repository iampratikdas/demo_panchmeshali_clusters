
import React, { useRef, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Pen, Mic, Users } from "lucide-react";

const AboutPlatform: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [missionVisible, setMissionVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const missionObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMissionVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    if (missionRef.current) {
      missionObserver.observe(missionRef.current);
    }

    return () => {
      observer.disconnect();
      missionObserver.disconnect();
    };
  }, []);

  const features = [
    {
      icon: Pen,
      title: "Creative Writing",
      description: "Provide a space for writers to showcase their poetry, prose, and other creative writing forms."
    },
    {
      icon: Mic,
      title: "Skilled Recitation", 
      description: "Connect writers with rexitors who bring written words to life through emotional recitations."
    },
    {
      icon: Users,
      title: "Vibrant Community",
      description: "Foster a supportive community where writers and rexitors can collaborate and grow together."
    }
  ];

  return (
    <section id="about" className="py-16 bg-[#d5b28d]">
      <div className="max-w-6xl mx-auto px-6">
        <div 
          ref={ref}
          className={`text-center mb-12 transition-all duration-1000 ${
            isVisible ? 'animate-fade-in opacity-100' : 'opacity-0'
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
            About Panchmeshali
          </h2>
          <p className="text-lg text-black max-w-3xl mx-auto">
            Discover how our platform brings together the art of writing and the craft of recitation to create a unique literary experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`transition-all duration-1000 ${
                  isVisible 
                    ? `animate-slide-in-left opacity-100` 
                    : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <Card className="h-full text-center hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-panchmeshali-brownlight rounded-full flex items-center justify-center">
                      <Icon className="h-8 w-8 text-panchmeshali-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        <div 
          ref={missionRef}
          className={`bg-white rounded-xl shadow-lg p-8 md:p-12 transition-all duration-1000 ${
            missionVisible ? 'animate-fade-in opacity-100' : 'opacity-0'
          }`}
        >
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-panchmeshali-brown mb-6 text-center">
            Our Mission
          </h3>
          <p className="text-lg text-gray-700 leading-relaxed mb-6 text-center max-w-4xl mx-auto">
            At Panchmeshali, we believe that poetry is meant to be both written and heard. Our mission is to create a platform where words transcend the page through the power of human voice, creating a richer, more immersive literary experience for creators and audiences alike.
          </p>
          <p className="text-gray-600 text-center">
            Founded in 2019 31 st July , Panchmeshali has grown into a thriving community of over 500 writers , 200 recitors , artists, collaborating to bring the written word to life through powerful performances and interpretations.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutPlatform;
