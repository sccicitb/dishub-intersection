'use client';

import React from 'react';
import { HiMiniArrowTurnRightUp, HiMiniArrowTurnRightDown, HiArrowLongRight } from 'react-icons/hi2';
import Tooltip from './Tooltip';

const GridHorizontalV2 = ({ data, position = false }) => {
  if (!data) return null;

  const isValidContent = (content) => {
    if (content === '---' || content === '0' || content === 0) return false;
    if (typeof content === 'string' && !content.trim()) return false;
    return true;
  };

  return (
    <div className={`flex ${position ? 'flex-col items-end' : 'flex-col-reverse items-start'} gap-1`}>
      {/* Top Arrow */}
      <div className={`flex ${position ? 'flex-row' : 'flex-row-reverse'} items-center gap-0.5`}>
        <Tooltip content={isValidContent(data.row1?.[0]?.content) ? data.row1[0].content : null} position="top">
          <div className="px-2 py-1 bg-stone-300 rounded text-center text-xs font-semibold cursor-help">
            {data.row1?.[0]?.content || '0'}
          </div>
        </Tooltip>
        <HiMiniArrowTurnRightDown className={`text-lg ${!position ? 'transform rotate-180 scale-y-[-1]' : 'transform scale-y-[-1]'}`} />
      </div>

      {/* Middle Arrow */}
      <div className={`flex ${position ? 'flex-row' : 'flex-row-reverse'} items-center gap-0.5`}>
        <Tooltip content={isValidContent(data.row2?.[0]?.content) ? data.row2[0].content : null} position="top">
          <div className="px-2 py-1 bg-stone-300 rounded text-center text-xs font-semibold cursor-help">
            {data.row2?.[0]?.content || '0'}
          </div>
        </Tooltip>
        <HiArrowLongRight className={`text-lg ${position ? '' : 'transform rotate-180'}`} />
      </div>

      {/* Bottom Arrow */}
      <div className={`flex ${position ? 'flex-row' : 'flex-row-reverse'} items-center gap-0.5`}>
        <Tooltip content={isValidContent(data.row3?.[0]?.content) ? data.row3[0].content : null} position="top">
          <div className="px-2 py-1 bg-stone-300 rounded text-center text-xs font-semibold cursor-help">
            {data.row3?.[0]?.content || '0'}
          </div>
        </Tooltip>
        <HiMiniArrowTurnRightUp className={`text-lg ${!position ? 'transform rotate-180 scale-y-[-1]' : 'transform scale-y-[-1]'}`} />
      </div>
    </div>
  );
};

export default GridHorizontalV2;
