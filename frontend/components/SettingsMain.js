import React from 'react'
import { Pencil, Car, FileText, HelpCircle, ChevronRight } from "lucide-react";
import { useAuth } from "../app/context/AuthContext";


function SettingsMain({ setActiveView }) {
    const { user } = useAuth();

    const menuItems = [
        {
            id: "vehicles",
            icon: Car,
            title: "Manage Vehicles",
            subtitle: "Saved Vehicles",
        },
        {
            id: "transactions",
            icon: FileText,
            title: "Transaction History",
            subtitle: "View all payments",
        },
        {
            id: "faq",
            icon: HelpCircle,
            title: "FAQ",
            subtitle: "Frequently Asked Questions",
        },
    ];
    return (
        <div className="px-6 mt-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xl font-semibold">{user.name[0]}</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">{user.name}</h2>
                            <p className="text-slate-500 text-sm">{user.phone}</p>
                        </div>
                    </div>
                    <button onClick={() => setActiveView("profile")} className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 hover:bg-indigo-100 transition-colors">
                        <Pencil size={18} />
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex items-center justify-between hover:border-indigo-200 transition-colors"
                        onClick={() => setActiveView(item.id)}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                                <item.icon size={20} />
                            </div>
                            <div className="text-left">
                                <h3 className="font-medium text-slate-900">{item.title}</h3>
                                <p className="text-slate-500 text-sm">{item.subtitle}</p>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-slate-400" />
                    </button>
                ))}
            </div>
        </div>
    )
}

export default SettingsMain