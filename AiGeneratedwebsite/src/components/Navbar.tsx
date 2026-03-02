import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../hooks/store";
import { setProfile } from "../hooks/profileFetchReducer";

const Navbar: React.FC = () => {
  const profile = useSelector((state: RootState) => state.profile);
  const dispatch = useDispatch<AppDispatch>();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function getCookie(name: string) {
      const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
      if (match) return decodeURIComponent(match[2]);
      return null;
    }

    const userCookieUser = getCookie("user");
    const userCookieToken = getCookie("token");
    if (userCookieUser) {
      localStorage.setItem("token", userCookieToken || "");
      const parsed = JSON.parse(userCookieUser);
      localStorage.setItem("full_name", parsed.full_name);
      localStorage.setItem("email", parsed.email);
      localStorage.setItem("uid", parsed.uid);
      dispatch(
        setProfile({
          full_name: parsed.full_name,
          email: parsed.email,
          uid: parsed.uid,
        })
      );
    }
  }, [dispatch]);

  const handleLogin = () => {
    const authUrl = import.meta.env.VITE_API_UR_AUTH;
    window.location.href = authUrl;
  };

  function deleteAllCookies() {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      document.cookie =
        name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.panchmeshali.com";
      document.cookie =
        name +
        "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" +
        window.location.hostname;
    }
  }

  const handleSignOut = () => {
    localStorage.clear();
    deleteAllCookies();
    window.location.href = "/";
  };

  return (
    <nav className="sticky bg-panchmeshali-brownlight top-0 z-[111] backdrop-blur-[4rem] py-4 px-6 md:px-10 flex items-center justify-between w-full mx-auto shadow-[rgba(50,50,93,0.25)_0px_30px_60px_-12px_inset,rgba(0,0,0,0.3)_0px_18px_36px_-18px_inset]">
      {/* Logo */}
      <div className="flex items-center">
        <img
          src="https://www.panchmeshali.com/logo.png"
          alt="Panchmeshali Logo"
          className="h-10 w-10 object-contain relative top-[2px]"
        />
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-serif font-bold text-white">
            Panch
            <span className="text-panchmeshali-white">meshali</span>
          </span>
        </Link>
      </div>

      {/* Desktop menu */}
      <div className="hidden md:flex gap-8">
        <Link to="/#stats" className="text-black hover:text-white fancy-underline transition-colors">
          Stats
        </Link>
        <Link
          to="/voting"
          className="px-2 py-1 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
                 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 
                 hover:scale-105  relative bottom-[5px]"
        >
          Event Contents
        </Link>
        <Link to="/#showcase" className="text-black hover:text-white fancy-underline transition-colors">
          Showcase
        </Link>
        <a href="/#app-showcase" className="text-black hover:text-white fancy-underline transition-colors">
          App
        </a>
        <Link to="/#about" className="text-black hover:text-white fancy-underline transition-colors">
          About
        </Link>
      </div>

      {/* Desktop Sign In/Out */}
      <div className="hidden md:block">
        {profile.email || localStorage.getItem("email") ? (
          <Button
            onClick={handleSignOut}
            className="bg-panchmeshali-brown hover:bg-panchmeshali-brownlight text-white text-[15px] rounded-full px-4"
          >
            Sign Out
          </Button>
        ) : (
          <Button
            onClick={handleLogin}
            className="bg-panchmeshali-brown hover:bg-panchmeshali-brownlight text-white text-[15px] rounded-full px-4"
          >
            Sign In
          </Button>
        )}
      </div>

      {/* Hamburger button for mobile */}
      <button
        className="md:hidden text-white focus:outline-none"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className={`
            absolute top-full left-0 w-full bg-panchmeshali-brown shadow-lg md:hidden 
            transform transition-transform duration-1000 ease-in-out
            ${mobileOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}
          `}>
          <div className="flex flex-col items-start gap-4 p-4">
            <Link to="/#stats" onClick={() => setMobileOpen(false)} className="text-black hover:text-white">
              Stats
            </Link>
            <Link
              to="/voting"
              onClick={() => setMobileOpen(false)}
              className="px-2 py-1 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Event Contents
            </Link>
            <Link to="/#showcase" onClick={() => setMobileOpen(false)} className="text-black hover:text-white">
              Showcase
            </Link>
            <a href="/#app-showcase" onClick={() => setMobileOpen(false)} className="text-black hover:text-white">
              App
            </a>
            <Link to="/#about" onClick={() => setMobileOpen(false)} className="text-black hover:text-white">
              About
            </Link>
            {profile.email || localStorage.getItem("email") ? (
              <Button
                onClick={() => {
                  handleSignOut();
                  setMobileOpen(false);
                }}
                className="bg-panchmeshali-brown hover:bg-panchmeshali-brownlight text-white text-[15px] rounded-full px-4"
              >
                Sign Out
              </Button>
            ) : (
              <Button
                onClick={() => {
                  handleLogin();
                  setMobileOpen(false);
                }}
                className="bg-panchmeshali-brown hover:bg-panchmeshali-brownlight text-white text-[15px] rounded-full px-4"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
