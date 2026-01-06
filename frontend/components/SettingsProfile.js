"use client";

import { useState, useEffect } from "react";
import { User, Phone, Mail, Save } from "lucide-react";
import { useAuth } from "../app/context/AuthContext";

export default function SettingsProfile({ setActiveView }) {
    const { user, setUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const [profile, setProfile] = useState({
        name: "",
        phone: "",
        email: "",
    });
    const [editedProfile, setEditedProfile] = useState({ ...profile });

    useEffect(() => {
        if (user) {
            setProfile({
                name: user.name || "",
                phone: user.phone || "",
                email: user.email || ""
            });
            setEditedProfile({
                name: user.name || "",
                phone: user.phone || "",
                email: user.email || ""
            });
        }
    }, [user]);

    const handleEdit = () => {
        setIsEditing(true);
        setEditedProfile({ ...profile });
        setSuccessMsg("");
        setError("");
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError("");

            const token = sessionStorage.getItem("authToken");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/update-profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(editedProfile)
            });

            const data = await response.json();

            if (data.success) {
                setProfile({ ...editedProfile });
                setUser(prev => ({ ...prev, ...editedProfile }));

                setIsEditing(false);
                setSuccessMsg("Profile updated successfully");
            } else {
                setError(data.message || "Failed to update profile");
            }
        } catch (err) {
            console.error(err);
            setError("Something went wrong while saving");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedProfile({ ...profile });
        setError("");
    };

    return (
        <div className="px-6 mt-6">
            <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-3xl font-semibold">
                        {profile.name ? profile.name.charAt(0).toUpperCase() : <User />}
                    </span>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
                        {error}
                    </div>
                )}
                {successMsg && (
                    <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-xl text-sm">
                        {successMsg}
                    </div>
                )}

                <div className="space-y-5">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                            <User size={16} />
                            Full Name
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={editedProfile.name}
                                onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        ) : (
                            <p className="px-4 py-3 bg-slate-50 rounded-xl text-slate-900">{profile.name}</p>
                        )}
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                            <Phone size={16} />
                            Phone Number
                        </label>
                        {isEditing ? (
                            <input
                                type="tel"
                                value={editedProfile.phone}
                                onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        ) : (
                            <p className="px-4 py-3 bg-slate-50 rounded-xl text-slate-900">{profile.phone || "Not set"}</p>
                        )}
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                            <Mail size={16} />
                            Email Address
                        </label>
                        {isEditing ? (
                            <input
                                type="email"
                                value={editedProfile.email}
                                onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        ) : (
                            <p className="px-4 py-3 bg-slate-50 rounded-xl text-slate-900">{profile.email}</p>
                        )}
                    </div>
                </div>

                <div className="mt-6">
                    {isEditing ? (
                        <div className="flex gap-3">
                            <button
                                onClick={handleCancel}
                                disabled={saving}
                                className="flex-1 py-3 px-4 bg-slate-100 rounded-xl text-slate-700 font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 rounded-xl text-white font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                                {saving ? "Saving..." : <><Save size={18} /> Save</>}
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleEdit}
                            className="w-full py-3 px-4 bg-indigo-600 rounded-xl text-white font-medium hover:bg-indigo-700 transition-colors"
                        >
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}