"use client";
import Image from "next/image";
import * as Icons from "react-icons/ai";
import listMenu from "@/app/data/menu.json";
import ThemeToggle from "@/app/components/customTheme";
import { Logout } from "@/app/auth/logout";
import ClockBar from "@/app/components/clockBar";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/authContext";
import Breadcrumbs from "./breadcrumbs";
// import { redirect } from "next/navigation";
const Layout = ({ children }) => {
  const { token, pathname, idUser } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.log(idUser)
  }, []);

  if (!mounted) return null;

  if (!token || pathname === "/auth" || pathname === "/not-found") {
    return <div>{children}</div>;
  }

  return (
    <div className="h-screen flex flex-col">
      <ClockBar />
      <div className="drawer 2xl:drawer-open">
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col">
          <div className="navbar bg-base-200 w-full sticky top-0 z-50">
            <div className="flex-none 2xl:hidden">
              <label htmlFor="my-drawer-2" aria-label="open sidebar" className="btn btn-square btn-ghost">
                <Icons.AiOutlineMenu className="inline-block text-lg" />
              </label>
            </div>
            <div className="mx-2 flex-1 px-2 font-semibold"></div>
            <div className="hidden flex-none 2xl:block">
              <div className="flex menu-horizontal items-center gap-2">
                <ThemeToggle />
                <Logout />
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
          <Breadcrumbs/>
            {children}
          </div>
        </div>
        {/* Sidebar */}
        <div className="drawer-side z-50">
          <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>
          <div className="menu bg-base-200 text-base-content font-semibold min-h-full w-64 p-4 gap-4">
          <div className="flex justify-center">
            <Image
              src="/logo-viana.png"
              alt="Logo"
              width={150}
              height={150}
              className={`transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
              onLoadingComplete={() => setLoaded(true)}
            />
          </div>
          <ul className="flex flex-col gap-2 py-2">
            {listMenu?.map((item, index) => {
              const IconComponents = item.icon ? Icons[item.icon] : null;
              return (
                <li key={index} >
                  <a href={item.url} className={pathname === item.url ? `items-center bg-red-900 box-shadow rounded-xl text-white py-2` : `rounded-xl py-2 ` + `my-0.5`}>
                    {IconComponents && <IconComponents className="inline-block mr-2 text-xl" />}
                    {item.name}
                  </a>
                </li>
              );
            })}
            <div className="lg:hidden absolute bottom-5">
              <div className="flex flex-col items-start gap-2">
              <div className="flex">
                <ThemeToggle />
                <Logout />
              </div>
              </div>
            </div>
          </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
