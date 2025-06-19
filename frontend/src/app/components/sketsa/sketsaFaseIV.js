"use client";

import React, { useEffect, useState } from 'react';

const TrafficPhaseDiagram = ({ tableData }) => {
  // Calculate total cycle time from the data
  const calculateTotalCycle = () => {
    let maxTime = 0;
    tableData.forEach(row => {
      Object.values(row.phases).forEach(phase => {
        if (phase.whi) {
          const phaseEnd = parseInt(phase.whi) + parseInt(phase.wAll.wk || 0) + parseInt(phase.wAll.wms || 0);
          maxTime = Math.max(maxTime, phaseEnd);
        }
      });
    });
    return Math.max(maxTime, 117); // Minimum based on your example
  };

  const totalCycle = calculateTotalCycle();

  // Get all phase segments for a row (combining all phases into one timeline)
  const getAllPhaseSegments = (row) => {
    const segments = [];
    
    Object.entries(row.phases).forEach(([phaseKey, phase]) => {
      if (phase.whi || phase.wAll.wk || phase.wAll.wms) {
        const startTime = parseInt(phase.whi) || 0;
        const wkDuration = parseInt(phase.wAll.wk) || 0;
        const wmsDuration = parseInt(phase.wAll.wms) || 0;
        
        // Green phase (WHI)
        if (phase.whi && parseInt(phase.whi) > 0) {
          segments.push({
            phase: phaseKey.toUpperCase(),
            type: 'green',
            start: 0,
            duration: parseInt(phase.whi),
            color: 'bg-green-500',
            label: `${phaseKey.toUpperCase()}`
          });
        }
        
        // Yellow phase (WK)
        if (wkDuration > 0) {
          segments.push({
            phase: phaseKey.toUpperCase(),
            type: 'yellow',
            start: parseInt(phase.whi) || 0,
            duration: wkDuration,
            color: 'bg-yellow-500',
            label: `${phaseKey.toUpperCase()}`
          });
        }
        
        // Red phase (WMS)
        if (wmsDuration > 0) {
          segments.push({
            phase: phaseKey.toUpperCase(),
            type: 'red',
            start: (parseInt(phase.whi) || 0) + wkDuration,
            duration: wmsDuration,
            color: 'bg-red-500',
            label: `${phaseKey.toUpperCase()}`
          });
        }
      }
    });
    
    return segments.sort((a, b) => a.start - b.start || a.phase.localeCompare(b.phase));
  };

  // Check for overlapping phases and create separate rows if needed
  const processRowData = (row) => {
    const allSegments = getAllPhaseSegments(row);
    
    // Group segments by time overlap
    const timeSlots = [];
    
    allSegments.forEach(segment => {
      let placed = false;
      
      // Try to place in existing time slots
      for (let slot of timeSlots) {
        const hasOverlap = slot.some(existingSegment => 
          !(segment.start >= existingSegment.start + existingSegment.duration || 
            existingSegment.start >= segment.start + segment.duration)
        );
        
        if (!hasOverlap) {
          slot.push(segment);
          placed = true;
          break;
        }
      }
      
      // Create new time slot if no suitable slot found
      if (!placed) {
        timeSlots.push([segment]);
      }
    });
    
    return timeSlots;
  };

  // Generate time markers
  const generateTimeMarkers = () => {
    const markers = [];
    for (let i = 0; i <= totalCycle; i += 10) {
      markers.push(i);
    }
    return markers;
  };

  const timeMarkers = generateTimeMarkers();

  return (
    <div className="w-full py-6 bg-white">
      <div className="mb-6">
        <h2 className="text-lg font-normal mb-2">
          Diagram Waktu Fase Lalu Lintas
        </h2>
        <p className="text-sm text-gray-600">
          Visualisasi timing untuk setiap pendekat (satu baris per pendekat)
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Time scale header */}
          <div className="flex mb-4 relative">
            <div className="w-20 text-center font-semibold py-2 border-b-2 border-gray-300">
              Pendekat
            </div>
            <div className="flex-1 relative border-b-2 border-gray-300 pb-2">
              <div className="text-center font-semibold mb-2">Waktu (detik)</div>
              {timeMarkers.map((time, index) => (
                <div
                  key={time}
                  className="absolute text-xs text-gray-600"
                  style={{ left: `${(time / totalCycle) * 100}%` }}
                >
                  {time}
                </div>
              ))}
            </div>
          </div>

          {/* Main diagram */}
          <div className="space-y-1">
            {tableData.map((row, rowIndex) => {
              const timeSlots = processRowData(row);
              
              return timeSlots.map((segments, slotIndex) => (
                <div key={`${rowIndex}-${slotIndex}`} className="flex items-center">
                  {/* Approach code - only show on first row of each approach */}
                  <div className="w-20 text-center font-semibold text-sm border-r border-gray-300">
                    {slotIndex === 0 ? row.kodePendekat : ''}
                  </div>
                  
                  {/* Timeline */}
                  <div className="flex-1 relative h-10 border border-gray-300 bg-red-200">
                    {/* Default red background */}
                    <div className="absolute inset-0 bg-red-300"></div>
                    
                    {/* Phase segments */}
                    {segments.map((segment, segIndex) => (
                      <div
                        key={segIndex}
                        className={`absolute h-full ${segment.color} border-r border-white border-opacity-50`}
                        style={{
                          left: `${(segment.start / totalCycle) * 100}%`,
                          width: `${(segment.duration / totalCycle) * 100}%`
                        }}
                        title={`${segment.label} - ${segment.type}: ${segment.start}s-${segment.start + segment.duration}s (${segment.duration}s)`}
                      >
                        {/* Phase label */}
                        {segment.duration > 5 && (
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow">
                            {segment.label}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Time grid lines */}
                    {timeMarkers.map((time, index) => (
                      <div
                        key={time}
                        className="absolute top-0 bottom-0 w-px bg-gray-400 opacity-30"
                        style={{ left: `${(time / totalCycle) * 100}%` }}
                      />
                    ))}
                  </div>
                </div>
              ));
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 flex justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 border"></div>
              <span className="text-sm">Hijau (WHI)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-500 border"></div>
              <span className="text-sm">Kuning (WK)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 border"></div>
              <span className="text-sm">Merah (WMS)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-300 border"></div>
              <span className="text-sm">Tidak Aktif</span>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-4 text-sm text-gray-600">
            <p><strong>Total Siklus:</strong> {totalCycle} detik</p>
            <p><strong>Keterangan:</strong> Setiap pendekat ditampilkan dalam satu baris. Jika ada fase yang overlap waktu, akan ditampilkan dalam baris terpisah.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Example usage with sample data
const App = ({dataSketsa}) => {
  const [dataProps, setDataProps] = useState([])
  const sampleData = {
    "tableData": [
      {
        "kodePendekat": "U",
        "tipePendekat": "P",
        "arah": "Terlindung",
        "pemisahanLurusRka": "",
        "phases": {
          "f1": {
            "mf": "",
            "whi": "",
            "wAll": {
              "wk": "",
              "wms": ""
            }
          },
          "f2": {
            "mf": "",
            "whi": "33",
            "wAll": {
              "wk": "24",
              "wms": "3"
            }
          },
          "f3": {
            "mf": "",
            "whi": "",
            "wAll": {
              "wk": "",
              "wms": ""
            }
          },
          "f4": {
            "mf": "",
            "whi": "",
            "wAll": {
              "wk": "",
              "wms": ""
            }
          }
        },
        "whi": "1",
        "s": ""
      },
      {
        "kodePendekat": "S",
        "tipePendekat": "P",
        "arah": "Terlindung",
        "pemisahanLurusRka": "",
        "phases": {
          "f1": {
            "mf": "0",
            "whi": "29",
            "wAll": {
              "wk": "3",
              "wms": "1"
            }
          },
          "f2": {
            "mf": "",
            "whi": "",
            "wAll": {
              "wk": "",
              "wms": ""
            }
          },
          "f3": {
            "mf": "",
            "whi": "70",
            "wAll": {
              "wk": "41",
              "wms": "3"
            }
          },
          "f4": {
            "mf": "",
            "whi": "",
            "wAll": {
              "wk": "",
              "wms": ""
            }
          }
        },
        "whi": "3",
        "s": "14"
      },
      {
        "kodePendekat": "T",
        "tipePendekat": "O",
        "arah": "Terlawan",
        "pemisahanLurusRka": 1,
        "phases": {
          "f1": {
            "mf": "",
            "whi": "",
            "wAll": {
              "wk": "",
              "wms": ""
            }
          },
          "f2": {
            "mf": "",
            "whi": "",
            "wAll": {
              "wk": "",
              "wms": ""
            }
          },
          "f3": {
            "mf": "",
            "whi": "",
            "wAll": {
              "wk": "",
              "wms": ""
            }
          },
          "f4": {
            "mf": "",
            "whi": "",
            "wAll": {
              "wk": "",
              "wms": ""
            }
          }
        },
        "whi": "",
        "s": "117"
      },
      {
        "kodePendekat": "B",
        "tipePendekat": "P/O",
        "arah": "Terlindung/Terlawan",
        "pemisahanLurusRka": "",
        "phases": {
          "f1": {
            "mf": "",
            "whi": "",
            "wAll": {
              "wk": "",
              "wms": ""
            }
          },
          "f2": {
            "mf": "",
            "whi": "",
            "wAll": {
              "wk": "",
              "wms": ""
            }
          },
          "f3": {
            "mf": "",
            "whi": "61",
            "wAll": {
              "wk": "9",
              "wms": "0"
            }
          },
          "f4": {
            "mf": "",
            "whi": "0",
            "wAll": {
              "wk": "70",
              "wms": "41"
            }
          }
        },
        "whi": "3",
        "s": "3"
      }
    ]
  };
  useEffect(() => {
    setDataProps(dataSketsa)
  }, [dataSketsa])

  return (
    <div className="h-fit">
      <TrafficPhaseDiagram tableData={dataProps || sampleData.tableData} />
    </div>
  );
};

export default App;