import { useState } from "react";
import { Link } from "react-router-dom";
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import Logo from "./Logo";

function Navbar({ activePage }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinks = [
        { id: "resume", label: "ResuAI", path: "/resume" },
        { id: "interview", label: "AI Mock Interview", path: "/interview" },
        { id: "voice", label: "Voice Interview", path: "/voice" },
        { id: "coding", label: "Coding Round", path: "/coding" },
        { id: "studyplan", label: "Study Plan", path: "/study-plan" },
        { id: "dashboard", label: "Dashboard", path: "/dashboard" },
    ];

    return (
        <nav className="border-b border-gray-950 backdrop-blur-md sticky top-0 z-50 bg-[#03000a]/80">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                {/* Logo Section */}
                <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity z-50">
                    <Logo />
                </Link>

                {/* Desktop Links */}
                <SignedIn>
                    <div className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium text-gray-300">
                        {navLinks.map((link) => (
                            <Link 
                                key={link.id} 
                                to={link.path} 
                                className={`transition-colors whitespace-nowrap ${activePage === link.id ? "text-pink-400 font-bold drop-shadow-[0_0_10px_rgba(236,72,153,0.3)]" : "hover:text-purple-400"}`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </SignedIn>

                {/* Right Side Controls */}
                <div className="flex items-center gap-4 z-50">
                    <SignedIn>
                        <div className="hidden md:flex items-center">
                            <Link to="/" className="text-sm font-medium text-gray-400 hover:text-white mr-4 transition-colors">
                                Exit Suite
                            </Link>
                        </div>
                        <UserButton afterSignOutUrl="/" />
                        
                        {/* Mobile Hamburger Menu */}
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden ml-2 p-1 text-gray-300 hover:text-white focus:outline-none transition-colors cursor-pointer"
                        >
                            {isMenuOpen ? (
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </SignedIn>

                    <SignedOut>
                        <div className="flex items-center gap-4">
                            <SignInButton mode="modal">
                                <button className="text-sm font-semibold text-gray-300 hover:text-white transition-colors cursor-pointer">Login</button>
                            </SignInButton>
                            <SignInButton mode="modal">
                                <button className="text-sm font-bold bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200 transition-colors cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.2)]">Sign Up</button>
                            </SignInButton>
                        </div>
                    </SignedOut>
                </div>
            </div>

            {/* Mobile Dropdown Menu Drawer */}
            <div className={`lg:hidden absolute top-full left-0 w-full bg-[#05020c]/95 backdrop-blur-xl border-b border-gray-900 transition-all duration-300 ease-in-out origin-top ${isMenuOpen ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0 pointer-events-none"}`}>
                <div className="px-4 py-6 flex flex-col gap-3">
                    {navLinks.map((link) => (
                        <Link 
                            key={link.id} 
                            to={link.path} 
                            onClick={() => setIsMenuOpen(false)}
                            className={`text-base font-semibold px-5 py-3 rounded-xl transition-all ${activePage === link.id ? "bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-pink-400 border border-pink-500/20" : "text-gray-300 hover:bg-gray-900 hover:text-purple-400 border border-transparent"}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-gray-800 to-transparent my-3"></div>
                    <Link 
                        to="/" 
                        onClick={() => setIsMenuOpen(false)}
                        className="text-base font-medium px-5 py-3 rounded-xl text-gray-400 hover:bg-gray-900 hover:text-white transition-all flex items-center justify-between"
                    >
                        Exit Suite
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </Link>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
