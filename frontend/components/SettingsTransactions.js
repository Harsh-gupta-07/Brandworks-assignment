"use client";

import { MapPin, Calendar, Car } from "lucide-react";
import { useState, useEffect } from "react";

export default function SettingsTransactions({ setActiveView }) {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = sessionStorage.getItem("authToken");
            if (!token) {
                setError("Authentication token not found");
                setLoading(false);
                return;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/payments`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to fetch transactions");
            }

            if (result.success) {
                setTransactions(result.data);
            } else {
                setError(result.message || "Failed to fetch transactions");
            }
        } catch (err) {
            console.error("Error fetching transactions:", err);
            setError(err.message || "An error occurred while fetching transactions");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    };

    const getStatusDisplay = (status) => {
        const statusMap = {
            COMPLETED: { text: "completed", color: "text-emerald-700 bg-emerald-100" },
            PENDING: { text: "pending", color: "text-amber-700 bg-amber-100" },
            FAILED: { text: "failed", color: "text-red-700 bg-red-100" },
        };
        return statusMap[status] || { text: status.toLowerCase(), color: "text-slate-700 bg-slate-100" };
    };

    const getPaymentTypeDisplay = (paymentType) => {
        const typeMap = {
            CASH: "Cash",
            NET_BANKING: "Net Banking",
            UPI: "UPI",
            CARD: "Card",
        };
        return typeMap[paymentType] || paymentType;
    };

    if (loading) {
        return (
            <div className="px-6 mt-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Parking</h2>
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="px-6 mt-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Parking</h2>
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
                    <p className="text-red-700 font-medium">{error}</p>
                    <button
                        onClick={fetchTransactions}
                        className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="px-6 mt-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Parking</h2>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center">
                    <p className="text-slate-500">No transactions found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="px-6 mt-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Parking</h2>

            <div className="space-y-4">
                {transactions.map((transaction) => {
                    const statusDisplay = getStatusDisplay(transaction.status);
                    return (
                        <div
                            key={transaction.id}
                            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg">
                                        {transaction.parking_spot_name + " " + transaction.parking_location}
                                    </h3>
                                    <div className="flex items-center gap-1 text-slate-500 text-sm mt-0.5">
                                        <MapPin size={14} />
                                        <span>{getPaymentTypeDisplay(transaction.payment_type)}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="font-bold text-slate-900 text-lg">
                                        ₹{transaction.amount}
                                    </span>
                                    <div className="mt-1">
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusDisplay.color}`}>
                                            {statusDisplay.text}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                <div className="flex items-center gap-4 text-slate-500 text-sm">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={14} />
                                        <span>{formatDate(transaction.created_at)}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Car size={14} />
                                        <span>{transaction.car_license_plate}</span>
                                    </div>
                                </div>
                                <span className="text-slate-700 font-medium text-sm">
                                    {transaction.car_brand} {transaction.car_model}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}