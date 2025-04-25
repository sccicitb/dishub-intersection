"use client";
import MapComponent from "@/app/components/map";
// import VehicleMonitoringTable from '@/app/components/vehicleMonitoringTable';
import VehicleTable from "@/app/components/vehicleTable";
import SurveyInfoTable from "@/app/components/surveyorTable";
import SelectionButtons from "@/app/components/selectionButton";
import GridVertical from '@/app/components/gridVertical';
import GridHorizontal from '@/app/components/gridHorizontal';
function SurveiPage() {
  return (
    <div>
      <MapComponent title={"Survei Lalu Lintas"}/>
      <div className="w-[95%] m-auto">
        <div className="xl:grid xl:grid-cols-2 items-center place-items-center py-10">
          <SurveyInfoTable />
          <div className="w-full justify-end flex flex-col">
            <SelectionButtons/>
          </div>
        </div>
        <div className="flex flex-col w-fit bg-[#7585C1]/20 rounded-xl mx-auto">
            <div className="flex justify-between">
              <div></div>
              <GridVertical position={true} />
              <div></div>
            </div>
            <div className="flex justify-center">
              <div className="">
                <GridHorizontal position={true}/>
              </div>
              <div className="w-56 text-center items-center flex font-semibold text-xl bg-neutral-400"><div className="m-auto">Jumlah<br/> Kendaraan</div></div>
              <div className="">
                <GridHorizontal />
              </div>
            </div>
            <div className="flex justify-center">
              <div></div>
              <GridVertical />
              <div></div>
            </div>
        </div>
        <VehicleTable />
      </div>
    </div>
  );
}
export default SurveiPage 