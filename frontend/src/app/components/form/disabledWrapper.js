import { Suspense } from "react";
import { Loading } from "@/app/components/form/Loading";

const DisabledWrapper = ({ selectedId, children }) => {
  return (
    <Suspense fallback={<Loading />}>
      <div className={selectedId === 0 ? "pointer-events-none opacity-50" : ""}>
        {children}
      </div>
    </Suspense>
  );
};

export default DisabledWrapper;
