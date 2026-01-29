import { useState } from 'react';
import { IoMdArrowDropdown } from "react-icons/io";

const CollapsibleSection = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-base-300 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 bg-base-200 flex items-center justify-between font-semibold text-left cursor-pointer hover:bg-base-300 transition"
      >
        <span>{title}</span>
        <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <IoMdArrowDropdown size={20} />
        </span>
      </button>
      <div style={{ display: isOpen ? 'block' : 'none' }} className="p-6">
        {children}
      </div>
    </div>
  );
};

export default CollapsibleSection;
