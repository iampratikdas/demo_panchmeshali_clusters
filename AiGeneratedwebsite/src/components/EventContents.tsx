import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Share2, Copy, ThumbsUp } from "lucide-react";
import { contentAll, voteContents } from "@/auth/api";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../hooks/store";
import { setProfile, clearProfile } from "../hooks/profileFetchReducer";
import { Helmet } from "react-helmet-async";
import { getRemainingDays } from "@/utils/dateHelper";


import "./EventContents.css";
import { MoonLoader } from "react-spinners";
interface ContentEntry {
  _id: string;
  name: string;
  author_name: string;
  content: string;
  eid: string;
  cont_id: string;
  voteCount: number;
  uids: string[];
  hasVoted: boolean;
}

interface VotingEntry {
  _id: string;
  user_vote: boolean;
  contentsWithVoteCheck: ContentEntry[];
}

const EventContents: React.FC = () => {

  const targetDate = new Date("2025-09-20");
  targetDate.setDate(targetDate.getDate());

  let remainingDays = getRemainingDays(targetDate);

  remainingDays = remainingDays < 0 ? 0 : remainingDays;
  const [entries, setEntries] = useState<VotingEntry | null>(null);
  const profile = useSelector((state: RootState) => state.profile);
  // const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem("token"));
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingvote, setLoadingVote] = useState<boolean>(false);
  const [id_cont, setIdCont] = useState<string>("")
  const dispatch = useDispatch<AppDispatch>();
  const [pathname, setPathname] = useState("")
  useEffect(() => {

    const fetchTopContents = async () => {
      try {
        setLoading(true); // start spinner
        const res = await contentAll(
          "content_list_for_voting?eid=12345&status=Approved",
          "GET"
        );
        setEntries(res.data);
      } catch (error) {
        console.error("Error fetching top contents:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopContents();
  }, []);

  // Handle hash deep-link scroll
  useEffect(() => {
    if (entries?.contentsWithVoteCheck?.length) {
      const hash = window.location.pathname.replace("/voting/", "");
      if (hash) {
        const el = document.getElementsByClassName(hash);
        console.log("has================>", window.location.pathname, el.length)
        if (el.length > 0) {
          setPathname(window.location.pathname);
          setTimeout(() => {
            // el.scrollIntoView({ behavior: "smooth", block: "center" });
            el[0].scrollIntoView({ behavior: "smooth", block: "center" })
            el[0].classList.add("highlight");
            setTimeout(() => el[0].classList.remove("highlight"), 2000);
          }, 300);
        }
      }
    }
  }, [entries]);

  const handleVote = (id: string) => {
    if (!localStorage.getItem("token")) {
      handleLogin();
      return;
    }

    console.log("Voting for content:", id);
    const data = {
      cont_id: id,
      eid: "12345"
    }
    async function voteTheContent() {

      try {
        setLoadingVote(true);
        setIdCont(id)
        const res = await voteContents(
          data,
          "vote_a_content",
          "POST"
        );
        setEntries(res.data);
      } catch (error) {
        console.error("Error fetching top contents:", error);
      } finally {
        setIdCont("")
        setLoadingVote(false);
      }
    }
    voteTheContent()
  };

  const handleLogin = () => {
    const authUrl = import.meta.env.VITE_API_UR_AUTH;
    window.location.href = authUrl;

  };

  const handleShare = (entry: ContentEntry) => {
    const url = `${window.location.origin}/voting/${entry._id}`;

    if (navigator.share) {
      navigator
        .share({
          title: entry.name,
          text: "Check out this story!",
          url,
        })
        .catch((err) => console.error("Share failed:", err));
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  //   if (!isAuthenticated) {
  //   return <div className="p-6 text-center">🔒 Redirecting to login...</div>;
  // }
  return (
    <>

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center ">
          <MoonLoader size={100} color="#4A3F35" />
        </div>
      )}
      <React.Fragment>
        <section id="eventcontents" className="py-16 bg-[#d5b28d]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col gap-8 relative">
              {!loading && entries?.contentsWithVoteCheck?.length > 0 && (
                // <TransitionGroup className="grid gap-6">
                <>
                  {/* {
                    pathname ?

                      (
                        <Helmet>
                          <title>{entry.name} - Panchmeshali</title>
                          <meta
                            name="description"
                            content={`${entry.author_name} এর লেখা "${entry.name}" পড়ুন Panchmeshali-তে।`}
                          />
                          <meta name="keywords" content={`Panchmeshali, ${entry.name}, ${entry.author_name}, বাংলা গল্প`} />
                          <meta property="og:title" content={`${entry.name} - Panchmeshali`} />
                          <meta property="og:description" content={entry.content.slice(0, 200) + "..."} />
                          <meta property="og:type" content="article" />
                          <meta property="og:url" content={`https://www.panchmeshali.com/voting/${entry._id}`} />
                        </Helmet>
                      )
                      :
                      (<Helmet> <title>Stories - Panchmeshali</title>
                        <meta
                          name="description"
                          content={`${entry.author_name} এর লেখা "${entry.name}" পড়ুন Panchmeshali-তে।`}
                        />
                        <meta name="keywords" content={`Panchmeshali, ${entry.name}, ${entry.author_name}, বাংলা গল্প`} />
                        <meta property="og:title" content={`${entry.name} - Panchmeshali`} />
                        <meta property="og:description" content={entry.content.slice(0, 200) + "..."} />
                        <meta property="og:type" content="article" />
                        <meta property="og:url" content={`https://www.panchmeshali.com/voting/${entry._id}`} /> </Helmet>)

                  } */}
                      <section className="bg-gray-50 rounded-xl shadow-md p-8 max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2 relative inline-block">
                          Top Stories
                          <span className="block w-16 h-1 bg-blue-500 rounded mt-2 mx-auto"></span>
                        </h2>
                        <p className="text-gray-600 text-base leading-relaxed max-w-2xl mx-auto">
                          The following entries represent our top stories. Items falling outside the top 50
                          are clearly marked in red. E-certificates for them will be provided within 4–5 days on their own profile .
                        </p>
                      </section>

                  {entries.contentsWithVoteCheck.map((entry, index) => (
                    <React.Fragment>
                      

                      <CSSTransition
                        key={entry._id}
                        timeout={500}
                        classNames="fade-slide"
                      >
                        <Card
                          //  style={{border:"solid red", width: "100%"}}
                          // id={entry._id}
                         className={`
                            ${entry._id} 
                            break-words  
                            hover:shadow-elegant 
                            transition-all 
                            duration-500 
                            ${index + 1 > 50 
                              ? 'border border-red-500 rounded-lg' 
                              : 'border border-border/50 hover:border-primary/20'
                            }
                          `}
                        >

                          <CardContent className={`p-6 md:p-8 ${index+1 > 50 && "bg-[#ff000026]"}`}>
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                              {/* Rank Badge */}
                              <div className="flex-shrink-0">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold bg-[hsl(var(--brown))] text-white">
                                  {index + 1}
                                </div>
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                                  <div>
                                    <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                                      {entry.name}
                                    </h3>
                                    <p className="text-muted-foreground mb-2">
                                      Writer: {entry.author_name}
                                    </p>
                                    <Badge variant="secondary" className="text-xs">
                                      অণুগল্প
                                    </Badge>
                                  </div>

                                  <div className="text-right">
                                    <div className="text-2xl font-bold text-foreground mb-1">
                                      {entry.voteCount}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      Votes
                                    </div>
                                  </div>
                                </div>

                                <p className="text-muted-foreground mb-6 leading-relaxed ">
                                  {entry.content}
                                </p>

                                {/* Action buttons */}
                                <div className="flex gap-4">
                                  <Button
                                    variant={entry.hasVoted ? "secondary" : "default"}
                                    size="sm"
                                    disabled={remainingDays === 0 ? true : entry.hasVoted ? true : false}
                                    onClick={() => handleVote(entry.cont_id)}
                                    className="flex items-center gap-2"
                                  >
                                    <ThumbsUp className="w-4 h-4" />
                                    {    loadingvote && id_cont === entry.cont_id
                                      ? "Processing..."
                                      : (entry.hasVoted ? "Voted" : "Vote")}
                                  </Button>

                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleShare(entry)}
                                    className="flex items-center gap-2"
                                  >
                                    <Share2 className="w-4 h-4" />
                                    Share
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </CSSTransition>
                    </React.Fragment>
                  ))}
                </>

              )}
            </div>
          </div>
        </section>
      </React.Fragment>
    </>
  );
};

export default EventContents;
