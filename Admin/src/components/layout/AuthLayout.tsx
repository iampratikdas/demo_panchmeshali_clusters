// import { useState, useEffect } from "react";

import SideCarousel from "@/components/common/SideCarousel";
interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const AuthLayout = ({ children, title }: LayoutProps) => {
  return (
    <div className="grid lg:grid-cols-2 grid-cols-1 min-h-screen">
      <div className="px-4 md:px-8 lg:px-16 py-8 w-full max-w-[40rem]  mx-auto relative top-[5%]">
        <div
          className="wow animate__animated animate__fadeInUp border border-none mt-[0.5rem] p-[48px] rounded-tl-[2rem] rounded-br-[2rem] shadow-[0px_50px_100px_-20px_rgba(50,50,93,0.25),0px_30px_60px_-30px_rgba(0,0,0,0.3),0px_-2px_6px_0px_rgba(10,37,64,0.35)_inset]"
          data-wow-iteration="1"
        >
          {title && (
            <h1 className="text-2xl md:text-3xl font-semibold mb-2  text-blank">
              {title}
            </h1>
          )}
          <p className="mb-8 text-blank">Please enter your details.</p>
          {children}
        </div>
      </div>

      <SideCarousel />
    </div>
  );
};

export default AuthLayout;
