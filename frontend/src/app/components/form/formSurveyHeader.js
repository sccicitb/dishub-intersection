"use client";

import React, { useState } from 'react';
import { GoPlus } from "react-icons/go";
import { FaMinus } from "react-icons/fa6";

const SurveyFormSAHeader = () => {
  const [formData, setFormData] = useState({
    tanggal: '',
    kabupatenKota: '',
    lokasi: '',
    ruasJalanMayor: [''],
    ruasJalanMinor: [''],
    ukuranKota: '',
    perihal: '',
    periode: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayInputChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addRow = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeRow = (field, index) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = () => {
    // Validasi form
    const requiredFields = ['tanggal', 'kabupatenKota', 'lokasi'];
    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      alert(`Harap lengkapi field: ${missingFields.join(', ')}`);
      return;
    }

    // Filter empty strings from arrays
    const cleanData = {
      ...formData,
      ruasJalanMayor: formData.ruasJalanMayor.filter(item => item.trim() !== ''),
      ruasJalanMinor: formData.ruasJalanMinor.filter(item => item.trim() !== '')
    };

    // Simulate API call
    console.log('Data yang akan dikirim ke API:', cleanData);

    // Example API call structure
    console.log(cleanData);

    alert('Data berhasil disimpan! Lihat console untuk detail data.');
  };

  const renderArrayInput = (field, label, placeholder) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      {formData[field].map((value, index) => (
        <div key={index} className="flex items-center space-x-2">
          <input
            type="text"
            value={value}
            onChange={(e) => handleArrayInputChange(field, index, e.target.value)}
            placeholder={`${placeholder} ${index + 1}`}
            className="input input-sm border w-full border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100/90 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => addRow(field)}
            className="btn btn-sm bg-blue-500/90 text-white rounded-md hover:bg-blue-500 transition-colors"
            title="Tambah baris"
          >
            <GoPlus size={16} />
          </button>
          {formData[field].length > 1 && (
            <button
              type="button"
              onClick={() => removeRow(field, index)}
              className="btn btn-sm bg-red-500/90 text-white rounded-md hover:bg-red-500 transition-colors"
              title="Hapus baris"
            >
              <FaMinus size={16} />
            </button>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full mx-auto p-6">

      <div className="space-y-6 grid grid-cols-3 gap-2">
        {/* Tanggal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tanggal *
          </label>
          <input
            type="date"
            value={formData.tanggal}
            onChange={(e) => handleInputChange('tanggal', e.target.value)}
            className="w-full px-3 input input-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100/90 focus:border-transparent"
            required
          />
        </div>


        {/* Perihal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Perihal
          </label>
          <textarea
            value={formData.perihal}
            onChange={(e) => handleInputChange('perihal', e.target.value)}
            rows={3}
            className="w-full px-3 input input-sm py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100/90 focus:border-transparent resize-vertical min-h-[33px]"
          />
        </div>

        {/* Periode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Periode
          </label>
          <input
            type="text"
            value={formData.periode}
            onChange={(e) => handleInputChange('periode', e.target.value)}
            className="w-full px-3 input input-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Kabupaten/Kota */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kabupaten/Kota *
          </label>
          <input
            type="text"
            value={formData.kabupatenKota}
            onChange={(e) => handleInputChange('kabupatenKota', e.target.value)}
            placeholder="Contoh: Sleman"
            className="w-full px-3 input input-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100/90 focus:border-transparent"
            required
          />
        </div>

        {/* Lokasi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lokasi *
          </label>
          <input
            type="text"
            value={formData.lokasi}
            onChange={(e) => handleInputChange('lokasi', e.target.value)}
            placeholder="Contoh: Simpang Condongcatur"
            className="w-full px-3 input input-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100/90 focus:border-transparent"
            required
          />
        </div>

        {/* Ruas Jalan Mayor */}
        {renderArrayInput('ruasJalanMayor', 'Ruas Jalan Mayor', 'Jl. Padjajaran (T,B)')}

        {/* Ruas Jalan Minor */}
        {renderArrayInput('ruasJalanMinor', 'Ruas Jalan Minor', 'Jl. Anggajaya (U), Jl. Affandi (S)')}

        {/* Ukuran Kota */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ukuran Kota
          </label>
          <input
            type="text"
            value={formData.ukuranKota}
            onChange={(e) => handleInputChange('ukuranKota', e.target.value)}
            placeholder="Contoh: 8,3 juta jiwa"
            className="w-full px-3 input input-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100/90 focus:border-transparent"
          />
        </div>

      </div>
      <div className="rounded-md">
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full btn-sm btn btn-success"
        >
          <span>Simpan Data</span>
        </button>
      </div>
    </div>
  );
};

export default SurveyFormSAHeader;


