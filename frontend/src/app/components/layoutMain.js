"use client";
import Image from "next/image";
import * as Icons from "react-icons/ai";
import * as FaIcons from "react-icons/fa";
import listMenu from "@/app/data/menu.json";
import ThemeToggle from "@/app/components/customTheme";
import { Logout } from "@/app/auth/logout";
// import ClockBar from "@/app/components/clockBar";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/authContext";
import Breadcrumbs from "./breadcrumbs";
import ProfileDropdown from "@/app/components/profileDropdown"
import PageWrapper from "./wrapper";
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
      {/* <ClockBar /> */}
      <div className="drawer 2xl:drawer-open">
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col">
          <div className="navbar bg-[#7585C1]/90 w-full sticky top-0 z-[50] 2xl:z-[60] h-20">
            <div className="flex-none 2xl:hidden">
              <label htmlFor="my-drawer-2" aria-label="open sidebar" className="btn btn-square btn-ghost">
                <Icons.AiOutlineMenu className="inline-block text-xl" />
              </label>
            </div>
            <div className="mx-2 flex-1 px-2 font-semibold w-full xl:justify-center flex">
            <Breadcrumbs/>
            </div>
            <div className="flex-none">
              <div className="flex menu-horizontal items-center gap-2">
                <ProfileDropdown />
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <PageWrapper>
              {children}
            </PageWrapper>
          </div>
        </div>
        {/* Sidebar */}
        <div className="drawer-side z-[50]">
          <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>
          <div className="menu bg-[#7585C1]/90 not-2xl:rounded-tr-4xl text-base-content font-semibold min-h-full p-0 w-64 gap-4">
          <div className="flex justify-center">
          <div className="rounded-tr-4xl bg-neutral-800/90 w-full h-20 p-5">
            <Image
              src="/image/IC_SMART MOBILITY.png"
              alt="Logo"
              width={150}
              height={150}
              className={`transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
              onLoadingComplete={() => setLoaded(true)}
            />
          </div>
          </div>
          <ul className="flex flex-col gap-2 p-2">
            {listMenu?.map((item, index) => {
              // Try to find the icon in the primary Icons library
                let IconComponent = item.icon && Icons[item.icon];
                
                // If not found in the primary library, try the FaIcons library
                if (!IconComponent && item.icon && FaIcons[item.icon]) {
                  IconComponent = FaIcons[item.icon];
                }              
                return (
                <li key={index} >
                  <a href={item.url} className={pathname === item.url ? `items-center bg-neutral-800/90 box-shadow rounded-xl text-white py-2` : `rounded-xl py-2 ` + `my-0.5 text-white`}>
                    {IconComponent && <IconComponent className="inline-block mr-2 text-xl" />}
                    {item.name}
                  </a>
                </li>
              );
            })}
            {/* <div className="lg:hidden absolute bottom-5">
              <div className="flex flex-col items-start gap-2">
              <div className="flex">
                <ProfileDropdown />
                <ThemeToggle />
                <Logout />
              </div>
              </div>
            </div> */}
          </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
