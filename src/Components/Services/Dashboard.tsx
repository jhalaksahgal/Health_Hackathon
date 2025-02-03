import React, { useState, useEffect } from "react";

const Dashboard: React.FC = () => {
  const [medicines, setMedicines] = useState<any[]>([]); // State to store medicines data

  useEffect(() => {
    // Fetch medicines data from the external API
    const fetchMedicines = async () => {
      try {
        const response = await fetch("https://your-api-endpoint/medicines"); // Replace with your actual endpoint
        const data = await response.json();
        setMedicines(data); // Set fetched data to state
      } catch (error) {
        console.error("Error fetching medicines data:", error);
      }
    };

    fetchMedicines();
  }, []);

  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Sales",
        data: [12, 19, 3, 5, 2, 3],
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
  };

  return (
    <div className="flex flex-wrap gap-4 p-4">
      <div className="bg-white shadow-md rounded-2xl p-6 flex-1 min-w-[300px]">
        <h2 className="text-xl font-bold">Medicines</h2>
        {medicines.length > 0 ? (
          <ul className="text-gray-600">
            {medicines.map((medicine, index) => (
              <li key={index} className="mb-2">
                <strong>{medicine.name}</strong> - {medicine.description}
              </li>
            ))}
          </ul>
        ) : (
          <p>Loading medicines...</p>
        )}
      </div>
      <div className="bg-white shadow-md rounded-2xl p-6 flex-1 min-w-[300px]">
        <h2 className="text-xl font-bold">Graph</h2>
        <svg viewBox="0 0 400 220" width="100%" height="auto">
          {/* Background */}
          <rect width="100%" height="220" fill="white" />
          
          {/* Y-Axis Line */}
          <line x1="50" y1="0" x2="50" y2="200" stroke="black" strokeWidth="2" />
          
          {/* X-Axis Line */}
          <line x1="50" y1="200" x2="400" y2="200" stroke="black" strokeWidth="2" />
          
          {/* Polyline for data */}
          <polyline
            fill="none"
            stroke={data.datasets[0].borderColor}
            strokeWidth="3"
            points={data.datasets[0].data
              .map((value, index) => `${index * 50 + 50},${200 - value * 10}`)
              .join(" ")}
          />
          
          {/* X-Axis Labels */}
          <g className="axis x-axis">
            {data.labels.map((label, index) => (
              <text key={index} x={index * 50 + 50} y="215" textAnchor="middle" fontSize="12">
                {label}
              </text>
            ))}
          </g>
          
          {/* Y-Axis Labels */}
          <g className="axis y-axis">
            {[0, 5, 10, 15, 20].map((value, index) => (
              <text
                key={index}
                x="40"
                y={200 - value * 10}
                textAnchor="end"
                fontSize="12"
                dominantBaseline="middle"
              >
                {value}
              </text>
            ))}
          </g>
        </svg>
      </div>
      <div className="bg-white shadow-md rounded-2xl p-6 flex-1 min-w-[300px]">
        <h2 className="text-xl font-bold">Streak</h2>
        <p className="text-gray-600">Track your streak...</p>
      </div>
      <div className="bg-white shadow-md rounded-2xl p-6 flex-1 min-w-[300px]">
        <h2 className="text-xl font-bold">Tasks</h2>
        <p className="text-gray-600">Your pending tasks...</p>
      </div>
      <div className="bg-white shadow-md rounded-2xl p-6 flex-1 min-w-[300px]">
        <h2 className="text-xl font-bold">Notes</h2>
        <p className="text-gray-600">Your notes...</p>
      </div>
      <div className="bg-white shadow-md rounded-2xl p-6 flex-1 min-w-[300px]">
        <h2 className="text-xl font-bold">Profile</h2>
        <p className="text-gray-600">Your profile information...</p>
      </div>
    </div>
  );
};

export default Dashboard;
