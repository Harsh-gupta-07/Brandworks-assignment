"use client";
import { useState, useEffect } from "react";
import DashHome from "./DashHome";
import DashTickets from "./DashTickets";
import DashHistory from "./DashHistory";
import DashSettings from "./DashSettings";
import ConfirmParking from "./ConfirmParking";
import { useBottomNavState } from "../app/context/BottomNavContext";
import { X, Car, ChevronRight, Plus, QrCode, Loader2 } from "lucide-react";

export default function DashboardUser() {
    const { activeView, setActiveView, showConfirmParking, setShowConfirmParking, showScanner, setShowScanner } = useBottomNavState();
    const [showVehiclePopup, setShowVehiclePopup] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [showRegisterForm, setShowRegisterForm] = useState(false);
    const [newVehicle, setNewVehicle] = useState({ brand: "", model: "", plate: "" });
    const [vehicles, setVehicles] = useState([]);
    const [loadingVehicles, setLoadingVehicles] = useState(false);
    const [addingVehicle, setAddingVehicle] = useState(false);
    const [error, setError] = useState(null);

    const carBrands = {
        Toyota: ["Camry", "Corolla", "Fortuner", "Innova", "Yaris"],
        Honda: ["City", "Civic", "Amaze", "Jazz", "CR-V"],
        Hyundai: ["Creta", "i20", "Venue", "Verna", "Tucson"],
        Maruti: ["Swift", "Dzire", "Baleno", "Brezza", "Ertiga"],
        Tata: ["Nexon", "Harrier", "Safari", "Punch", "Altroz"],
        Mahindra: ["Thar", "XUV700", "Scorpio", "Bolero", "XUV300"],
        Kia: ["Seltos", "Sonet", "Carnival", "Carens", "EV6"],
    };

    const fetchUserCars = async () => {
        setLoadingVehicles(true);
        setError(null);
        try {
            const token = sessionStorage.getItem("authToken");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/cars`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            const data = await response.json();
            if (data.success) {
                const mappedVehicles = data.data.map(car => ({
                    id: car.id,
                    name: `${car.brand} ${car.model}`,
                    plate: car.license_plate,
                    brand: car.brand,
                    model: car.model
                }));
                setVehicles(mappedVehicles);
            } else {
                setError(data.message || "Failed to fetch vehicles");
            }
        } catch (err) {
            console.error("Error fetching cars:", err);
            setError("Failed to fetch vehicles");
        } finally {
            setLoadingVehicles(false);
        }
    };

    useEffect(() => {
        if (showVehiclePopup) {
            fetchUserCars();
        }
    }, [showVehiclePopup]);

    const handleScanClick = () => {
        setShowScanner(true);
        setScanning(true);
    };

    useEffect(() => {
        if (scanning) {
            const timer = setTimeout(() => {
                setScanning(false);
                setShowVehiclePopup(true);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [scanning]);

    const handleCloseScanner = () => {
        setShowScanner(false);
        setShowVehiclePopup(false);
        setScanning(false);
    };

    const handleSelectVehicle = (vehicle) => {
        setSelectedVehicle(vehicle);
        handleCloseScanner();
        setShowConfirmParking(true);
    };

    const handleBackFromConfirm = () => {
        setShowConfirmParking(false);
        setSelectedVehicle(null);
    };

    const handleRegisterVehicle = async () => {
        if (newVehicle.brand && newVehicle.model && newVehicle.plate.trim()) {
            setAddingVehicle(true);
            setError(null);
            try {
                const token = sessionStorage.getItem("authToken");
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/add-car`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        brand: newVehicle.brand,
                        model: newVehicle.model,
                        license_plate: newVehicle.plate.trim().toUpperCase()
                    })
                });
                const data = await response.json();
                if (data.success) {
                    const vehicle = {
                        id: data.data.id,
                        name: `${data.data.brand} ${data.data.model}`,
                        plate: data.data.license_plate,
                        brand: data.data.brand,
                        model: data.data.model
                    };
                    setVehicles([vehicle, ...vehicles]);
                    setNewVehicle({ brand: "", model: "", plate: "" });
                    setShowRegisterForm(false);
                } else {
                    setError(data.message || "Failed to add vehicle");
                }
            } catch (err) {
                console.error("Error adding car:", err);
                setError("Failed to add vehicle");
            } finally {
                setAddingVehicle(false);
            }
        }
    };

    return (
        <div className="min-h-full relative pb-20">
            {showConfirmParking ? (
                <ConfirmParking vehicle={selectedVehicle} onBack={handleBackFromConfirm} />
            ) : (
                <div>
                    {activeView === "home" && <DashHome onScanClick={handleScanClick} />}
                    {activeView === "ticket" && <DashTickets setActiveView={setActiveView} />}
                    {activeView === "history" && <DashHistory />}
                    {activeView === "settings" && <DashSettings />}
                </div>
            )}

            {showScanner && (
                <div className="absolute inset-0 z-100 bg-black">
                    <button
                        onClick={handleCloseScanner}
                        className="absolute top-12 right-6 z-110 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
                    >
                        <X className="text-white" size={24} />
                    </button>

                    <div className="h-full flex flex-col items-center justify-center relative">
                        <div className="relative w-64 h-64">
                            <div className="absolute top-0 left-0 w-12 h-12 border-l-4 border-t-4 border-indigo-500 rounded-tl-2xl" />
                            <div className="absolute top-0 right-0 w-12 h-12 border-r-4 border-t-4 border-indigo-500 rounded-tr-2xl" />
                            <div className="absolute bottom-0 left-0 w-12 h-12 border-l-4 border-b-4 border-indigo-500 rounded-bl-2xl" />
                            <div className="absolute bottom-0 right-0 w-12 h-12 border-r-4 border-b-4 border-indigo-500 rounded-br-2xl" />

                            <div className="absolute inset-0 flex items-center justify-center">
                                <QrCode className="text-white/30" size={120} />
                            </div>

                            {scanning && (
                                <div className="absolute left-4 right-4 h-0.5 bg-linear-to-r from-transparent via-indigo-500 to-transparent animate-scan-line" />
                            )}
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-white text-lg font-medium">
                                {scanning ? "Scanning..." : "Position QR code in frame"}
                            </p>
                            <p className="text-white/60 text-sm mt-2">
                                Point your camera at the parking QR code
                            </p>
                        </div>
                    </div>

                    {showVehiclePopup && (
                        <>
                            <div
                                className="absolute inset-0 bg-black/50 z-105"
                                onClick={handleCloseScanner}
                            />

                            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl z-110 animate-slide-up max-h-[70%] overflow-y-auto">
                                <div className="flex justify-center pt-3 pb-2">
                                    <div className="w-10 h-1 bg-slate-300 rounded-full" />
                                </div>

                                <div className="px-6 pb-8">
                                    <div className="mb-6">
                                        <h2 className="text-xl font-bold text-slate-800">Select Your Vehicle</h2>
                                        <p className="text-slate-500 text-sm mt-1">
                                            Choose which vehicle you're parking at Inorbit Mall
                                        </p>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        {loadingVehicles ? (
                                            <div className="flex items-center justify-center py-8">
                                                <Loader2 className="text-indigo-600 animate-spin" size={32} />
                                            </div>
                                        ) : error ? (
                                            <div className="text-center py-4">
                                                <p className="text-red-500 text-sm">{error}</p>
                                                <button
                                                    onClick={fetchUserCars}
                                                    className="mt-2 text-indigo-600 text-sm font-medium hover:underline"
                                                >
                                                    Try again
                                                </button>
                                            </div>
                                        ) : vehicles.length === 0 ? (
                                            <div className="text-center py-6">
                                                <Car className="text-slate-300 mx-auto mb-2" size={40} />
                                                <p className="text-slate-500 text-sm">No vehicles registered yet</p>
                                            </div>
                                        ) : (
                                            vehicles.map((vehicle) => (
                                                <button
                                                    key={vehicle.id}
                                                    onClick={() => handleSelectVehicle(vehicle)}
                                                    className="w-full flex items-center gap-4 p-4 bg-slate-50 hover:bg-indigo-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all group"
                                                >
                                                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                                                        <Car className="text-indigo-600" size={24} />
                                                    </div>
                                                    <div className="flex-1 text-left">
                                                        <h3 className="font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors">
                                                            {vehicle.name}
                                                        </h3>
                                                        <p className="text-slate-500 text-sm">{vehicle.plate}</p>
                                                    </div>
                                                    <ChevronRight className="text-slate-300 group-hover:text-indigo-400 transition-colors" size={20} />
                                                </button>
                                            ))
                                        )}
                                    </div>

                                    {showRegisterForm ? (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Brand</label>
                                                <select
                                                    value={newVehicle.brand}
                                                    onChange={(e) => setNewVehicle({ ...newVehicle, brand: e.target.value, model: "" })}
                                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-800 bg-white appearance-none cursor-pointer"
                                                >
                                                    <option value="">Select Brand</option>
                                                    {Object.keys(carBrands).map((brand) => (
                                                        <option key={brand} value={brand}>{brand}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Model</label>
                                                <select
                                                    value={newVehicle.model}
                                                    onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                                                    disabled={!newVehicle.brand}
                                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-800 bg-white appearance-none cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                                                >
                                                    <option value="">Select Model</option>
                                                    {newVehicle.brand && carBrands[newVehicle.brand]?.map((model) => (
                                                        <option key={model} value={model}>{model}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Number Plate</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. MH 12 AB 1234"
                                                    value={newVehicle.plate}
                                                    onChange={(e) => setNewVehicle({ ...newVehicle, plate: e.target.value })}
                                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-800 uppercase"
                                                />
                                            </div>
                                            {error && (
                                                <p className="text-red-500 text-sm text-center">{error}</p>
                                            )}
                                            <div className="flex gap-3 pt-2">
                                                <button
                                                    onClick={() => {
                                                        setShowRegisterForm(false);
                                                        setNewVehicle({ brand: "", model: "", plate: "" });
                                                        setError(null);
                                                    }}
                                                    disabled={addingVehicle}
                                                    className="flex-1 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleRegisterVehicle}
                                                    disabled={!newVehicle.brand || !newVehicle.model || !newVehicle.plate.trim() || addingVehicle}
                                                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                                                >
                                                    {addingVehicle ? (
                                                        <>
                                                            <Loader2 className="animate-spin" size={18} />
                                                            Adding...
                                                        </>
                                                    ) : (
                                                        "Add Vehicle"
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setShowRegisterForm(true)}
                                            className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl transition-colors shadow-lg shadow-indigo-600/30"
                                        >
                                            <Plus size={20} />
                                            Register New Vehicle
                                        </button>
                                    )}
                                </div>
                            </div>
                        </>
                    )
                    }
                </div >
            )}

            <style jsx>{`
                @keyframes scan-line {
                    0% { top: 0; }
                    50% { top: calc(100% - 2px); }
                    100% { top: 0; }
                }
                .animate-scan-line {
                    animation: scan-line 2s ease-in-out infinite;
                }
                @keyframes slide-up {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out forwards;
                }
            `}</style>
        </div >
    );
}
