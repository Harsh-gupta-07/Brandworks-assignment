"use client";
import { ArrowLeft, Car, MapPin, Smartphone, CreditCard, Banknote, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "../app/context/AuthContext";
import { useState } from "react";

export default function ConfirmParking({ vehicle, onBack }) {
    const { user, getToken } = useAuth();
    const [paymentMethod, setPaymentMethod] = useState("UPI");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const paymentMethods = [
        { id: "UPI", name: "UPI", icon: Smartphone, color: "bg-indigo-100", iconColor: "text-indigo-600" },
        { id: "NET_BANKING", name: "Netbanking", icon: CreditCard, color: "bg-blue-100", iconColor: "text-blue-600" },
        { id: "CARD", name: "Credit/Debit Card", icon: CreditCard, color: "bg-emerald-100", iconColor: "text-emerald-600" },
        { id: "CASH", name: "Cash", icon: Banknote, color: "bg-orange-100", iconColor: "text-orange-600" },
    ];

    const parkingSpot = {
        id: "f13c6d9e-c3ff-4b44-980c-9b747bb75e22",
        name: "Inorbit Mall",
        address: "Malad West, Mumbai",
    };

    const pricing = {
        baseRate: 100,
        serviceFee: 30,
        gst: 20,
    };

    const totalAmount = pricing.baseRate + pricing.serviceFee + pricing.gst;

    const handleParkCar = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = getToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/park-car`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    car_id: vehicle.id,
                    parking_spot_id: parkingSpot.id,
                    amount: totalAmount,
                    payment_type: paymentMethod,
                    payment_status: "COMPLETED"
                })
            });
            const data = await response.json();
            if (data.success) {
                setSuccess(true);
            } else {
                setError(data.message || "Failed to park car");
            }
        } catch (err) {
            console.error("Error parking car:", err);
            setError("Failed to park car. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-50 min-h-full pb-32">
            <div className="bg-indigo-600 px-6 pt-8 pb-6 sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-lg font-bold text-white">Confirm Parking</h1>
                </div>
            </div>

            <div className="px-5 py-6 space-y-5">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 flex items-center gap-3">
                    <CheckCircle2 className="text-emerald-600" size={20} />
                    <span className="text-emerald-700 text-sm font-medium">Auto-filled from saved vehicle</span>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-600 mb-4">
                        <Car size={18} />
                        <span className="font-semibold text-sm">Vehicle Details</span>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-slate-500 text-sm">Owner</span>
                            <span className="text-slate-800 font-medium text-sm">{user?.name || "User"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 text-sm">Vehicle</span>
                            <span className="text-slate-800 font-medium text-sm">{vehicle?.name || "Honda Civic"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 text-sm">Number Plate</span>
                            <span className="text-slate-800 font-medium text-sm">{vehicle?.plate || "MH 14 CD 5678"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 text-sm">Mobile</span>
                            <span className="text-slate-800 font-medium text-sm">{user?.phone || "N/A"}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-600 mb-3">
                        <MapPin size={18} />
                        <span className="font-semibold text-sm">Parking Location</span>
                    </div>
                    <h3 className="font-bold text-slate-800">{parkingSpot.name}</h3>
                    <p className="text-slate-500 text-sm">{parkingSpot.address}</p>
                </div>

                <div>
                    <h3 className="font-bold text-slate-800 mb-2">Payment Method</h3>
                    <p className="text-slate-500 text-sm mb-4">Choose how you want to pay</p>
                    <div className="grid grid-cols-2 gap-3">
                        {paymentMethods.map((method, index) => {
                            const Icon = method.icon;
                            const isSelected = paymentMethod === method.id;
                            return (
                                <button
                                    key={method.id}
                                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${isSelected
                                        ? "border-indigo-500 bg-indigo-50"
                                        : "border-slate-100 bg-white hover:border-slate-200"
                                        }`}
                                    onClick={() => setPaymentMethod(method.id)}
                                >
                                    <div className={`w-12 h-12 ${method.color} rounded-xl flex items-center justify-center`}>
                                        <Icon className={method.iconColor} size={24} />
                                    </div>
                                    <span className="text-sm font-medium text-slate-700">{method.name}</span>
                                    {isSelected && (
                                        <CheckCircle2 className="text-indigo-600" size={16} />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-slate-600">Base Rate</span>
                            <span className="text-slate-800 font-medium">₹{pricing.baseRate}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600">Service Fee</span>
                            <span className="text-slate-800 font-medium">₹{pricing.serviceFee}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600">GST (18%)</span>
                            <span className="text-slate-800 font-medium">₹{pricing.gst}</span>
                        </div>
                        <div className="border-t border-slate-100 pt-3 flex justify-between">
                            <span className="text-slate-800 font-bold">Total Amount</span>
                            <span className="text-slate-800 font-bold">₹{totalAmount}</span>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                        <p className="text-red-600 text-sm font-medium">{error}</p>
                    </div>
                )}

                {success ? (
                    <div className="space-y-4">
                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-6 flex flex-col items-center gap-3">
                            <CheckCircle2 className="text-emerald-600" size={48} />
                            <h3 className="text-emerald-700 font-bold text-lg">Parking Confirmed!</h3>
                            <p className="text-emerald-600 text-sm text-center">Your car has been parked successfully. Payment of ₹{totalAmount} completed.</p>
                        </div>
                        <button
                            onClick={onBack}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl transition-colors shadow-lg shadow-indigo-600/30"
                        >
                            Back to Home
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleParkCar}
                        disabled={isLoading}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-2xl transition-colors shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Processing...
                            </>
                        ) : (
                            `Proceed to Pay ₹${totalAmount}`
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
