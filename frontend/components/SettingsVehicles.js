"use client";

import { useState, useEffect } from "react";
import { Car, Pencil, Trash2, Plus } from "lucide-react";

export default function SettingsVehicles({ setActiveView, onEditVehicle }) {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deleting, setDeleting] = useState(null);

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem("authToken");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/cars`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (data.success) {
                setVehicles(data.data);
            } else {
                setError("Failed to load vehicles");
            }
        } catch (err) {
            console.error(err);
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (vehicleId) => {
        if (!confirm("Are you sure you want to remove this vehicle?")) {
            return;
        }

        try {
            setDeleting(vehicleId);
            const token = sessionStorage.getItem("authToken");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/delete-car/${vehicleId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (data.success) {
                setVehicles(vehicles.filter(v => v.id !== vehicleId));
            } else {
                setError(data.message || "Failed to delete vehicle");
            }
        } catch (err) {
            console.error(err);
            setError("Something went wrong while deleting");
        } finally {
            setDeleting(null);
        }
    };

    const handleEdit = (vehicle) => {
        onEditVehicle(vehicle);
        setActiveView("edit-vehicle");
    };

    if (loading) {
        return (
            <div className="px-6 mt-6 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="px-6 mt-6">
            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {vehicles.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 border border-dashed border-slate-200 text-center">
                    <Car className="mx-auto text-slate-300 mb-3" size={48} />
                    <p className="text-slate-500 text-sm font-medium">No vehicles added</p>
                    <p className="text-slate-400 text-xs mt-1">Add your first vehicle to get started</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {vehicles.map((vehicle) => (
                        <div
                            key={vehicle.id}
                            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4"
                        >
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                                    <Car size={24} className="text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">{vehicle.brand} {vehicle.model}</h3>
                                    <p className="text-slate-600 text-sm">{vehicle.license_plate}</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleEdit(vehicle)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors"
                                >
                                    <Pencil size={16} />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(vehicle.id)}
                                    disabled={deleting === vehicle.id}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-red-50 border border-red-100 rounded-xl text-red-600 font-medium text-sm hover:bg-red-100 transition-colors disabled:opacity-50"
                                >
                                    <Trash2 size={16} />
                                    {deleting === vehicle.id ? "Removing..." : "Remove"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <button
                onClick={() => setActiveView("add-vehicle")}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-600 rounded-xl text-white font-medium hover:bg-indigo-700 transition-colors"
            >
                <Plus size={20} />
                Add New Vehicle
            </button>
        </div>
    );
}
