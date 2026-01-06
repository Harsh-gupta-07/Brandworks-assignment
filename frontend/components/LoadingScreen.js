"use client";

export default function LoadingScreen() {
    return (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center z-[100]">
            <div className="flex flex-col items-center gap-6">
                <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 animate-pulse flex items-center justify-center">
                        <svg
                            className="w-10 h-10 text-slate-900"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M13.5 5.5L17 9l-3.5 3.5M6.5 5.5L3 9l3.5 3.5M10 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        </svg>
                    </div>
                    <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-emerald-400 animate-spin" />
                </div>

                <div className="text-center">
                    <h2 className="text-xl font-semibold text-white mb-2">Smart Parking</h2>
                    <p className="text-slate-400 text-sm animate-pulse">Signing you in...</p>
                </div>

                <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            </div>
        </div>
    );
}
