import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ className = "h-10 w-auto", showText = true, textColor = "text-slate-800" }) => {
    return (
        <Link to="/" className={`flex items-center gap-3 hover:opacity-80 transition-opacity ${className}`}>
            <div className="relative flex items-center justify-center w-10 h-10">
                {/* University Building Logo (Classical Style) */}
                <svg
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full drop-shadow-sm"
                >
                    {/* Pediment (Triangle Top) */}
                    <path
                        d="M50 15 L15 35 H85 L50 15 Z"
                        className="text-primary-600 fill-current"
                    />
                    {/* Circle in Pediment */}
                    <circle cx="50" cy="27" r="3" className="fill-white opacity-80" />

                    {/* Columns */}
                    <rect x="22" y="38" width="6" height="35" rx="1" className="text-primary-500 fill-current" />
                    <rect x="40" y="38" width="6" height="35" rx="1" className="text-primary-500 fill-current" />
                    <rect x="54" y="38" width="6" height="35" rx="1" className="text-primary-500 fill-current" />
                    <rect x="72" y="38" width="6" height="35" rx="1" className="text-primary-500 fill-current" />

                    {/* Column Connectors (Header & Base) */}
                    <rect x="18" y="35" width="64" height="4" rx="1" className="text-primary-400 fill-current" />
                    <rect x="15" y="73" width="70" height="6" rx="2" className="text-primary-600 fill-current" />
                    <rect x="10" y="79" width="80" height="4" rx="2" className="text-primary-700 fill-current" />
                </svg>
            </div>

            {showText && (
                <div className="flex flex-col">
                    <span className={`text-xl font-bold tracking-tight leading-none ${textColor}`}>
                        Eni<span className="text-primary-600">Gov</span>
                    </span>
                    <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 tracking-[0.2em] uppercase leading-none mt-0.5">
                        Univ. Carthage
                    </span>
                </div>
            )}
        </Link>
    );
};

export default Logo;
