"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Car, MapPin, Clock, CreditCard, Download, Share2, Smartphone, Hash, Loader2, ParkingCircleOff } from "lucide-react";

export default function DashTickets({ setActiveView }) {
    const [ticketData, setTicketData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retrieving, setRetrieving] = useState(false);

    useEffect(() => {
        const fetchActiveParkedCar = async () => {
            try {
                setLoading(true);
                const token = sessionStorage.getItem("authToken");
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/active-parked-car`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                const data = await response.json();

                if (data.success) {
                    setTicketData(data.data);
                } else {
                    setTicketData(null);
                }
            } catch (err) {
                console.error("Error fetching active parked car:", err);
                setError("Failed to load ticket data");
            } finally {
                setLoading(false);
            }
        };

        fetchActiveParkedCar();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
    };

    const calculateDuration = (parkedAt) => {
        const start = new Date(parkedAt);
        const now = new Date();
        const diffMs = now - start;
        const diffMins = Math.floor(diffMs / 60000);
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;

        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    };

    const handleRetrieveCar = async () => {
        if (!ticketData?.id) return;

        try {
            setRetrieving(true);
            const token = sessionStorage.getItem("authToken");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/retrieve-car/${ticketData.id}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            const data = await response.json();

            if (data.success) {
                setActiveView("home");
            } else {
                setError(data.message || "Failed to retrieve car");
            }
        } catch (err) {
            console.error("Error retrieving car:", err);
            setError("Failed to retrieve car");
        } finally {
            setRetrieving(false);
        }
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 size={48} className="text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Loading ticket...</p>
                </div>
            </div>
        );
    }

    if (!ticketData) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="bg-indigo-600 pb-16 pt-12 px-6 rounded-b-[2.5rem]">
                    <div className="flex items-center gap-4 text-white mb-8">
                        <div onClick={() => setActiveView("home")} className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer">
                            <ArrowLeft size={24} />
                        </div>
                        <h1 className="text-lg font-bold">Parking Ticket</h1>
                    </div>
                </div>

                <div className="px-6 -mt-8 relative z-10">
                    <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
                        <ParkingCircleOff size={64} className="text-slate-300 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-900 mb-2">No Active Parking</h2>
                        <p className="text-slate-500 text-sm mb-6">You don't have any active parking session at the moment.</p>
                        <button
                            onClick={() => setActiveView("home")}
                            className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl"
                        >
                            Park Now
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="bg-indigo-600 pb-32 pt-12 px-6 rounded-b-[2.5rem] relative">
                <div className="flex items-center gap-4 text-white mb-8">
                    <div onClick={() => setActiveView("home")} className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer">
                        <ArrowLeft size={24} />
                    </div>
                    <h1 className="text-lg font-bold">Parking Ticket</h1>
                </div>

                <div className={`backdrop-blur-sm mx-auto w-max px-6 py-2 rounded-full flex items-center gap-2 text-white font-medium text-sm shadow-lg mb-6 ${ticketData.status === 'PARKING' ? 'bg-emerald-500/90 shadow-emerald-900/10' :
                        ticketData.status === 'RETRIEVE' ? 'bg-amber-500/90 shadow-amber-900/10' :
                            ticketData.status === 'RETRIEVED' ? 'bg-slate-500/90 shadow-slate-900/10' :
                                'bg-indigo-500/90 shadow-indigo-900/10'
                    }`}>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    {ticketData.status === 'PARKING' ? 'Active Parking Session' :
                        ticketData.status === 'RETRIEVE' ? 'Retrieval Requested' :
                            ticketData.status === 'RETRIEVED' ? 'Retrieved' : ticketData.status}
                </div>
            </div>

            <div className="px-6 -mt-24 relative z-10">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden filter drop-shadow-xl">
                    <div className="p-8 pb-6 bg-white relative">
                        <div className="text-center mb-6">
                            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Smart Parking System</p>
                            <h2 className="text-xl font-bold text-slate-900">Digital Parking Ticket</h2>
                            <p className="text-indigo-600 font-medium text-sm mt-1">{ticketData.parking_spot?.name}</p>
                        </div>

                        <div className="w-48 h-48 mx-auto bg-slate-50 rounded-2xl border-2 border-slate-100 p-4 flex items-center justify-center mb-2">
                            <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900" fill="currentColor">
                                <path d="M0 0h30v30H0V0zm40 0h20v10H40V0zm30 0h30v30H70V0zM10 10v10h10V10H10zm70 0v10h10V10H80zM0 40h10v10H0V40zm20 0h20v20H20V40zm40 0h10v10H60V40zm20 0h20v10H80V40zM0 60h10v20H0V60zm40 0h30v30H40V60zm-30 10v10h10V70H10zm70 0v10h20V70H80z" />
                                <rect x="45" y="45" width="10" height="10" rx="2" />
                            </svg>
                        </div>
                    </div>

                    <div className="relative h-6 bg-white flex items-center">
                        <div className="absolute left-0 w-6 h-6 bg-slate-50 rounded-r-full -ml-3" />
                        <div className="w-full border-t-2 border-dashed border-slate-200 mx-4" />
                        <div className="absolute right-0 w-6 h-6 bg-slate-50 rounded-l-full -mr-3" />
                    </div>

                    <div className="p-8 pt-6 bg-white space-y-6">

                        <div className="flex gap-4">
                            <div className="w-8 flex justify-center pt-1"><Hash size={20} className="text-slate-300" /></div>
                            <div>
                                <p className="text-xs text-slate-400 font-medium mb-0.5">Ticket ID</p>
                                <p className="text-slate-900 font-bold font-mono">{ticketData.id}</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-8 flex justify-center pt-1"><Car size={20} className="text-slate-300" /></div>
                            <div>
                                <p className="text-xs text-slate-400 font-medium mb-0.5">Vehicle</p>
                                <p className="text-slate-900 font-bold">{ticketData.car?.brand} {ticketData.car?.model}</p>
                                <p className="text-slate-500 text-sm">{ticketData.car?.license_plate}</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-8 flex justify-center pt-1"><MapPin size={20} className="text-slate-300" /></div>
                            <div>
                                <p className="text-xs text-slate-400 font-medium mb-0.5">Location</p>
                                <p className="text-slate-900 font-bold">{ticketData.parking_spot?.location}</p>
                                {ticketData.parked_pos && <p className="text-slate-500 text-sm">{ticketData.parked_pos}</p>}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-8 flex justify-center pt-1"><Clock size={20} className="text-slate-300" /></div>
                            <div>
                                <p className="text-xs text-slate-400 font-medium mb-0.5">Entry Time</p>
                                <p className="text-slate-900 font-bold">{formatDate(ticketData.parked_at)}</p>
                                <p className="text-slate-500 text-sm">Duration: {calculateDuration(ticketData.parked_at)}</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-8 flex justify-center pt-1"><CreditCard size={20} className="text-slate-300" /></div>
                            <div>
                                <p className="text-xs text-slate-400 font-medium mb-0.5">Amount Paid</p>
                                <p className="text-slate-900 font-bold text-lg">₹{ticketData.payment?.amount || 0}</p>
                                <p className="text-slate-500 text-sm">{ticketData.payment?.payment_type} • {ticketData.payment?.status}</p>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-50 text-center">
                            <p className="text-slate-300 text-xs font-medium">Powered by Smart Parking</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 space-y-4">
                    <button
                        onClick={handleRetrieveCar}
                        disabled={retrieving}
                        className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {retrieving ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Requesting...
                            </>
                        ) : (
                            <>
                                <Car size={20} />
                                Get My Car
                            </>
                        )}
                    </button>

                    <button className="w-full bg-white text-slate-700 font-bold py-4 rounded-2xl border border-slate-200 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
                        <Download size={20} />
                        Download Ticket
                    </button>

                    <button className="w-full bg-white text-slate-700 font-bold py-4 rounded-2xl border border-slate-200 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
                        <Share2 size={20} />
                        Share Ticket
                    </button>
                </div>

                <div className="mt-6 bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 items-start">
                    <Smartphone size={20} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold text-amber-800 text-sm">Keep this ticket handy</p>
                        <p className="text-amber-700 text-xs mt-1">Show this QR code when retrieving your vehicle</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
