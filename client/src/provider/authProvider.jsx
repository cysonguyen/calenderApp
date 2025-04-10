"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

const AuthProvider = ({ children }) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (
            !token &&
            window.location.pathname !== "/login" &&
            window.location.pathname !== "/register"
        ) {
            router.push("/login");
        } else {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const decodedToken = jwtDecode(token);
            if (decodedToken.exp < Date.now() / 1000) {
                localStorage.removeItem("token");
                router.push("/login");
            }
        }
    }, [router]);

    if (isLoading) {
        return null;
    }

    return children;
};

export default AuthProvider;
