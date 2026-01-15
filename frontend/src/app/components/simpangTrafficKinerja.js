"use client";

import { lazy, Suspense, useEffect, useState } from "react";

const GridVertical = lazy(() => import("@/app/components/gridVertical"));
const GridHorizontal = lazy(() => import("@/app/components/gridHorizontal"));

const SimpangTrafficKinerja = (trafficData) => {
  const [dataSimpang, setDataSimpang] = useState(null);
  const [categoryNames, setCategoryNames] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCategoryName, setSelectedCategoryName] = useState("");

  // Function to convert traffic data to the desired format
  const convertTrafficDataToCategory = (data) => {
    if (!data || !data.trafficData || !data.trafficData.surveyData) {
      return null;
    }

    const surveyData = data.trafficData.surveyData;

    // Helper function to create direction structure
    const createDirectionStructure = () => ({
      north: {
        row1: [{ id: "n1-1", content: 0 }], // BKa
        row2: [{ id: "n2-1", content: 0 }], // Lurus
        row3: [{ id: "n3-1", content: 0 }]  // BKi / BKIJT
      },
      south: {
        row1: [{ id: "s1-1", content: 0 }], // BKa
        row2: [{ id: "s2-1", content: 0 }], // Lurus
        row3: [{ id: "s3-1", content: 0 }]  // BKi / BKIJT
      },
      east: {
        row1: [{ id: "e1-1", content: 0 }], // BKa
        row2: [{ id: "e2-1", content: 0 }], // Lurus
        row3: [{ id: "e3-1", content: 0 }]  // BKi / BKIJT
      },
      west: {
        row1: [{ id: "w1-1", content: 0 }], // BKa
        row2: [{ id: "w2-1", content: 0 }], // Lurus
        row3: [{ id: "w3-1", content: 0 }]  // BKi / BKIJT
      }
    });

    // Create category structure with 4 categories
    const category = {
      "1": {
        name: "Arus Kendaraan Bermotor kend / jam",
        directions: createDirectionStructure()
      },
      "2": {
        name: "Arus Kendaraan Bermotor Terlindung (P) SMP / jam",
        directions: createDirectionStructure()
      },
      "3": {
        name: "Arus Kendaraan Bermotor Terlawan (O) SMP / jam",
        directions: createDirectionStructure()
      },
      "4": {
        name: "Arus Kend.Tak Bermotor kend / jam",
        directions: createDirectionStructure()
      },
      "5": {
        name: "Rasio Belok Kendaraan",
        directions: createDirectionStructure()
      }
    };

    // Map direction codes to our structure
    const directionMap = {
      "U": "north",  // Utara
      "T": "east",   // Timur
      "B": "south", // Barat
      "S": "west"    // Selatan
    };

    // Process each direction in survey data
    surveyData.forEach(directionData => {
      const direction = directionMap[directionData.direction];
      if (!direction) return; // Skip if direction not mapped

      // Process each row (traffic type)
      directionData.rows.forEach(row => {
        let rowIndex = null;

        // Map traffic types to rows
        switch (row.type) {
          case "BKa":
            rowIndex = "row1";
            break;
          case "Lurus":
            rowIndex = "row2";
            break;
          case "BKi / BKIJT":
            rowIndex = "row3";
            break;
          default:
            return; // Skip unknown types
        }

        // Update Category 1: Arus Kendaraan Bermotor kend / jam (kendjam)
        if (row.total && typeof row.total.kendjam === 'number') {
          const targetRow1 = category["1"].directions[direction][rowIndex];
          if (targetRow1 && targetRow1[0]) {
            targetRow1[0].content = Math.round(row.total.kendjam);
          }
        }

        // Update Category 2: Arus Kendaraan Bermotor Terlindung (P) SMP / jam (smpTerlindung)
        if (row.total && typeof row.total.smpTerlindung === 'number') {
          const targetRow2 = category["2"].directions[direction][rowIndex];
          if (targetRow2 && targetRow2[0]) {
            targetRow2[0].content = Math.round(row.total.smpTerlindung);
          }
        }

        // Update Category 3: Arus Kendaraan Bermotor Terlawan (O) SMP / jam (smpTerlawan)
        if (row.total && typeof row.total.smpTerlawan === 'number') {
          const targetRow3 = category["3"].directions[direction][rowIndex];
          if (targetRow3 && targetRow3[0]) {
            targetRow3[0].content = Math.round(row.total.smpTerlawan);
          }
        }

        // Update Category 4: Arus Kend.Tak Bermotor kend / jam (ktb.count)
        if (row.ktb && typeof row.ktb.count === 'number') {
          const targetRow4 = category["4"].directions[direction][rowIndex];
          if (targetRow4 && targetRow4[0]) {
            targetRow4[0].content = Math.round(row.ktb.count);
          }
        }

        if (row.ktb && typeof row.ktb.rasio === 'number') {
          const targetRow5 = category["5"].directions[direction][rowIndex];
          if (targetRow5 && targetRow5[0]) {
            targetRow5[0].content = row.ktb.rasio;
          }
        }
      });
    });

    // Handle missing west direction - you might need to add this data or map it differently
    // For now, setting default values for west direction
    // You may need to adjust this based on your actual data structure
    // Note: If you have data for west direction with a different code, add it to directionMap above

    return { category };
  };

  useEffect(() => {
    // Check if trafficData is provided as props
    if (trafficData && trafficData.trafficData) {


      const convertedData = convertTrafficDataToCategory(trafficData);
      if (convertedData) {

        setDataSimpang(convertedData.category);
        setCategoryNames(Object.keys(convertedData.category));
        setSelectedCategory(Object.keys(convertedData.category)[0]);
      }
    } else {
      // Fallback to original JSON import if no trafficData provided
      import("@/data/trafficKinerjaBySimpang.json").then((data) => {
        const kategori = data.default.category;
        setDataSimpang(kategori);
        setCategoryNames(Object.keys(kategori));
        setSelectedCategory(Object.keys(kategori)[0]);
      });
    }
  }, [trafficData]);

  useEffect(() => {

  }, [trafficData]);

  useEffect(() => {


    if (typeof directionData !== 'undefined') {

    }
  }, [dataSimpang]);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  useEffect(() => {
    if (dataSimpang && selectedCategory) {
      setSelectedCategoryName(dataSimpang[selectedCategory].name);
    }
  }, [selectedCategory, dataSimpang]);

  const getDirectionData = () => {
    if (!dataSimpang || !selectedCategory) return {};
    return dataSimpang[selectedCategory].directions;
  };

  const directionData = getDirectionData();

  return (
    <div className="p-4">
      <Suspense fallback={<div className="text-center font-medium m-auto w-full">Loading...</div>}>
        <div className="mb-4">
          <div className="form-control w-full flex flex-col gap-2 md:w-1/4">
            <label className="label">
              <span className="label-text font-medium">Kategori</span>
            </label>
            <select
              className="select select-bordered focus:ring-0 focus:outline-0 select-sm"
              value={selectedCategory}
              onChange={handleCategoryChange}
            >
              <option value="">Semua Kategori</option>
              {categoryNames.map((number) => (
                <option key={number} value={number}>
                  {dataSimpang?.[number]?.name || number}
                </option>
              ))}
            </select>
          </div>
        </div>

        {dataSimpang && (
          <div className="w-full overflow-x-auto scroll-smooth snap-x snap-mandatory">
            <div className={`flex gap-4 w-fit ${[selectedCategory].length > 0 ? "justify-center mx-auto" : ""
              }`}>
              {(selectedCategory === "" ? categoryNames : [selectedCategory]).map((key) => {
                const simpang = dataSimpang[key];
                const directions = simpang.directions;

                return (
                  <div
                    key={key}
                    className="min-w-[350px] snap-end bg-[#BCC3E1] font-semibold flex flex-col">
                    <div className="flex justify-center">
                      <div></div>
                      <GridVertical position={true} data={directions.north} col={1} />
                      <div></div>
                    </div>

                    <div className="flex justify-center">
                      <div>
                        <GridHorizontal position={true} data={directions.west} col={1} />
                      </div>
                      <div className="w-40 text-center items-center flex font-medium text-xs p-5 bg-stone-400">
                        <div className="m-auto">{simpang.name}</div>
                      </div>
                      <div>
                        <GridHorizontal position={false} data={directions.east} col={1} />
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <div></div>
                      <GridVertical position={false} data={directions.south} col={1} />
                      <div></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </Suspense>

      {/* <div className="w-full bg-gray-100 p-4 mt-4 rounded-md">
        <h3 className="text-lg font-semibold mb-2">Log Data (Debug)</h3>
        <pre className="text-xs whitespace-pre-wrap break-all max-h-96 overflow-auto bg-white p-2 rounded border border-gray-300">
          {JSON.stringify(trafficData ?? [], null, 2)}
        </pre>
      </div>

      <div className="w-full bg-blue-100 p-4 mt-4 rounded-md">
        <h3 className="text-lg font-semibold mb-2">Converted Data (Debug)</h3>
        <pre className="text-xs whitespace-pre-wrap break-all max-h-96 overflow-auto bg-white p-2 rounded border border-gray-300">
          {JSON.stringify(dataSimpang ?? {}, null, 2)}
        </pre>
      </div> */}
    </div>
  );
};

export default SimpangTrafficKinerja;
