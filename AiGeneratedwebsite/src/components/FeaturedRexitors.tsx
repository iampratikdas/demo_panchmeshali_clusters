
import React , {useState} from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { set } from "date-fns";

interface RexitorProps {
  name: string;
  specialty: string;
  performances: number;
  imageUrl: string;
  badges: string[];
}

const rexitors: RexitorProps[] = [
  {
    name: "Rohan Kapoor",
    specialty: "Classical Poetry",
    performances: 47,
    imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3",
    badges: ["Award Winner", "Featured Artist"]
  },
  {
    name: "Zara Ahmed",
    specialty: "Spoken Word",
    performances: 32,
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3",
    badges: ["Rising Star"]
  },
  {
    name: "Arjun Patel",
    specialty: "Ghazal Recitation",
    performances: 64,
    imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3",
    badges: ["Master Performer", "International"]
  },
  {
    name: "Arjun Patel",
    specialty: "Ghazal Recitation",
    performances: 64,
    imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3",
    badges: ["Master Performer", "International"]
  },
  {
    name: "Arjun Patel",
    specialty: "Ghazal Recitation",
    performances: 64,
    imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3",
    badges: ["Master Performer", "International"]
  },
  {
    name: "Arjun Patel",
    specialty: "Ghazal Recitation",
    performances: 64,
    imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3",
    badges: ["Master Performer", "International"]
  },
  {
    name: "Arjun Patel",
    specialty: "Ghazal Recitation",
    performances: 64,
    imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3",
    badges: ["Master Performer", "International"]
  },
];

const RexitorCard: React.FC<RexitorProps> = ({ name, specialty, performances, imageUrl, badges }) => {

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-center">
        <div className="w-32 h-32 rounded-full overflow-hidden shrink-0">
          <img 
            src={imageUrl} 
            alt={name} 
            className="object-cover w-full h-full"
          />
        </div>
        <div>
          <div className="flex flex-wrap gap-2 mb-2">
            {badges.map((badge) => (
              <Badge key={badge} className="bg-panchmeshali-lightPurple text-panchmeshali-purple">
                {badge}
              </Badge>
            ))}
          </div>
          <h3 className="text-xl font-serif font-medium">{name}</h3>
          <p className="text-panchmeshali-purple">{specialty}</p>
          <p className="text-gray-500 text-sm mt-1">{performances} performances</p>
          <p className="mt-3 text-gray-700">
            Bringing written words to life through powerful vocal interpretations and emotional delivery.
          </p>
          {/* <a href="#" className="mt-4 inline-block text-panchmeshali-purple font-medium hover:text-panchmeshali-accent">
            Watch performances →
          </a> */}
        </div>
      </CardContent>
    </Card>
  );
};

const FeaturedRexitors: React.FC = () => {
  const [showAllWriters, setShowAllwriters] = useState(false);
  return (
    <section id="rexitors" className="py-16 md:py-24 px-6 md:px-10 bg-panchmeshali-softGray">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Featured Writers</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Meet our talented performers who bring written poetry to life through their powerful recitations.
          </p>
        </div>
        
        <div className="flex flex-col gap-6">
          {!showAllWriters ?rexitors.slice(0,3).map((rexitor) => (
            <RexitorCard 
              key={rexitor.name}
              name={rexitor.name}
              specialty={rexitor.specialty}
              performances={rexitor.performances}
              imageUrl={rexitor.imageUrl}
              badges={rexitor.badges}
            />
          )): rexitors.map((rexitor) => (
            <RexitorCard 
              key={rexitor.name}
              name={rexitor.name}
              specialty={rexitor.specialty}
              performances={rexitor.performances}
              imageUrl={rexitor.imageUrl}
              badges={rexitor.badges}
            />
          ))}
        </div>
        
        <div className="text-center mt-12">
          <a 
         onClick={() => {
          if (!showAllWriters) {
            window.scrollTo(0, 0);
          }
          setShowAllwriters(!showAllWriters);
        }}
        
            // href="#" 
            className="inline-block border-2 border-panchmeshali-purple text-panchmeshali-purple px-8 py-3 rounded-full hover:bg-panchmeshali-purple hover:text-white transition-colors"
          >
            {showAllWriters ? "Show Less" : "Discover All Writers"}
            
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeaturedRexitors;
