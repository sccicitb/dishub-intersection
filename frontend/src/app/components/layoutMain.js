"use client";

import Image from "next/image";
import * as Icons from "react-icons/ai";
import * as FaIcons from "react-icons/fa";
import * as RiIcons from "react-icons/ri";
import * as MdIcons from "react-icons/md";
import listMenu from "@/data/menu.json";
import listMenuMobility from "@/data/menuMobility.json";
import ThemeToggle from "@/app/components/customTheme";
import { Logout } from "@/app/auth/logout";
// import ClockBar from "@/app/components/clockBar";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/authContext";
import Breadcrumbs from "./breadcrumbs";
import ProfileDropdown from "@/app/components/profileDropdown"
import PageWrapper from "./wrapper";
// import { redirect } from "next/navigation";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Layout = ({ children }) => {
  const { token, pathname, idUser, user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [menu, setMenu] = useState([]);

  useEffect(() => {
    setMounted(true);
    // console.log(idUser)
  }, []);

  const hasAccess = (menuItem) => {
    // Jika user belum ter-load, return false untuk safety
    if (!user) return false;

    const userRoles = user.roles?.map(item => item.name.toLowerCase()) || [];
    // console.log(userRoles)
    const menuUrl = menuItem.url;

    const roleBasedMenus = {
      '/manajemen-user': ['admin'],
      '/manajemen-kamera': ['admin'],
      "/form-sa-i": ['admin', 'operator'],
      "/form-sa-ii": ['admin', 'operator'],
      "/form-sa-iii": ['admin', 'operator'],
      "/form-sa-iv": ['admin', 'operator'],
      "/form-sa-v": ['admin', 'operator'],
    };

    // Check jika menu memerlukan role khusus
    const requiredRoles = roleBasedMenus[menuUrl];
    if (requiredRoles) {
      return requiredRoles.some(role => userRoles.includes(role));
    }

    return true;
  }

  const filterMenuByRole = (menuList) => {
    if (!user || !menuList) return [];

    return menuList.filter(item => hasAccess(item));
  };

  useEffect(() => {
    const baseMenu = pathname === "/dashboard/mobility" ? listMenuMobility : listMenu;
    const filteredMenu = filterMenuByRole(baseMenu);
    setMenu(filteredMenu);
  }, [pathname, user])

  if (!mounted) return null;

  // if (!token || pathname === "/auth" || pathname === "/not-found") {
  //   return <div>{children}</div>;
  // }

  if (!token && pathname !== "/dashboard/mobility" || pathname === "/auth" || pathname === "/not-found") {
    return (
      <div>
        <ToastContainer
          position="top-center"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        {children}
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">

      {/* <ClockBar /> */}
      <div className="drawer 2xl:drawer-open">
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col">
          <div className="navbar bg-[#232f61]/90 w-full sticky top-0 z-[20] 2xl:z-[40] h-16">
            <div className="flex-none 2xl:hidden">
              <label htmlFor="my-drawer-2" aria-label="open sidebar" className="btn btn-square btn-ghost">
                <Icons.AiOutlineMenu className="inline-block text-xl" />
              </label>
            </div>
            {pathname !== "/dashboard/mobility" && (
              <div className="lg:mx-2 flex-1 lg:px-2 font-semibold w-fit xl:w-full xl:justify-center flex not-xl:overflow-hidden not-xl:text-ellipsis">
                <Breadcrumbs />
              </div>
            )}
            {pathname !== "/dashboard/mobility" && (
              <div className="flex-none">
                <div className="flex menu-horizontal items-center gap-2">
                  <ProfileDropdown />
                </div>
              </div>
            )}
          </div>
          <div className="flex-1 overflow-auto">
            <PageWrapper>
              <ToastContainer />
              {children}
            </PageWrapper>
          </div>
        </div>
        {/* Sidebar */}
        <div className="drawer-side z-[40]">
          <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>
          <div className="menu bg-[#232f61]/90 not-2xl:rounded-tr-4xl text-base-content font-semibold min-h-full p-0 w-56 gap-1">
            <div className="flex justify-center">
              <div className="rounded-tr-3xl bg-neutral-800/90 w-full h-16 p-4">
                <Image
                  src="/image/IC_SMART MOBILITY.png"
                  alt="Logo"
                  width={120}
                  height={120}
                  className={`transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
                  onLoadingComplete={() => setLoaded(true)}
                />
              </div>
            </div>
            <ul className="flex flex-col gap-2 p-2 text-[13px]">
              {menu?.map((item, index) => {
                // Try to find the icon in the primary Icons library
                let IconComponent = item.icon && Icons[item.icon];

                // If not found in the primary library, try the FaIcons library
                if (!IconComponent && item.icon && FaIcons[item.icon]) {
                  IconComponent = FaIcons[item.icon];
                } else if (!IconComponent && item.icon && MdIcons[item.icon]) {
                  IconComponent = MdIcons[item.icon];
                } else if (!IconComponent && item.icon && RiIcons[item.icon]) {
                  IconComponent = RiIcons[item.icon]
                }

                return (
                  <li key={index} >
                    <a href={item.url} className={pathname === item.url ? `items-center bg-neutral-800/90 box-shadow rounded-xl text-white py-1.5` : `rounded-xl py-1.5 ` + `my-0.5 text-white`}>
                      {IconComponent && <IconComponent className="inline-block mr-2 text-lg" />}
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
