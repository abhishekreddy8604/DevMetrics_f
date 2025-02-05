"use client";

import { Bar, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement);

interface ChartComponentProps {
  barData: any;
  lineData: any;
}

const ChartComponent: React.FC<ChartComponentProps> = ({ barData, lineData }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 14,
          },
          color: '#333',
        },
      },
      title: {
        display: true,
        text: 'Assessment Scores',
        font: {
          size: 18,
        },
        color: '#333',
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#333',
        },
      },
      y: {
        grid: {
          color: '#e5e7eb',
        },
        ticks: {
          color: '#333',
        },
      },
    },
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div>
        <h2 className="text-lg font-medium">Assessment Scores</h2>
        <Bar data={barData} options={options} />
      </div>
      <div>
        <h2 className="text-lg font-medium">Scores Over Time</h2>
        <Line data={lineData} options={options} />
      </div>
    </div>
  );
};

export default ChartComponent;