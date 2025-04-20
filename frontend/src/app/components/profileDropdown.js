// components/NavbarUserDropdown.jsx
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Logout } from '../auth/logout';
import ThemeToggle from './customTheme';

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
      <div className="flex items-center gap-2 cursor-pointer" onClick={toggleDropdown}>
        <div className="flex items-center bg-indigo-300/95 text-white p-1.5 rounded-md">
          <span className="text-sm font-medium px-2">Hi, Admin User!</span>
          <div className="avatar bg-red-600 rounded-full w-7 h-7 flex items-center justify-center text-xs text-white font-medium">
            AU
          </div>
        </div>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          strokeWidth={2}
          stroke="currentColor" 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-base-100 z-50">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <div className="px-4 py-2 text-sm border-b border-gray-200 ">
              <p className="font-medium">Admin User</p>
              <p className="text-xs text-gray-500">viana@dishub.jogjaprov.go.id</p>
            </div>
            
            <div className="flex flex-col">
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