"use client";

import { useState, useEffect, useContext } from "react";
import { Car, Bell, MapPin, Clock, User, ChevronRight, Loader2 } from "lucide-react";
import { useAuth } from "../app/context/AuthContext";


export default function DashboardDriver() {
    const { user } = useAuth();
    const [unassignedCars, setUnassignedCars] = useState([]);
    const [parkingCars, setParkingCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDriverData();
    }, []);

    const fetchDriverData = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = sessionStorage.getItem("authToken");

            const unassignedResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/driver/unassigned-cars`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            const parkingResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/driver/parking-cars`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!unassignedResponse.ok || !parkingResponse.ok) {
                console.log(unassignedResponse, parkingResponse);
                throw new Error("Failed to fetch driver data");
            }

            const unassignedData = await unassignedResponse.json();
            const parkingData = await parkingResponse.json();
            console.log(unassignedData, parkingData);
            setUnassignedCars(unassignedData.data || []);
            setParkingCars(parkingData.data || []);
        } catch (err) {
            console.error("Error fetching driver data:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptAssignment = async (carId) => {
        try {
            const token = sessionStorage.getItem("authToken");

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/driver/assign/${carId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to accept assignment");
            }

            await fetchDriverData();
        } catch (err) {
            console.error("Error accepting assignment:", err);
            alert(err.message || "Failed to accept assignment");
        }
    };

    const handleMarkStatus = async (carId, currentStatus) => {
        try {
            const token = sessionStorage.getItem("authToken");

            const nextStatus = parkingCars[0].status === "PARKING" ? "PARKED" : "RETRIEVED";
            console.log(nextStatus);

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/driver/update-status/${carId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status: nextStatus })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to update status");
            }

            await fetchDriverData();
        } catch (err) {
            console.error("Error updating status:", err);
            alert(err.message || "Failed to update status");
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const newAssignment = unassignedCars.length > 0 ? unassignedCars[0] : null;
    const currentAssignment = parkingCars.length > 0 ? parkingCars[0] : null;

    const notificationCount = unassignedCars.length;

    if (loading) {
        return (
            <div className="bg-slate-50 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Loading driver dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-slate-50 min-h-screen flex items-center justify-center">
                <div className="text-center px-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-red-600 text-2xl">⚠️</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Error Loading Data</h2>
                    <p className="text-slate-600 mb-4">{error}</p>
                    <button
                        onClick={fetchDriverData}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen pb-32">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 px-6 pt-6 pb-5 rounded-b-[2rem] sticky top-0 z-10">
                <div className="flex justify-between items-start">
                    <div className="text-white">
                        <h1 className="text-lg font-bold">Driver Console</h1>
                        <p className="text-indigo-200 text-sm mt-1">Welcome back,</p>
                        <p className="text-xl font-bold">{user?.name || "Driver"}</p>
                    </div>
                    <button className="relative p-2">
                        <Bell className="text-white" size={24} />
                        {notificationCount > 0 && (
                            <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                {notificationCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <div className="px-5 mt-6 space-y-6">
                {/* New Assignments Section */}
                {newAssignment && (
                    <div>
                        <div className="flex items-center gap-2 mb-3 px-1">
                            <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <Bell size={14} className="text-indigo-600" />
                            </div>
                            <h3 className="font-bold text-slate-800">New Assignments</h3>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                                        <Car size={24} className="text-indigo-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-900">
                                            {newAssignment.car.brand} {newAssignment.car.model}
                                        </h4>
                                        <p className="text-sm text-slate-500 font-mono">{newAssignment.car.license_plate}</p>
                                        <span className={`inline-block mt-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${newAssignment.status === "RETRIEVE"
                                            ? "bg-orange-100 text-orange-600"
                                            : "bg-emerald-100 text-emerald-600"
                                            }`}>
                                            {newAssignment.status === "RETRIEVE" ? "Retrieve Vehicle" : "Park Vehicle"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleAcceptAssignment(newAssignment.id)}
                                className="w-full py-4 bg-indigo-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
                            >
                                Accept Assignment
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {!newAssignment && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Bell size={24} className="text-slate-400" />
                        </div>
                        <h3 className="font-bold text-slate-800 mb-1">No New Assignments</h3>
                        <p className="text-sm text-slate-500">You're all caught up!</p>
                    </div>
                )}

                {currentAssignment && (
                    <div>
                        <h3 className="font-bold text-slate-800 mb-3 px-1">Current Assignment</h3>

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                            {/* Vehicle Info */}
                            <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
                                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                                    <Car size={24} className="text-indigo-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-lg">
                                        {currentAssignment.car.brand} {currentAssignment.car.model}
                                    </h4>
                                    <p className="text-sm text-slate-500 font-mono">{currentAssignment.car.license_plate}</p>
                                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold border ${currentAssignment.status === "PARKING"
                                        ? "border-emerald-400 text-emerald-600 bg-emerald-50"
                                        : "border-orange-400 text-orange-600 bg-orange-50"
                                        }`}>
                                        {currentAssignment.status === "PARKING" ? "Park Vehicle" : "Retrieve Vehicle"}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4 mt-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mt-0.5">
                                        <User size={16} className="text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400">Customer</p>
                                        <p className="font-semibold text-slate-800">{currentAssignment.user.name}</p>
                                        <p className="text-sm text-slate-500">{currentAssignment.user.phone}</p>
                                    </div>
                                </div>

                                {currentAssignment.parked_pos && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mt-0.5">
                                            <MapPin size={16} className="text-slate-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400">Parking Position</p>
                                            <p className="font-semibold text-slate-800">{currentAssignment.parked_pos}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Assigned At */}
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mt-0.5">
                                        <Clock size={16} className="text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400">Parked at</p>
                                        <p className="font-semibold text-slate-800">{formatTime(currentAssignment.parked_at)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={() => handleMarkStatus(currentAssignment.id, currentAssignment.status)}
                                className={`w-full mt-6 py-3.5 rounded-xl font-bold text-white transition-colors ${currentAssignment.status === "PARKING"
                                    ? "bg-emerald-500 hover:bg-emerald-600"
                                    : "bg-orange-500 hover:bg-orange-600"
                                    }`}
                            >
                                {currentAssignment.status === "PARKING" ? "Mark as Parked" : "Mark as Retrieved"}
                            </button>
                        </div>
                    </div>
                )}

                {/* No Current Assignment */}
                {!currentAssignment && !newAssignment && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Car size={24} className="text-slate-400" />
                        </div>
                        <h3 className="font-bold text-slate-800 mb-1">No Active Assignments</h3>
                        <p className="text-sm text-slate-500">Check back later for new tasks</p>
                    </div>
                )}
            </div>
        </div>
    );
}
