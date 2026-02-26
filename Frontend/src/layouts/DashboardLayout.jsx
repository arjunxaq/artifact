import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    LayoutDashboard,
    FileText,
    PlusCircle,
    LogOut,
    User
} from "lucide-react";

export default function DashboardLayout() {
    const { user, logout } = useAuth();

    const navItems = [
        { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { name: "Contracts", path: "/contracts", icon: FileText },
        { name: "Create", path: "/create", icon: PlusCircle },
    ];

    return (
        <div className="min-h-screen flex bg-[#09090b] text-zinc-100">
            {/* Sidebar */}
            <aside className="w-72 border-r border-zinc-800/50 flex flex-col bg-[#09090b] z-20">
                <div className="h-20 px-8 flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                        <FileText className="text-white w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold text-white">
                        Artifact
                    </span>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `nav-item ${isActive ? "nav-item-active" : ""}`
                            }
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 mx-4 mb-6 glass-card rounded-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                            <User className="w-5 h-5 text-zinc-400" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate">{user?.email?.split('@')[0]}</p>
                            <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full h-10 flex items-center justify-center gap-2 rounded-xl text-zinc-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-h-screen">
                <header className="h-20 border-b border-zinc-800/50 flex items-center justify-between px-8 bg-[#09090b]/50 backdrop-blur-md sticky top-0 z-10">
                    <h2 className="text-lg font-medium text-zinc-400">
                        Welcome back
                    </h2>
                    <div className="flex items-center gap-4">
                    </div>
                </header>

                <main className="flex-1 p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
