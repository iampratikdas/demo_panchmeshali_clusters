
import React, { useState, useEffect } from 'react';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from '@/hooks/use-mobile';

// Book data
const books = [
  {
    id: 1,
    title: "The Poetic Mind",
    author: "Eliza Wang",
    cover: "https://images.unsplash.com/photo-1500673922987-e212871fec22?w=500&q=80"
  },
  {
    id: 2,
    title: "Digital Verses",
    author: "Marcus Chen",
    cover: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=500&q=80"
  },
  {
    id: 3,
    title: "Code Poetry",
    author: "Aisha Johnson",
    cover: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=500&q=80"
  },
  {
    id: 4,
    title: "Whispers in Binary",
    author: "James Rodriguez",
    cover: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&q=80"
  },
  {
    id: 5,
    title: "Algorithmic Stanzas",
    author: "Priya Patel",
    cover: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&q=80"
  }
];

const BookCarousel = () => {
  const isMobile = useIsMobile();
  const [visibleItems, setVisibleItems] = useState(3);

  // Adjust visible items based on screen size
  useEffect(() => {
    setVisibleItems(isMobile ? 1 : 3);
  }, [isMobile]);

  return (
    <Carousel
      opts={{
        align: "center",
        loop: true,
      }}
      className="w-full max-w-5xl mx-auto"
    >
      <CarouselContent>
        {books.map((book) => (
          <CarouselItem key={book.id} className="md:basis-1/3 lg:basis-1/3">
            <div className="p-1">
              <Card className="overflow-hidden border-0 shadow-lg transform transition-transform duration-300 hover:scale-105">
                <CardContent className="flex aspect-[2/3] items-center justify-center p-0">
                  <div className="relative w-full h-full group">
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      <h3 className="text-white font-serif text-lg font-bold">{book.title}</h3>
                      <p className="text-white/80 text-sm">{book.author}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden md:flex" />
      <CarouselNext className="hidden md:flex" />
    </Carousel>
  );
};

export default BookCarousel;
