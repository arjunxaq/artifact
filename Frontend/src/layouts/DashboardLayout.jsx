import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function DashboardLayout() {
    const { user, logout } = useAuth();

    const linkClass = ({ isActive }) =>
        `block px-4 py-2 rounded ${isActive
            ? "bg-indigo-600 text-white"
            : "text-slate-300 hover:bg-slate-800"
        }`;

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col">
                <div className="px-6 py-4 text-xl font-bold">
                    Artifact
                </div>

                <nav className="flex-1 px-2 space-y-1">
                    <NavLink to="/dashboard" end className={linkClass}>
                        Dashboard
                    </NavLink>
                    <NavLink to="/contracts" className={linkClass}>
                        Contracts
                    </NavLink>
                    <NavLink to="/create" className={linkClass}>
                        Create
                    </NavLink>
                </nav>

                <div className="px-4 py-4 border-t border-slate-700">
                    <p className="text-sm text-slate-400 mb-2">
                        {user?.email}
                    </p>
                    <button
                        onClick={logout}
                        className="w-full bg-red-600 py-2 rounded hover:bg-red-700"
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 bg-slate-100 p-6">
                <Outlet />
            </main>
        </div>
    );
}
