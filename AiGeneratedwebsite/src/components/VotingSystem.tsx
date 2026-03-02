import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Vote, Trophy, Users, Timer, TrendingUp } from 'lucide-react';
import { useInView } from '@/hooks/use-intersection-observer';
import { useToast } from '@/hooks/use-toast';
import { getRemainingDays } from "@/utils/dateHelper";
import { topContents } from "@/auth/api"
import { MoonLoader } from "react-spinners";


interface VotingEntry {
  _id: string;
  count: number;
  contentDetails: {

    uid: string;
    type: string;
    name: string;
    author_name: string;
    status: string;
    content: string;
    url: string;
    eid: string;
    event_content: boolean;
    orgin_content: boolean;
    cont_id: string;
    page_id: string;
  }
}

const VotingSystem: React.FC = () => {
  const targetDate = new Date("2025-09-20");
  targetDate.setDate(targetDate.getDate());

  let remainingDays = getRemainingDays(targetDate);
   remainingDays = remainingDays < 0 ? 0 : remainingDays;
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  const { toast } = useToast();
  const [votedEntries, setVotedEntries] = useState<Set<string>>(new Set());
  const [entries, setEntries] = useState<VotingEntry[]>([]);
  const [loading , setLoading] = useState(true)
  useEffect(() => {
    const fetchTopContents = async () => {
      try {
        const res = await topContents("top_5_contents?eid=12345", "GET");
        console.log("res=============>", res)
        setEntries(res.data.contents_list)
        // setLoading(false)
      } catch (error) {
        console.error("Error fetching top contents:", error);
      } finally{
        setLoading(false);
      }
    };

    fetchTopContents();
  }, []);

// if(loading){
//   return (
//     <>
//     <div className="inset-0 z-50 flex items-center justify-center ">
//           <MoonLoader size={100} color="#4A3F35" />
//         </div>
//     </>
//     )
// }

  return (
    <>
      


    <section
      ref={ref}
      className={`py-24 bg-[url('backimage.png')] bg-cover bg-center transition-all duration-1000 opacity-100 translate-y-0`}
      // className={`py-24 bg-[url('backimage.png')] bg-cover bg-center transition-all duration-1000 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <div className="absolute inset-0 bg-black/60 shadow-[rgba(21, 21, 39, 0.51)_0px_30px_60px_-12px_inset,rgba(0, 0, 0, 0.8)_0px_18px_36px_-18px_inset]"></div>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-800 delay-200 opacity-100 translate-y-0`}>
        {/* <div className={`text-center mb-16 transition-all duration-800 delay-200 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}> */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <Trophy className="h-8 w-8 text-primary" />
            <h2 className="text-4xl md:text-5xl font-bold text-white">

              অণুতে অনন্ত
            </h2>
            <Trophy className="h-8 w-8 text-primary" />
          </div>


          <p className="text-xl text-white mb-8 max-w-3xl mx-auto">
            Vote for your favorite among the best writings from our literature competition.
          </p>

          {/* Competition Stats */}
          <div className="flex justify-center mb-8 flex-col sm:flex-row sm:gap-6 md:gap-8">
            <div className="flex items-center gap-2 text-white">
              <Users className="h-5 w-5" />
              <span>{78} Stories</span>
            </div>
            {/* <div className="flex items-center gap-2 text-white">
              <Vote className="h-5 w-5" />
              <span>{totalVotes} Total Votes</span>
            </div> */}
            <div className="flex items-center gap-2 text-white">
              <Timer className="h-5 w-5" />
              <span>{remainingDays} Days Remaining</span>
            </div>
          </div>

        </div>

        {/* Voting Cards */}
        <div className="grid gap-6 md:gap-8 relative" >
          {
            entries.length > 0 && <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-[hsl(var(--secondary))]" />
              <h3 className="text-lg font-semibold text-[hsl(var(--secondary))]" >
                Top Trending Stories by Votes
              </h3>
            </div>
          }

          {loading && (
        <div className="inset-0 z-50 flex items-center justify-center ">
          <MoonLoader size={100} color="#fff" />
        </div>
      )}

          {entries.map((entry, index) => (
            <Card
              key={entry._id}
              className={`group hover:shadow-elegant transition-all duration-500 border-border/50 hover:border-primary/20 opacity-100 translate-y-0`}
              // className={`group hover:shadow-elegant transition-all duration-500 border-border/50 hover:border-primary/20 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{
                transitionDelay: `${400 + index * 100}ms`,
                background: undefined



              }}
            >
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {/* Rank Badge */}
                  <div className="flex-shrink-0">

                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold bg-[hsl(var(--brown))] text-white
                      `}>

                      {index + 1}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {entry.contentDetails.name}
                        </h3>

                        <p className="text-muted-foreground mb-2">Writer: {entry.contentDetails.author_name}</p>

                        <Badge variant="secondary" className="text-xs">
                          অণুগল্প
                        </Badge>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-foreground mb-1">
                          {entry.count}
                        </div>

                        <div className="text-sm text-muted-foreground">Vote</div>

                      </div>
                    </div>

                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {entry.contentDetails.content}
                    </p>

                    {/* Vote Button */}

                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        {/* Call to Action */}

        <div className={`text-center mt-16 transition-all duration-800 delay-1000 opacity-100 translate-y-0`}>
        {/* <div className={`text-center mt-16 transition-all duration-800 delay-1000 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}> */}
          <div className="bg-white rounded-lg p-8 max-w-2xl mx-auto shadow-[inset_0px_30px_60px_-12px_rgba(50,50,93,0.25),inset_0px_18px_36px_-18px_rgba(0,0,0,0.3)]">
            <h3 className="text-2xl font-semibold mb-4 text-foreground">
              Vote for Your Favorite Writing
            </h3>
            <p className="text-muted-foreground mb-6">
              Every vote matters. Help your favorite writing move forward.
            </p>
            <div className="flex gap-4 justify-center mb-4">
              <Button
                asChild
                className="relative overflow-hidden transition-all duration-300
               bg-brown-600 text-white font-semibold 
               shadow-md hover:bg-brown-700 
               hover:shadow-lg hover:shadow-brown-500/70
               hover:animate-glow"
              >
                <a href="/voting">View All Writings</a>
              </Button>
            </div>



            {/* <div className="text-sm text-muted-foreground">
              Voting ends: December 31, 2024, 11:59 PM
            </div> */}


          </div>
        </div>
      </div>
    </section>
    </>
  );
};

export default VotingSystem;