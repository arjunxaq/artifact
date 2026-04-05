import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../api/supabaseClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [session, setSession] = useState(null);

    useEffect(() => {
        // Get existing session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen to auth changes
        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
            }
        );

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    const signup = async (email, password) => {
        setLoading(true);
        const result = await supabase.auth.signUp({ email, password });
        setLoading(false);
        return result;
    };


    const login = async (email, password) => {
        const result = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (result.data?.session) {
            const token = result.data.session.access_token;

            await fetch((import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api") + "/contracts/link", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            await fetch((import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api") + "/keys/init", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        }

        return result;
    };


    const logout = async () => {
        return supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider
            value={{ user, session, loading, signup, login, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
