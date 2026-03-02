
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

const Hero: React.FC = () => {
  return (
    <section className="relative py-12 md:py-24 px-6 md:px-10 flex flex-col items-center justify-center min-h-screen overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full">


        <img
          src="image_chat.png"  
          alt="Background"
          className="w-full h-full object-cover"
        />

        {/* Video Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-panchmeshali-purple/20 via-transparent to-panchmeshali-darkPurple/30"></div>
      </div>

      {/* Video Controls */}
      {/* <div className="absolute top-6 right-6 z-20 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={togglePlayPause}
          className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleMute}
          className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div> */}

      {/* Floating Elements */}
      <div className="absolute w-96 h-96 bg-white rounded-full filter blur-3xl opacity-10 -top-48 -left-48 animate-float"></div>
      <div className="absolute w-96 h-96 bg-panchmeshali-accent rounded-full filter blur-3xl opacity-10 -bottom-48 -right-48 animate-float" style={{ animationDelay: '3s' }}></div>

      <div className="max-w-5xl mx-auto text-center z-10 relative">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 leading-tight text-white animate-fade-in">
          Where Words Come to Life
        </h1>
        <p className="text-lg md:text-xl text-white/90 mb-8 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
          Panchmeshali is a vibrant community where creative writers craft poetry and recitors breathe life into written words through powerful recitations.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
          {/* <Button className="bg-panchmeshali-accent hover:bg-panchmeshali-accent/80 text-white rounded-full px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            Discover our writings
          </Button> */}
          <Button onClick={() => (window.location.href = "https://www.facebook.com/panchmeshalii")} variant="outline" className="border-white/30 text-black hover:bg-white/10 backdrop-blur-sm rounded-full px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            Explore Us
          </Button>
        </div>
      </div>

      <div className="mt-16 w-full max-w-4xl mx-auto z-10 relative animate-slide-in-left" style={{ animationDelay: '0.9s' }}>
        <div className="relative p-8 bg-white/80 backdrop-blur-md rounded-xl shadow-2xl border border-white/20">
          <p className="poetry-text italic text-center text-[30px] quote-marks relative px-8 text-black">
            Words have the power to create worlds, and voices have the magic to bring them to life.
            At Panchmeshali, we celebrate this beautiful symbiosis between writing and recitation.
          </p>
        </div>
      </div>

      {/* Interactive Elements */}
      {/* <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-bounce"></div>
        </div>
      </div> */}
    </section>
  );
};

export default Hero;
