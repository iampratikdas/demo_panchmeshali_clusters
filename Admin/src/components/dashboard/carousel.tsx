import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"

const items = [
  {
    title: "Featured Story 1",
    image: "https://via.placeholder.com/800x400",
    description: "An amazing story about adventure",
  },
  {
    title: "Featured Story 2",
    image: "https://via.placeholder.com/800x400",
    description: "A tale of mystery and intrigue",
  },
  {
    title: "Featured Story 3",
    image: "https://via.placeholder.com/800x400",
    description: "Journey through time",
  },
]

export function DashboardCarousel() {
  return (
    <Carousel className="w-full max-w-5xl mx-auto">
      <CarouselContent>
        {items.map((item, index) => (
          <CarouselItem key={index}>
            <Card>
              <CardContent className="flex aspect-[16/9] items-center justify-center p-6">
                <div className="text-center">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}
