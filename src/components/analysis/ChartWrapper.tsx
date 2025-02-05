"use client";

import dynamic from "next/dynamic";

const ChartComponent = dynamic(() => import("@/components/analysis/ChartComponent"), { ssr: false });

interface ChartWrapperProps {
  barData: any;
  lineData: any;
}

const ChartWrapper: React.FC<ChartWrapperProps> = ({ barData, lineData }) => {
  return <ChartComponent barData={barData} lineData={lineData} />;
};

export default ChartWrapper;