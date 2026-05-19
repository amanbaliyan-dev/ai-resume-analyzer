import React from "react";

export default function Logo({ size = "md", showText = true, className = "" }) {
    // Determine sizes for the SVG icon
    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-10 h-10",
        lg: "w-12 h-12",
        xl: "w-16 h-16"
    };

    // Determine typography sizes for the brand text
    const textSizes = {
        sm: "text-lg",
        md: "text-2xl",
        lg: "text-3xl",
        xl: "text-4xl"
    };

    const currentSizeClass = sizeClasses[size] || sizeClasses.md;
    const currentTextSize = textSizes[size] || textSizes.md;

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {/* SVG Logo Mark Container */}
            <div className={`relative ${currentSizeClass} flex-shrink-0 group`}>
                {/* Glow Background Layer */}
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 via-pink-500 to-cyan-400 rounded-xl blur-md opacity-60 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                
                {/* Modern Geometric Vector SVG */}
                <svg
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full drop-shadow-[0_2px_8px_rgba(168,85,247,0.5)] transform group-hover:scale-105 group-hover:rotate-3 transition-all duration-300"
                >
                    <defs>
                        {/* Core Gradient for structural shape */}
                        <linearGradient id="apex-grad-1" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#a855f7" /> {/* Purple */}
                            <stop offset="50%" stopColor="#ec4899" /> {/* Pink */}
                            <stop offset="100%" stopColor="#06b6d4" /> {/* Cyan */}
                        </linearGradient>
                        
                        {/* Secondary gradient for overlay shapes */}
                        <linearGradient id="apex-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#6366f1" /> {/* Indigo */}
                            <stop offset="100%" stopColor="#a855f7" /> {/* Purple */}
                        </linearGradient>
                        
                        {/* Blur filter for glows */}
                        <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* Outer Abstract Hexagonal Tech Frame */}
                    <polygon
                        points="50,6 88,28 88,72 50,94 12,72 12,28"
                        stroke="url(#apex-grad-1)"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                        fill="rgba(3, 0, 10, 0.75)"
                        className="opacity-70"
                    />

                    {/* The Premium Geometric Apex "A" Silhouette */}
                    <path
                        d="M50 15 L22 80 H36 L50 48 L64 80 H78 Z"
                        fill="url(#apex-grad-1)"
                    />
                    
                    {/* Inner negative space cutout to define the crossbar structure */}
                    <path
                        d="M50 32 L36 64 H64 Z"
                        fill="#03000a"
                    />
                    
                    {/* Glowing overlay neural paths forming an isometric peak */}
                    <path
                        d="M50 25 L75 75 M50 25 L25 75"
                        stroke="url(#apex-grad-2)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        className="opacity-60"
                    />
                    
                    {/* Futuristic Bridge Connection */}
                    <path
                        d="M32 58 H68"
                        stroke="url(#apex-grad-1)"
                        strokeWidth="4.5"
                        strokeLinecap="round"
                        filter="url(#logo-glow)"
                    />
                    
                    {/* Interactive glowing core node at the top vertex (AI center) */}
                    <circle
                        cx="50"
                        cy="22"
                        r="6"
                        fill="#ffffff"
                        filter="url(#logo-glow)"
                    />
                    <circle
                        cx="50"
                        cy="22"
                        r="3.5"
                        fill="#06b6d4"
                    />
                </svg>
            </div>

            {/* Premium Typography Brand Label */}
            {showText && (
                <span className={`${currentTextSize} font-extrabold bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent tracking-tight select-none`}>
                    ApexPrep <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-pink-500 bg-clip-text text-transparent font-black">AI</span>
                </span>
            )}
        </div>
    );
}
