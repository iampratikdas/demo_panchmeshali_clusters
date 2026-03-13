import React from 'react';
import { BookOpen, KeyRound, Mail } from 'lucide-react';

const Login: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-serif">
            {/* Background Starry/Dot effect - subtle and dark */}
            <div
                className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
                aria-hidden="true"
            />

            {/* Main Login Card */}
            <div className="z-10 bg-[#1e2336]/80 backdrop-blur-md border border-slate-700/50 rounded-3xl p-8 w-full max-w-md shadow-2xl">

                {/* Header Section */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 rounded-full border border-slate-500 flex items-center justify-center mb-4">
                        <BookOpen className="w-6 h-6 text-slate-300" />
                    </div>
                    <h1 className="text-3xl font-medium tracking-wide mb-2 text-slate-100">The Folio</h1>
                    <p className="text-slate-400 italic font-serif text-sm">Step into your next chapter</p>

                    <div className="mt-6 uppercase text-[10px] tracking-widest text-slate-500 font-sans">
                        Library Portal
                    </div>
                </div>

                {/* Form Section */}
                <form className="space-y-5 font-sans">

                    {/* Email Field */}
                    <div className="space-y-1.5">
                        <label htmlFor="email" className="block text-xs font-semibold tracking-wider text-slate-400 uppercase">
                            Email Address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-4 w-4 text-slate-500" />
                            </div>
                            <input
                                type="email"
                                id="email"
                                className="block w-full pl-10 pr-3 py-3 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-shadow text-sm"
                                placeholder="your.name@thefolio.com"
                                required
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-xs font-semibold tracking-wider text-slate-400 uppercase">
                                Access Key
                            </label>
                            <a href="#" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                                Forgotten?
                            </a>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <KeyRound className="h-4 w-4 text-slate-500" />
                            </div>
                            <input
                                type="password"
                                id="password"
                                className="block w-full pl-10 pr-3 py-3 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-shadow text-sm"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        className="w-full bg-white text-slate-900 font-medium py-3 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center space-x-2 mt-2"
                    >
                        <span>Unlock the Archives</span>
                        <BookOpen className="w-4 h-4 ml-1" />
                    </button>
                </form>

                {/* Divider */}
                <div className="mt-8 mb-6 relative flex items-center font-sans tracking-widest text-[10px] uppercase text-slate-500">
                    <div className="flex-grow border-t border-slate-700/80"></div>
                    <span className="flex-shrink-0 mx-4">Endless Stories</span>
                    <div className="flex-grow border-t border-slate-700/80"></div>
                </div>

                {/* Google Login */}
                <button
                    type="button"
                    className="w-full bg-[#2a3143] hover:bg-[#32394d] text-slate-200 border border-slate-600/50 py-3 rounded-xl transition-colors flex items-center justify-center space-x-3 font-sans text-sm mb-6"
                >
                    {/* Simple custom Google Icon since Lucide doesn't have brand icons */}
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                        <path d="M1 1h22v22H1z" fill="none" />
                    </svg>
                    <span>Sign in with Google</span>
                </button>

                {/* Footer Link */}
                <div className="text-center font-sans text-xs text-slate-500">
                    New wanderer? <a href="#" className="text-slate-300 font-medium hover:text-white transition-colors">Begin your journey</a>
                </div>
            </div>

            {/* Quote Footer - Only visible if screen is tall enough, or scrolls into view */}
            <div className="w-full max-w-md mt-12 text-center text-slate-400">
                <p className="italic mb-4">"A room without books is like a body<br />without a soul."</p>
                <p className="uppercase text-[10px] tracking-widest text-slate-500 font-sans flex items-center justify-center">
                    <span className="w-6 border-t border-slate-700 mr-2"></span>
                    Marcus Tullius Cicero
                    <span className="w-6 border-t border-slate-700 ml-2"></span>
                </p>

                {/* Decorative bottom element */}
                <div className="mx-auto mt-6 flex text-slate-600 justify-center">
                    <BookOpen className="w-3 h-3" />
                </div>
            </div>
        </div>
    );
};

export default Login;
