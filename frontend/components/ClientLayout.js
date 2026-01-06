"use client";

import { RoleProvider } from "../app/context/RoleContext";
import { BottomNavStateProvider } from "../app/context/BottomNavContext";
import { AuthProvider, useAuth } from "../app/context/AuthContext";
import RoleSwitcher from "./RoleSwitcher";
import BottomNavWrapper from "./BottomNavWrapper";
import LoadingScreen from "./LoadingScreen";

function AuthenticatedLayout({ children }) {
    const { isLoading } = useAuth();

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <div className="min-h-screen bg-slate-200 flex flex-col items-center justify-center p-4 md:py-10">
            <div className="w-full max-w-[390px] h-[844px] bg-slate-50 md:rounded-[2.5rem] shadow-2xl overflow-hidden relative border-8 border-slate-900 ring-1 ring-black/5 md:mx-auto transition-all duration-300">
                <div className="absolute top-0 left-0 right-0 h-7 bg-slate-900/0 z-50 pointer-events-none" />
                <div className="h-full overflow-y-auto scrollbar-hide pb-20">
                    {children}
                </div>
                <BottomNavWrapper />
            </div>

            <div className="mt-8 w-full max-w-[420px]">
                <RoleSwitcher />
            </div>
        </div>
    );
}

export default function ClientLayout({ children }) {
    return (
        <AuthProvider>
            <RoleProvider>
                <BottomNavStateProvider>
                    <AuthenticatedLayout>
                        {children}
                    </AuthenticatedLayout>
                </BottomNavStateProvider>
            </RoleProvider>
        </AuthProvider>
    );
}
