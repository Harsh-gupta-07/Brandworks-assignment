"use client";

import { Calendar, MapPin, CreditCard, Download, ChevronDown, ChevronUp, Hash, Clock, Car, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function DashHistory() {
    const [expandedId, setExpandedId] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        hasNextPage: false,
        hasPrevPage: false
    });

    const fetchHistory = async (page = 1, append = false) => {
        try {
            if (append) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }
            setError(null);

            const token = sessionStorage.getItem("authToken");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/recent-parked-cars?page=${page}&limit=5`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            const data = await response.json();

            if (data.success) {
                if (append) {
                    setHistory(prev => [...prev, ...data.data]);
                } else {
                    setHistory(data.data);
                }
                setPagination(data.pagination);
            } else {
                setError(data.message || "Failed to fetch history");
            }
        } catch (err) {
            console.error("Error fetching history:", err);
            setError("Failed to fetch parking history");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const loadMore = () => {
        if (pagination.hasNextPage && !loadingMore) {
            fetchHistory(pagination.currentPage + 1, true);
        }
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    };

    const formatTime = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
    };

    const calculateDuration = (parkedAt, retrievedAt) => {
        if (!parkedAt) return "N/A";
        const start = new Date(parkedAt);
        const end = retrievedAt ? new Date(retrievedAt) : new Date();
        const diffMs = end - start;
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "RETRIEVED":
                return "text-emerald-700 bg-emerald-100";
            case "PARKING":
                return "text-blue-700 bg-blue-100";
            case "RETRIEVE":
                return "text-amber-700 bg-amber-100";
            default:
                return "text-slate-700 bg-slate-100";
        }
    };

    const formatPaymentType = (type) => {
        switch (type) {
            case "UPI": return "UPI";
            case "CARD": return "Card";
            case "CASH": return "Cash";
            case "NET_BANKING": return "Net Banking";
            default: return type || "N/A";
        }
    };

    if (loading) {
        return (
            <div className="pb-32 min-h-screen bg-slate-50">
                <div className="bg-white pt-6 pb-6 px-6 shadow-sm border-b border-slate-100 sticky top-0 z-10">
                    <h1 className="text-2xl font-bold text-slate-900">History</h1>
                    <p className="text-slate-500 text-sm">Your past parking sessions</p>
                </div>
                <div className="flex items-center justify-center mt-20">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="pb-32 min-h-screen bg-slate-50">
                <div className="bg-white pt-6 pb-6 px-6 shadow-sm border-b border-slate-100 sticky top-0 z-10">
                    <h1 className="text-2xl font-bold text-slate-900">History</h1>
                    <p className="text-slate-500 text-sm">Your past parking sessions</p>
                </div>
                <div className="px-6 mt-10 text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button
                        onClick={() => fetchHistory()}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="pb-32 min-h-screen bg-slate-50">
            <div className="bg-white pt-6 pb-6 px-6 shadow-sm border-b border-slate-100 sticky top-0 z-10">
                <h1 className="text-2xl font-bold text-slate-900">History</h1>
                <p className="text-slate-500 text-sm">Your past parking sessions</p>
            </div>

            <div className="px-6 mt-6 space-y-4">
                {history.length === 0 ? (
                    <div className="text-center py-10">
                        <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">No parking history found</p>
                    </div>
                ) : (
                    <>
                        {history.map((item) => {
                            const isExpanded = expandedId === item.id;
                            return (
                                <div
                                    key={item.id}
                                    className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300 ${isExpanded ? "ring-2 ring-indigo-500/10" : ""
                                        }`}
                                >
                                    <div
                                        onClick={() => toggleExpand(item.id)}
                                        className="p-4 cursor-pointer"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-lg">{item.parking_spot?.name || "Parking Spot"}</h3>
                                                <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5">
                                                    <MapPin size={12} />
                                                    {item.parking_spot?.location || "N/A"}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="font-bold text-slate-900 text-lg">₹{item.payment?.amount || 0}</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase mt-1 ${getStatusColor(item.status)}`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center text-slate-500 text-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar size={14} />
                                                    <span>{formatDate(item.parked_at)}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Car size={14} />
                                                    <span>{item.car?.license_plate || "N/A"}</span>
                                                </div>
                                            </div>
                                            <button className="text-slate-400">
                                                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            </button>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="border-t border-slate-100 bg-slate-50/50">
                                            <div className="p-4 space-y-3">
                                                <div className="flex justify-between items-center mb-1">
                                                    <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Booking Details</h4>
                                                    <div className="flex items-center gap-1.5 bg-indigo-50 px-2 py-1 rounded text-[10px] mobile-text-compact">
                                                        <span className="text-slate-500 font-medium">Duration:</span>
                                                        <span className="text-indigo-700 font-bold">{calculateDuration(item.parked_at, item.retrieved_at)}</span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                                    <div className="flex gap-2">
                                                        <Hash size={14} className="text-slate-400 mt-0.5 shrink-0" />
                                                        <div>
                                                            <p className="text-[10px] text-slate-400 font-medium uppercase">Ticket ID</p>
                                                            <p className="text-slate-700 font-medium text-xs font-mono">{item.id}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <CreditCard size={14} className="text-slate-400 mt-0.5 shrink-0" />
                                                        <div>
                                                            <p className="text-[10px] text-slate-400 font-medium uppercase">Payment</p>
                                                            <p className="text-slate-700 font-medium text-xs">{formatPaymentType(item.payment?.payment_type)}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2 col-span-2">
                                                        <Car size={14} className="text-slate-400 mt-0.5 shrink-0" />
                                                        <div className="flex items-baseline gap-2">
                                                            <div>
                                                                <p className="text-[10px] text-slate-400 font-medium uppercase">Vehicle</p>
                                                                <span className="text-slate-700 font-bold text-xs">{item.car?.brand} {item.car?.model}</span>
                                                                <span className="text-[10px] text-slate-500 ml-1">({item.car?.license_plate})</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2 col-span-2">
                                                        <Clock size={14} className="text-slate-400 mt-0.5 shrink-0" />
                                                        <div className="flex-1 grid grid-cols-2 gap-4">
                                                            <div>
                                                                <p className="text-[10px] text-slate-400 font-medium uppercase">Entry</p>
                                                                <p className="text-slate-700 font-medium text-xs">{formatTime(item.parked_at)}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] text-slate-400 font-medium uppercase">Exit</p>
                                                                <p className="text-slate-700 font-medium text-xs">{item.retrieved_at ? formatTime(item.retrieved_at) : "—"}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button className="w-full bg-white text-indigo-600 border border-indigo-100 rounded-lg py-2.5 font-medium text-xs flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors mt-1 shadow-sm">
                                                    <Download size={14} />
                                                    Download Receipt
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {pagination.hasNextPage && (
                            <button
                                onClick={loadMore}
                                disabled={loadingMore}
                                className="w-full bg-white border border-slate-200 rounded-xl py-3 text-sm font-medium text-slate-600 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors disabled:opacity-50"
                            >
                                {loadingMore ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    <>Load More</>
                                )}
                            </button>
                        )}

                        <p className="text-center text-xs text-slate-400 pb-4">
                            Showing {history.length} of {pagination.totalCount} records
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
