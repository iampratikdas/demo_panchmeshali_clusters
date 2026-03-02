
import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StatsShowcase from "@/components/StatsShowcase";
import FeaturedWriters from "@/components/FeaturedWriters";
import VotingSystem from "@/components/VotingSystem";
import ContentShowcase from "@/components/ContentShowcase";
// import VotingSystem from "@/components/VotingSystem";
import MobileAppShowcase from "@/components/MobileAppShowcase";
import AboutPlatform from "@/components/AboutPlatform";
import Footer from "@/components/Footer";

const Index: React.FC = () => {
  return (
    // <div className="min-h-screen bg-panchmeshali-brownlight">
    //   <Navbar />
    <React.Fragment>


      <Hero />
      <StatsShowcase />
      <ContentShowcase />
      <VotingSystem />
      <MobileAppShowcase />
      {/* <FeaturedWriters /> */}
      <AboutPlatform />
      <Footer />
    {/* </div> */}
    </React.Fragment>
  );
};

export default Index;
