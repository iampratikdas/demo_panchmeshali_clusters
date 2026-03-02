
import React from "react";
import { Separator } from "@/components/ui/separator";

const Footer: React.FC = () => {
  return (
    <footer className="bg-panchmeshali-darkPurple text-white py-12 md:py-16 px-6 md:px-10 bg-[#5a2a09]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <h3 className="text-2xl font-serif font-bold mb-4">
              <span className="text-white">Panch</span><span className="text-panchmeshali-brown">meshali</span>
            </h3>
            <p className="text-gray-300 mb-6">
              Connecting creative writers with talented recitors to bring Art to life.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/panchmeshalii/" className="text-gray-300 hover:text-panchmeshali-accent">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
              </a>
              {/* <a href="#" className="text-gray-300 hover:text-panchmeshali-accent">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a> */}
              <a href="https://www.facebook.com/panchmeshalii" className="text-gray-300 hover:text-panchmeshali-accent">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>

              <a href="https://www.linkedin.com/in/panchmeshali-developers-0754aa1b9/" className="text-gray-300 hover:text-panchmeshali-accent">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
              </a>
            </div>
          </div>

          {/* <div>
            <h4 className="font-medium text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-panchmeshali-accent">Home</a></li>
              <li><a href="#writers" className="text-gray-300 hover:text-panchmeshali-accent">Writers</a></li>
              <li><a href="#rexitors" className="text-gray-300 hover:text-panchmeshali-accent">Rexitors</a></li>
              <li><a href="#showcase" className="text-gray-300 hover:text-panchmeshali-accent">Poetry Showcase</a></li>
              <li><a href="#about" className="text-gray-300 hover:text-panchmeshali-accent">About Us</a></li>
            </ul>
          </div> */}

          {/* <div>
            <h4 className="font-medium text-lg mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-panchmeshali-accent">Writing Guidelines</a></li>
              <li><a href="#" className="text-gray-300 hover:text-panchmeshali-accent">Recitation Tips</a></li>
              <li><a href="#" className="text-gray-300 hover:text-panchmeshali-accent">Submission Process</a></li>
              <li><a href="#" className="text-gray-300 hover:text-panchmeshali-accent">Events Calendar</a></li>
              <li><a href="#" className="text-gray-300 hover:text-panchmeshali-accent">FAQs</a></li>
            </ul>
          </div> */}

          <div>
            <h4 className="font-medium text-lg mb-4">Contact</h4>
            <ul className="space-y-2">
              <li className="text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail inline-block mr-2"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                pachmeshalii@gmail.com
              </li>
              <li className="text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin inline-block mr-2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                Kolkata ,West Bengal, India
              </li>
            </ul>
        
          </div>
        </div>

        <Separator className="my-8 bg-white/20" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Panchmeshali. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="/privacy" className="text-gray-400 hover:text-panchmeshali-accent text-sm">Privacy Policy</a>
            <a href="/termsandcondition" className="text-gray-400 hover:text-panchmeshali-accent text-sm">Terms of Service</a>
            {/* <a href="#" className="text-gray-400 hover:text-panchmeshali-accent text-sm">Cookie Policy</a> */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
