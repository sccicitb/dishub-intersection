"use client"
import { useEffect, useState } from "react";
const CameraActive = ({children, onOptionChange}) => {
  const [optionSelect, setOptionSelect] = useState('peta');
  const activeOption = ["peta", "pratinjau", "daftar"]

  const handleSelectChange = (e) => {
    const value = e.target.value;
    setOptionSelect(value);
    onOptionChange?.(value);
  };

  const handleButtonClick = (option) => {
    setOptionSelect(option);
    onOptionChange?.(option);
  };

  return (
    <div>
      {/* <div className="form-control w-full md:w-1/4">
        <label className="label">
          <span className="label-text font-medium">Arah Simpang</span>
        </label>
        <select
          className="select select-bordered"
          value={optionSelect}
          onChange={handleSelectChange}
        >
          <option value="peta">Peta</option>
          <option value="pratinjau">Pratinjau</option>
          <option value="daftar">Daftar</option>
        </select>
      </div> */}
      <div>
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-medium">Kamera Aktif</h3>
          <div className="join w-fit gap-5 flex overflow-x-auto">
            {activeOption.map((option) => (
              <button
                key={option}
                className={`btn join-item rounded-md flex-1 text-nowrap btn-sm w-fit px-5 capitalize ${
                  optionSelect === option
                    ? "bg-[#232f61]/80 text-white"
                    : "bg-[#232f61]/10 text-[#3e55bd] outline-none"
                }`}
                onClick={() => handleButtonClick(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default CameraActive