import { useState, useEffect } from "react";
import { Scan, MapPin, Clock, Calendar, ChevronRight, Trophy, Car, ParkingCircle } from "lucide-react";

function DashHome({ onScanClick }) {
    const [recentParking, setRecentParking] = useState([]);
    const [activeParking, setActiveParking] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecentParkedCars = async () => {
            try {
                const token = sessionStorage.getItem("authToken");
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/recent-parked-cars`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });

                const data = await response.json();
                if (data.success) {
                    const formattedData = data.data.map((item) => {
                        const parkedDate = new Date(item.parked_at);
                        const retrievedDate = item.retrieved_at ? new Date(item.retrieved_at) : new Date();
                        const durationMs = retrievedDate - parkedDate;
                        const hours = Math.floor(durationMs / (1000 * 60 * 60));
                        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

                        return {
                            id: item.id,
                            mall: item.parking_spot?.name || "Unknown",
                            location: item.parking_spot?.location || "Unknown",
                            date: parkedDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
                            parkedTime: parkedDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
                            time: `${hours}h ${minutes}m`,
                            plate: item.car?.license_plate || "Unknown",
                            price: `₹${item.payment?.amount || 0}`,
                            status: item.status?.toLowerCase() || "unknown",
                        };
                    });

                    const active = formattedData.filter((item) => item.status !== "retrieved");
                    const recent = formattedData.filter((item) => item.status === "retrieved");

                    setActiveParking(active);
                    setRecentParking(recent);
                }
            } catch (error) {
                console.error("Error fetching recent parked cars:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentParkedCars();
    }, []);

    return (
        <div className="bg-slate-50 min-h-full pb-32">
            <div className="bg-indigo-600 px-6 pt-8 pb-12 rounded-b-[2rem] relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className="text-white">
                        <h1 className="text-lg font-bold">Smart Parking</h1>
                        <p className="text-indigo-200 text-sm">Welcome back!</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30" />
                </div>

                <div className="bg-linear-to-r from-violet-600 to-indigo-500 rounded-2xl p-4 text-white relative overflow-hidden border border-white/10 shadow-lg shadow-indigo-900/20 mt-4">
                    <div className="relative z-10 max-w-[70%]">
                        <div className="flex items-center gap-1.5 text-amber-300 text-[10px] font-bold mb-1">
                            <Trophy size={12} fill="currentColor" />
                            #1 IN INDIA
                        </div>
                        <h2 className="font-bold text-lg leading-tight mb-1">Premium Parking Solution</h2>
                        <p className="text-indigo-100 text-[10px]">Trusted by 1M+ users nationwide</p>
                    </div>

                    <div className="absolute -right-2 top-1/2 -translate-y-1/2">
                        <Car size={80} className="text-white/20 rotate-12" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <Car size={48} className="text-red-500 drop-shadow-lg" fill="currentColor" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-5 -mt-6 relative z-20 space-y-6">

                <button onClick={onScanClick} className="w-full bg-orange-50 rounded-2xl p-4 border border-orange-100 shadow-sm hover:shadow-md transition-shadow text-left">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-orange-400 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/30">
                            <Scan className="text-white" size={28} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-800">Scan to Park</h3>
                            <p className="text-slate-500 text-xs mt-0.5">Scan QR code at parking entrance</p>
                        </div>
                        <ChevronRight className="text-slate-300" size={20} />
                    </div>
                </button>

                <div>
                    <h3 className="font-bold text-slate-800 mb-3 px-1">Active Parking</h3>

                    {loading ? (
                        <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200 animate-pulse">
                            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                        </div>
                    ) : activeParking.length === 0 ? (
                        <div className="bg-slate-50 rounded-2xl p-6 border border-dashed border-slate-200 text-center">
                            <ParkingCircle className="mx-auto text-slate-300 mb-2" size={40} />
                            <p className="text-slate-500 text-sm font-medium">No active parking</p>
                            <p className="text-slate-400 text-xs mt-1">Scan a QR code to start parking</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {activeParking.map((item) => (
                                <div key={item.id} className={`rounded-2xl p-4 border relative overflow-hidden ${item.status === 'parking' ? 'bg-emerald-50 border-emerald-100' :
                                        item.status === 'retrieve' ? 'bg-amber-50 border-amber-100' :
                                            'bg-slate-50 border-slate-100'
                                    }`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${item.status === 'parking' ? 'bg-emerald-500 shadow-emerald-500/20' :
                                                    item.status === 'retrieve' ? 'bg-amber-500 shadow-amber-500/20' :
                                                        'bg-slate-500 shadow-slate-500/20'
                                                }`}>
                                                <span className="font-bold text-lg">{item.status === 'parking' ? 'In' : 'Out'}</span>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800">{item.mall}</h3>
                                                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                                    <span className="flex items-center gap-1"><Clock size={12} /> {item.parkedTime}</span>
                                                    <span className="flex items-center gap-1"><Car size={12} /> {item.plate}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight className="text-slate-400" size={16} />
                                    </div>

                                    <div className="flex items-center">
                                        <div className={`text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 ${item.status === 'parking' ? 'bg-emerald-500' :
                                                item.status === 'retrieve' ? 'bg-amber-500' :
                                                    'bg-slate-500'
                                            }`}>
                                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                            {item.status === 'parking' ? 'Parking' :
                                                item.status === 'retrieve' ? 'Retrieval Requested' : item.status} - {item.time}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <h3 className="font-bold text-slate-800 mb-3 px-1">Recent Parking</h3>
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2].map((i) => (
                                <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm animate-pulse">
                                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    ) : recentParking.length === 0 ? (
                        <div className="bg-white rounded-2xl p-6 border border-dashed border-slate-200 text-center">
                            <Car className="mx-auto text-slate-300 mb-2" size={40} />
                            <p className="text-slate-500 text-sm font-medium">No parking history</p>
                            <p className="text-slate-400 text-xs mt-1">Your completed parking sessions will appear here</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentParking.map((item) => (
                                <div key={item.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="font-bold text-slate-800">{item.mall}</h4>
                                            <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                                                <MapPin size={12} />
                                                {item.location}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="block font-bold text-slate-800">{item.price}</span>
                                            <span className="inline-block bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1">
                                                {item.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="border-t border-slate-50 pt-3 flex items-center gap-4 text-xs text-slate-500">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={12} />
                                            {item.date}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Car size={12} />
                                            {item.plate}
                                        </div>
                                        <div className="ml-auto font-medium">
                                            {item.time}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

export default DashHome;