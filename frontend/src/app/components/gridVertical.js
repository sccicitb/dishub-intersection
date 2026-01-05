"use client"

import React, { useState, useEffect } from 'react';
import { HiMiniArrowTurnUpLeft, HiOutlineArrowTurnUpRight, HiMiniArrowLongUp } from "react-icons/hi2";
import Tooltip from './Tooltip';

const GridVertical = ({ position, data, category = false, col }) => {
  const [displayData, setDisplayData] = useState({
    row1: [],
    row2: [],
    row3: []
  });
  const itemsPerPage = col ? col : 4;
  const typeVehicle = {
    type: ["sm", "mp", "ks", "ktb"]
  };

  // Helper function untuk check apakah content valid untuk tooltip
  const isValidContent = (content) => {
    if (content === '---' || content === '0' || content === 0) return false;
    if (typeof content === 'string' && !content.trim()) return false;
    return true;
  };

  useEffect(() => {
    const prepareColumnData = (colData) => {
      const processedData = colData ? colData.slice(0, itemsPerPage) : [];

      if (processedData.length < itemsPerPage) {
        const emptyItems = Array(itemsPerPage - processedData.length).fill().map((_, i) => ({
          id: `empty-${i}`,
          content: "---"
        }));
        return [...processedData, ...emptyItems];
      }

      return processedData;
    };

    setDisplayData({
      row1: prepareColumnData(data?.row1 || []),
      row2: prepareColumnData(data?.row2 || []),
      row3: prepareColumnData(data?.row3 || [])
    });
  }, [data]);

  return (
    <div className={`flex ${!position && 'flex-row-reverse'} w-40 ${col ? 'min-h-24' : 'h-fit'} bg-stone-300 justify-evenly text-xs relative`}>
      {/* Row 1 - Arrow Up */}
      <div className={`flex ${!position ? "flex-col-reverse" : "flex-col"} w-full h-full justify-end items-center`}>
        <div className={`grid ${col ? 'grid-rows-' + col + ' ' : 'grid-rows-4'} h-full`}>
          {(position ? [...displayData.row1].reverse() : displayData.row1).map((item) => (
            <Tooltip key={item.id} content={isValidContent(item.content) ? item.content : null} position="right">
              <div className="p-2 text-center m-auto truncate cursor-help">
                {item.content}
              </div>
            </Tooltip>
          ))}
        </div>
        <HiMiniArrowTurnUpLeft className={`text-2xl p-0.5 ${position ? 'tranform rotate-180 scale-x-[-1] ' : 'transform scale-x-[-1]'}`} />
      </div>

      {/* Row 2 - Arrow Back */}
      <div className={`flex ${!position ? "flex-col-reverse" : "flex-col"} w-full h-full justify-end items-center`}>
        <div className={`grid ${col ? 'grid-rows-' + col + ' ' : 'grid-rows-4'} h-full`}>
          {(position ? [...displayData.row2].reverse() : displayData.row2).map((item) => (
            <Tooltip key={item.id} content={isValidContent(item.content) ? item.content : null} position="right">
              <div className="p-2 text-center m-auto truncate cursor-help">
                {item.content}
              </div>
            </Tooltip>
          ))}
        </div>
        <HiMiniArrowLongUp className={`text-2xl p-0.5 ${position ? 'transform rotate-180' : ''}`} />
      </div>

      {/* Row 3 - Arrow Down */}
      <div className={`flex ${!position ? "flex-col-reverse" : "flex-col"} w-full h-full justify-end items-center`}>
        <div className={`grid ${col ? 'grid-rows-' + col + ' ' : 'grid-rows-4'} h-full`}>
          {(position ? [...displayData.row3].reverse() : displayData.row3).map((item) => (
            <Tooltip key={item.id} content={isValidContent(item.content) ? item.content : null} position="right">
              <div className="p-2 text-center m-auto truncate cursor-help">
                {item.content}
              </div>
            </Tooltip>
          ))}
        </div>
        <HiOutlineArrowTurnUpRight className={`text-2xl p-0.5 ${position ? ' transform scale-x-[-1] rotate-180' : 'transform scale-x-[-1]'}`} />
      </div>

      {category && (
        typeVehicle.type.map((item, index) => (
          <div
            key={index}
            className={`absolute uppercase ${position ? '-right-8 mt-8' : '-left-8 mb-8'}`}
            style={{
              [position ? 'top' : 'bottom']: `${index * 30}px`
            }}
          >
            {item}
          </div>
        ))
      )}

      <div
        className="absolute uppercase mt-8"
        style={{
          [position ? 'left' : 'right']: '-52px'
        }}
      >
        Jl. ({position ? "U" : "S"})
      </div>
    </div>
  );
};

export default GridVertical;
