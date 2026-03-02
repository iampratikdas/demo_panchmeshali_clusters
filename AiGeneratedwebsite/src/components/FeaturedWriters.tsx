
import React, { useRef, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const FeaturedWriters: React.FC = () => {
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

  const writers = [
    {
      name: "Priya Sharma",
      genre: "Contemporary Poetry",
      bio: "A voice that captures the essence of modern urban life through verse.",
      avatar: "/placeholder.svg",
      works: 45
    },
    {
      name: "Arjun Mehta", 
      genre: "Narrative Fiction",
      bio: "Crafting stories that bridge the gap between tradition and modernity.",
      avatar: "/placeholder.svg",
      works: 32
    },
    {
      name: "Kavya Patel",
      genre: "Lyrical Poetry", 
      bio: "Weaving emotions into words that resonate with the soul.",
      avatar: "/placeholder.svg",
      works: 67
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div 
          ref={ref}
          className={`text-center mb-12 transition-all duration-1000 ${
            isVisible ? 'animate-fade-in opacity-100' : 'opacity-0'
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
            Featured Writers
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover the talented writers who bring their unique perspectives and creative prowess to Panchmeshali.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {writers.map((writer, index) => (
            <div
              key={writer.name}
              className={`transition-all duration-1000 ${
                isVisible 
                  ? `animate-slide-in-left opacity-100` 
                  : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Avatar className="h-16 w-16 mr-4">
                      <AvatarImage src={writer.avatar} alt={writer.name} />
                      <AvatarFallback>{writer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{writer.name}</h3>
                      <p className="text-panchmeshali-purple font-medium">{writer.genre}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{writer.bio}</p>
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">{writer.works}</span> published works
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedWriters;
