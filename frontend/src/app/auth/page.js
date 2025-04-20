"use client";

import { authAPI } from "@/lib/apiAccess";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useAuth } from "../context/authContext";
export default function Auth() {
  const router = useRouter();
  const {loading, setLoading, setUserId} = useAuth()
  const [username, setUsername] = useState("viana@dishub.jogjaprov.go.id");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  

  useEffect(() => {
    // Pastikan kode hanya berjalan di client
    const storedToken = Cookies.get("token");
    if (storedToken) {
      router.push("/");
    }
  }, []); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Reset error sebelum validasi

    try {
      // Simulasi validasi user
      if (username === "viana@dishub.jogjaprov.go.id" && password === "password") {
        const fakeToken = "mocked.jwt.token";
        Cookies.set("token", fakeToken, { expires: 0.5, path: "/" });

        router.push("/"); // Redirect setelah login
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
    };
    
    // test login fetch api login to dashboard
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const response = await authAPI.login({email: username, password: password});
  //     const { token, userId } = response.data.data;
  //     Cookies.set("token", token, { expires: 0.2, path: "/" }); // 0.2 hari
  //     Cookies.set("id_user", userId, { expires: 0.2, path: "/" }); // 0.2 hari
  //     router.push("/"); // Redirect setelah login
  //     console.log(userId)
  //     setUserId(userId)
  //   } catch (error) {
  //     if (error.response?.status === 401) {
  //       setError("Invalid username or password");
  //     } else if (error.response?.status) {
  //       setError("Something went wrong");
  //     } else {
  //       setError("Cannot connect to server");
  //     }
  //   }
  // };

  return (
    <div className="text-center bg-[url(/image/bg-login-viana.png)] bg-repeat bg-cover w-full h-full bg-center">
      <div className="flex min-h-screen items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[400px] h-[400px] bg-red-900 blur-3xl opacity-50 rounded-full"></div>
        </div>
        <div>

        <form onSubmit={handleSubmit} className="p-6 bg-white/90 shadow-md backdrop-blur-2xl rounded-3xl w-96 gap-2 flex flex-col pt-5 pb-5">
          <div className="text-left gap-2 flex flex-col">
            <div className="flex items-center w-full justify-between">
              <h3 className="text-sm font-semibold">WELCOME BACK</h3>
              <Image 
                src="/image/IC_SMART MOBILITY.png"
                alt="Logo Viana"
                width={80}
                height={80}
                className={`transition-opacity py-5 drop-shadow-2xl duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
                onLoadingComplete={() => setLoaded(true)}
              />
            </div>
            <h2 className="text-2xl font-semibold ">Log In to your Account</h2>
          </div>
          <div>
            <fieldset className="fieldset">
              <legend className="fieldset-legend text-left">Username</legend>
              <input
                className="input w-full rounded-2xl bg-white/10 backdrop-blur-md  placeholder-gray-300"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend text-left">Password</legend>
              <input
                className="input w-full rounded-2xl bg-white/10 backdrop-blur-md placeholder-gray-300"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </fieldset>
          </div>
          <button type="submit" className="btn bg-neutral-800 text-white py-2 rounded-2xl border-none shadow-none mt-5" disabled={loading}>
            {loading ? "Loading..." : "Login"}
          </button>
            {error && <p className="text-red-500">{error}</p>}
        </form>
        </div>
      </div>
    </div>
  );
}
