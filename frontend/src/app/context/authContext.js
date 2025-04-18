"use client";

import { createContext, useState, useEffect, useContext } from "react";
import Cookies from "js-cookie";
import { usePathname, notFound } from "next/navigation";
import {logout as LogoutExt} from "../auth/logout";
import { useRouter } from "next/navigation";

const AuthContext = createContext();
export function AuthProvider({ children }) {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [statusPath, setStatusPath] = useState(null);
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const [idUser, setUserId] = useState(0);
  useEffect(() => {
    const userId = Cookies.get("id_user");
    setUserId(userId)
    function parseJwt(token) {
      try {
        const parts = token.split('.');
        if (parts.length !== 3) {
          throw new Error("Token format is invalid");
        }
    
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
            .join('')
        );
    
        return JSON.parse(jsonPayload);
      } catch (e) {
        console.error("Invalid token format:", e);
        return null;
      }
    }
    function formatTime(date){
      return new Date(date).toLocaleString()
    }
    const checkToken = async () => {
      const storedToken = Cookies.get("token");
      // console.log("Stored Token:", storedToken);
      
      if (storedToken) {
        setToken(storedToken);
        if (pathname === "/auth" && storedToken) {
          window.location.href = "/";
        }
        // const decoded = parseJwt(storedToken)
        // const currentTime = Date.now() / 1000;
        
        // // console.log(decoded.exp, currentTime)
        // console.log(formatTime(decoded.exp * 1000), formatTime(currentTime * 1000))
        // if (decoded?.exp && currentTime > decoded.exp){
        //   LogoutExt()
        // }
      }
      
      await new Promise((resolve) => setTimeout(resolve, 0)); // Simulasi async agar `await` bisa dipakai
      setLoading(true);
    };
  
    checkToken();
  }, [pathname]);
  
  const isNotFound = pathname === "/not-found";
  useEffect(()=>{
    statusPath === "/not-found" && router.push("/not-found");
  },[statusPath])
  const login = (newToken) => {
    Cookies.set("token", newToken, { expires: 0.5, path: "/" });
    setToken(newToken);
  };

  const logout = () => {
    Cookies.remove("token");
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, pathname, isNotFound, setStatusPath, statusPath, loading, setLoading, setUserId, idUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
