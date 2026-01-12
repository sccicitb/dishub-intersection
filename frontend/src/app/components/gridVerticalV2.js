'use client';

import React from 'react';
import { HiMiniArrowTurnUpLeft, HiOutlineArrowTurnUpRight, HiMiniArrowLongUp } from 'react-icons/hi2';
import Tooltip from './Tooltip';

const GridVerticalV2 = ({ data, position = false }) => {
  if (!data) return null;

  const isValidContent = (content) => {
    if (content === '---' || content === '0' || content === 0) return false;
    if (typeof content === 'string' && !content.trim()) return false;
    return true;
  };

  return (
    <div className={`flex ${position ? 'flex-row-reverse' : 'flex-row'} gap-1 items-center`}>
      {/* Left Arrow */}
      <div className={`flex ${position ? 'flex-col-reverse' : 'flex-col'} items-center gap-0.5`}>
        <HiOutlineArrowTurnUpRight className={`text-lg ${position ? 'transform scale-x-[-1] rotate-180' : 'transform scale-x-[-1]'}`} />

        <Tooltip content={isValidContent(data.row1?.[0]?.content) ? data.row1[0].content : null} position="right">
          <div className="px-2 py-1 bg-stone-300 rounded text-center text-xs font-semibold cursor-help">
            {data.row1?.[0]?.content || '0'}
          </div>
        </Tooltip>
      </div>

      {/* Middle Arrow */}
      <div className={`flex ${position ? 'flex-col-reverse' : 'flex-col'} items-center gap-0.5`}>
        <HiMiniArrowLongUp className={`text-lg ${position ? 'transform rotate-180' : ''}`} />
        <Tooltip content={isValidContent(data.row2?.[0]?.content) ? data.row2[0].content : null} position="right">
          <div className="px-2 py-1 bg-stone-300 rounded text-center text-xs font-semibold cursor-help">
            {data.row2?.[0]?.content || '0'}
          </div>
        </Tooltip>
      </div>

      {/* Right Arrow */}
      <div className={`flex ${position ? 'flex-col-reverse' : 'flex-col'} items-center gap-0.5`}>
        <HiMiniArrowTurnUpLeft className={`text-lg ${position ? 'transform rotate-180 scale-x-[-1]' : 'transform scale-x-[-1]'}`} />

        <Tooltip content={isValidContent(data.row3?.[0]?.content) ? data.row3[0].content : null} position="right">
          <div className="px-2 py-1 bg-stone-300 rounded text-center text-xs font-semibold cursor-help">
            {data.row3?.[0]?.content || '0'}
          </div>
        </Tooltip>
      </div>
    </div>
  );
};

export default GridVerticalV2;
