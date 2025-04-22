// components/NavbarUserDropdown.jsx
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Logout } from '../auth/logout';
import ThemeToggle from './customTheme';
import { FaAngleDown } from "react-icons/fa6";

export default function NavbarUserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User avatar and dropdown toggle */}
      <div className="flex items-center gap-3 px-2 cursor-pointer" onClick={toggleDropdown}>
        <div className="flex items-center bg-indigo-300/95 text-white p-1.5 rounded-md">
          <span className="text-sm font-medium px-2">Hi, Admin User!</span>
          <div className="avatar bg-red-600 rounded-full w-7 h-7 flex items-center justify-center text-xs text-white font-medium">
            AU
          </div>
        </div>
        <FaAngleDown className={`text-lg text-base-100 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-base-100 z-50">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <div className="px-4 py-2 text-sm border-b border-gray-200 ">
              <p className="font-medium">Admin User</p>
              <p className="text-xs text-gray-500">viana@dishub.jogjaprov.go.id</p>
            </div>
            
            <div className="flex flex-col pb-5">
              <ThemeToggle classCustom=" rounded-none "/>
            
            {/*             
            <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              Profile
            </Link> */}
            {/* <hr className="border-t border-gray-200" /> */}
            <Logout classCustom=" rounded-none "/>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}