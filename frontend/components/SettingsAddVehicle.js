"use client";

import { Car } from 'lucide-react';
import React, { useState, useEffect } from 'react'

export default function SettingsAddVehicle({ setActiveView, editVehicle = null }) {
    const [brand, setBrand] = useState("");
    const [model, setModel] = useState("");
    const [licensePlate, setLicensePlate] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const isEditing = editVehicle !== null;

    const carBrands = {
        Toyota: ["Camry", "Corolla", "Fortuner", "Innova", "Yaris"],
        Honda: ["City", "Civic", "Amaze", "Jazz", "CR-V"],
        Hyundai: ["Creta", "i20", "Venue", "Verna", "Tucson"],
        Maruti: ["Swift", "Dzire", "Baleno", "Brezza", "Ertiga"],
        Tata: ["Nexon", "Harrier", "Safari", "Punch", "Altroz"],
        Mahindra: ["Thar", "XUV700", "Scorpio", "Bolero", "XUV300"],
        Kia: ["Seltos", "Sonet", "Carnival", "Carens", "EV6"],
    };

    useEffect(() => {
        if (editVehicle) {
            setBrand(editVehicle.brand || "");
            setModel(editVehicle.model || "");
            setLicensePlate(editVehicle.license_plate || "");
        }
    }, [editVehicle]);

    const handleBrandChange = (e) => {
        setBrand(e.target.value);
        setModel("");
    };

    const handleSubmit = async () => {
        if (!brand || !model || !licensePlate) {
            setError("All fields are required");
            return;
        }

        try {
            setSaving(true);
            setError("");

            const token = sessionStorage.getItem("authToken");
            const url = isEditing
                ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/update-car/${editVehicle.id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/add-car`;

            const response = await fetch(url, {
                method: isEditing ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    brand,
                    model,
                    license_plate: licensePlate
                })
            });

            const data = await response.json();

            if (data.success) {
                setActiveView("vehicles");
            } else {
                setError(data.message || "Failed to save vehicle");
            }
        } catch (err) {
            console.error(err);
            setError("Something went wrong while saving");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="px-6 mt-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center">
                        <Car size={32} className="text-indigo-600" />
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Vehicle Brand
                        </label>
                        <select
                            value={brand}
                            onChange={handleBrandChange}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="">Select Brand</option>
                            {Object.keys(carBrands).map((brandName) => (
                                <option key={brandName} value={brandName}>
                                    {brandName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Vehicle Model
                        </label>
                        <select
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            disabled={!brand}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400"
                        >
                            <option value="">Select Model</option>
                            {brand && carBrands[brand]?.map((modelName) => (
                                <option key={modelName} value={modelName}>
                                    {modelName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            License Plate
                        </label>
                        <input
                            type="text"
                            value={licensePlate}
                            onChange={(e) => setLicensePlate(e.target.value)}
                            placeholder="e.g. MH 12 AB 1234"
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={() => setActiveView("vehicles")}
                        disabled={saving}
                        className="flex-1 py-3 px-4 bg-slate-100 rounded-xl text-slate-700 font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="flex-1 py-3 px-4 bg-indigo-600 rounded-xl text-white font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        {saving ? "Saving..." : (isEditing ? "Save Changes" : "Add Vehicle")}
                    </button>
                </div>
            </div>
        </div>
    )
}
