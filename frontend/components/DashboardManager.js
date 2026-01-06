"use client";

import { Search, Phone, Car, Clock, MapPin, User, RefreshCw, ChevronLeft, IndianRupee, CheckCircle, UserPlus } from "lucide-react";
import { useState } from "react";

export default function DashboardManager({ onBack }) {
    const [activeTab, setActiveTab] = useState("all");
    const [expandedCard, setExpandedCard] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const valets = [
        { id: "V001", name: "Rajesh Kumar" },
        { id: "V002", name: "Amit Singh" },
        { id: "V003", name: "Suresh Patel" },
        { id: "V004", name: "Vikram Sharma" },
    ];

    const mockVehicles = [
        {
            id: 1,
            ticket: "PKG-1234",
            plate: "MH02AB1234",
            model: "Honda City",
            color: "White",
            customer: "Amit Sharma",
            timeIn: "5 Jan, 08:35 pm",
            duration: "2h 0m",
            status: "parked",
            location: "Phoenix Mall",
            address: "Lower Parel, Mumbai",
            payment: 150,
            paymentStatus: "Paid",
            valet: { id: "V001", name: "Rajesh Kumar" },
        },
        {
            id: 2,
            ticket: "PKG-1235",
            plate: "MH01CD5678",
            model: "Toyota Fortuner",
            color: "Silver",
            customer: "Priya Desai",
            timeIn: "5 Jan, 11:45 am",
            duration: "3h 45m",
            status: "retrieving",
            location: "Phoenix Mall",
            address: "Lower Parel, Mumbai",
            payment: 200,
            paymentStatus: "Paid",
            valet: { id: "V002", name: "Amit Singh" },
        },
        {
            id: 3,
            ticket: "PKG-1236",
            plate: "MH04EF9012",
            model: "Hyundai Creta",
            color: "Black",
            customer: "Rahul Mehta",
            timeIn: "5 Jan, 12:30 pm",
            duration: "2h 30m",
            status: "parked",
            location: "Phoenix Mall",
            address: "Lower Parel, Mumbai",
            payment: 180,
            paymentStatus: "Pending",
            valet: { id: "V004", name: "Vikram Sharma" },
        },
        {
            id: 4,
            ticket: "PKG-1237",
            plate: "MH03GH3456",
            model: "Maruti Swift",
            color: "Red",
            customer: "Sneha Patel",
            timeIn: "5 Jan, 09:15 am",
            duration: "5h 20m",
            status: "retrieved",
            location: "Phoenix Mall",
            address: "Lower Parel, Mumbai",
            payment: 250,
            paymentStatus: "Paid",
            valet: { id: "V003", name: "Suresh Patel" },
        },
        {
            id: 5,
            ticket: "PKG-1238",
            plate: "MH02IJ7890",
            model: "Tata Nexon",
            color: "Blue",
            customer: "Vikram Rao",
            timeIn: "5 Jan, 10:00 am",
            duration: "4h 35m",
            status: "parked",
            location: "Phoenix Mall",
            address: "Lower Parel, Mumbai",
            payment: 175,
            paymentStatus: "Pending",
            valet: { id: "V001", name: "Rajesh Kumar" },
        },
    ];

    // Calculate stats
    const stats = {
        activeCars: mockVehicles.filter(v => v.status === 'parked').length,
        retrieving: mockVehicles.filter(v => v.status === 'retrieving').length,
        totalToday: mockVehicles.length,
        revenue: mockVehicles.reduce((sum, v) => sum + v.payment, 0),
    };

    // Filter counts
    const tabCounts = {
        all: mockVehicles.length,
        parked: mockVehicles.filter(v => v.status === 'parked').length,
        retrieving: mockVehicles.filter(v => v.status === 'retrieving').length,
        retrieved: mockVehicles.filter(v => v.status === 'retrieved').length,
    };

    const filteredVehicles = mockVehicles.filter(v => {
        const matchesTab = activeTab === 'all' ? true : v.status === activeTab;
        const matchesSearch = searchQuery === '' ? true :
            v.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.valet?.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const toggleExpand = (id) => {
        setExpandedCard(expandedCard === id ? null : id);
    };

    return (
        <div className="pb-32 bg-slate-50 min-h-screen">
            <div className="bg-white pt-4 pb-3 px-5 border-b border-slate-100 sticky top-0 z-20">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onBack}
                            className="w-8 h-8 flex items-center justify-center"
                        >
                            <ChevronLeft size={22} className="text-slate-800" />
                        </button>
                        <h1 className="text-slate-900 text-base font-semibold">Manager Dashboard</h1>
                    </div>

                </div>
                <p className="text-slate-500 text-xs mt-1 ml-10">Manage valet assignments and parking operations</p>
            </div>

            <div className="grid grid-cols-2 gap-3 px-5 mt-5">
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <p className="text-slate-500 text-sm mb-1">Active Cars</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.activeCars}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <p className="text-slate-500 text-sm mb-1">Retrieving</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.retrieving}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <p className="text-slate-500 text-sm mb-1">Total Today</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.totalToday}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <p className="text-slate-500 text-sm mb-1">Revenue</p>
                    <p className="text-3xl font-bold text-slate-900">₹{stats.revenue}</p>
                </div>
            </div>

            <div className="px-5 mt-5">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by plate, customer or valet..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white text-slate-900 placeholder-slate-400 pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-400"
                    />
                </div>
            </div>

            <div className="flex px-5 mt-4 gap-2 overflow-x-auto scrollbar-hide">
                {['all', 'parked', 'retrieving', 'retrieved'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-colors ${activeTab === tab
                            ? 'bg-slate-900 text-white'
                            : 'bg-white text-slate-600 border border-slate-200'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)} ({tabCounts[tab]})
                    </button>
                ))}
            </div>

            <div className="px-5 mt-5 space-y-4">
                {filteredVehicles.map((vehicle) => (
                    <div
                        key={vehicle.id}
                        className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
                    >
                        <div className="p-4">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                                    <Car size={20} className="text-slate-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-semibold text-slate-900">{vehicle.model}</h4>
                                            <p className="text-sm text-slate-500 font-mono">{vehicle.plate}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${vehicle.status === 'retrieving'
                                            ? 'bg-amber-100 text-amber-700'
                                            : vehicle.status === 'retrieved'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-emerald-100 text-emerald-700'
                                            }`}>
                                            {vehicle.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4">
                                <div className="flex items-center gap-2">
                                    <User size={14} className="text-slate-400" />
                                    <span className="text-xs text-slate-500">Customer</span>
                                </div>
                                <p className="text-sm font-medium text-slate-900 ml-6 mt-0.5">{vehicle.customer}</p>
                            </div>

                            <div className="mt-4">
                                <div className="flex items-center gap-2">
                                    <User size={14} className="text-slate-400" />
                                    <span className="text-xs text-slate-500">Valet Assigned</span>
                                </div>
                                <div className="flex items-center justify-between ml-6 mt-0.5">
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">{vehicle.valet?.name || "Not Assigned"}</p>
                                        {vehicle.valet && (
                                            <p className="text-xs text-slate-500">ID: {vehicle.valet.id}</p>
                                        )}
                                    </div>
                                    {vehicle.valet && (
                                        <button className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                                            <Phone size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <button
                                className="w-full mt-4 py-3 px-4 bg-slate-100 rounded-xl text-slate-700 font-medium text-sm flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors border border-slate-200"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpand(vehicle.id);
                                }}
                            >
                                <RefreshCw size={16} />
                                Reassign Valet
                            </button>

                            <div className="mt-4">
                                <div className="flex items-center gap-2">
                                    <MapPin size={14} className="text-slate-400" />
                                    <span className="text-xs text-slate-500">Location</span>
                                </div>
                                <p className="text-sm font-medium text-slate-900 ml-6 mt-0.5">{vehicle.location}</p>
                                <p className="text-xs text-slate-500 ml-6">{vehicle.address}</p>
                            </div>

                            <div className="mt-4">
                                <div className="flex items-center gap-2">
                                    <Clock size={14} className="text-slate-400" />
                                    <span className="text-xs text-slate-500">Entry Time</span>
                                </div>
                                <p className="text-sm font-medium text-slate-900 ml-6 mt-0.5">{vehicle.timeIn}</p>
                                <p className="text-xs text-slate-500 ml-6">Duration: {vehicle.duration}</p>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <IndianRupee size={14} className="text-slate-400" />
                                            <span className="text-xs text-slate-500">Payment</span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-900 ml-6 mt-0.5">₹{vehicle.payment}</p>
                                    </div>
                                    <span className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 ${vehicle.paymentStatus === 'Paid'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-amber-100 text-amber-700'
                                        }`}>
                                        {vehicle.paymentStatus === 'Paid' && <CheckCircle size={12} />}
                                        {vehicle.paymentStatus}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
