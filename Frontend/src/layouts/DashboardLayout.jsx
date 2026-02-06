import { useAuth } from "../context/AuthContext";

export default function DashboardLayout({ children }) {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen flex flex-col">
            {/* Navbar */}
            <header className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
                <h1 className="text-lg font-semibold">
                    Artifact
                </h1>

                <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-300">
                        {user?.email}
                    </span>
                    <button
                        onClick={logout}
                        className="px-3 py-1 bg-red-600 rounded hover:bg-red-700"
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 p-6 bg-slate-100">
                {children}
            </main>
        </div>
    );
}
