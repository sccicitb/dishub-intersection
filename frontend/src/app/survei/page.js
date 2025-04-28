"use client";
import MapComponent from "@/app/components/map";
// import VehicleMonitoringTable from '@/app/components/vehicleMonitoringTable';
import VehicleTable from "@/app/components/vehicleTable";
import SurveyInfoTable from "@/app/components/surveyorTable";
import SelectionButtons from "@/app/components/selectionButton";
function SurveiPage() {
  const setUploadFormulir = (option) => {
    console.log(option);
  }
  return (
    <div>
      <MapComponent title={"Survei Lalu Lintas"}/>
      <div className="w-[95%] m-auto">
        <div className="xl:grid xl:grid-cols-2 items-center place-items-center py-10">
          <div>
            <button
                className={`btn truncate btn-md border-2 rounded-lg border-[#7585C1]/90 btn-outline text-[#7585C1]`}
                onClick={() => setUploadFormulir("test")}
              >
                Formulir
              </button>
            <SurveyInfoTable />
          </div>
          <div className="w-full justify-end flex flex-col">
            <SelectionButtons/>
          </div>
        </div>
        <VehicleTable />
      </div>
    </div>
  );
}
export default SurveiPage 