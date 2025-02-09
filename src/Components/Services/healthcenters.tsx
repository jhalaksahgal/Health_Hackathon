import React from "react";
import { Link } from "react-router-dom";
import PincodeSection from "./pincodesection";
import InfoCard from "./InfoCard";

const HealthCenters: React.FC = () => {
  return (
    <div className="p-6 max-w-8xl mx-auto">
      <h1 className="text-6xl mb-9 font-bold">Nearby Health Centers in your City</h1>
      <hr className="border-t-2 border-black mb-9" />

      <PincodeSection>
        {/* Category Links with Smooth Scrolling */}
        <div className="flex justify-between gap-6 text-center">
        <a onClick={() => document.getElementById("hospitals")?.scrollIntoView({ behavior: "smooth" })} className="category-card">
        <div className="text-4xl cursor-pointer hover:scale-125">🏥</div>
        <span className="mt-2 text-lg font-semibold">Hospitals</span>
        </a>

        <a onClick={() => document.getElementById("mri-ct-scan")?.scrollIntoView({ behavior: "smooth" })} className="category-card">
        <div className="text-4xl cursor-pointer hover:scale-125">🩻</div>
        <span className="mt-2 text-lg font-semibold">MRI & CT Scan</span>
        </a>

        <a onClick={() => document.getElementById("pathology")?.scrollIntoView({ behavior: "smooth" })} className="category-card">
        <div className="text-4xl cursor-pointer hover:scale-125">🧪</div>
        <span className="mt-2 text-lg font-semibold">Pathology</span>
        </a>

        <a onClick={() => document.getElementById("clinics")?.scrollIntoView({ behavior: "smooth" })} className="category-card">
        <div className="text-4xl cursor-pointer hover:scale-125">🏨</div>
        <span className="mt-2 text-lg font-semibold">Clinics</span>
        </a>

</div>

      

      <div className="text-red-500 mt-4">
        ***The location of these health centers will be shown according to the pincode that you have entered.***
      </div>

      {/* Sections */}
      {[
        
        { id: "hospitals", title: "Hospitals", data: [
            { name: "Apollo Hospital", rating: 5, address: "123 Main St, City" },
            { name: "Fortis Hospital", rating: 4, address: "456 Health Rd, City" },
            { name: "Medanta Hospital", rating: 5, address: "789 Wellness Blvd, City" },
            { name: "AIIMS Hospital", rating: 4, address: "101 Medical Ave, City" }
          ]
        },
        { id: "mri-ct-scan", title: "MRI & CT Scan", data: [
            { name: "City Scan Center", rating: 5, address: "321 Imaging St, City" },
            { name: "MRI Diagnostics", rating: 4, address: "654 Radiology Rd, City" },
            { name: "CT Scan Hub", rating: 5, address: "987 Scan Blvd, City" },
            { name: "Advanced Imaging", rating: 4, address: "120 X-ray Ave, City" }
          ]
        },
        { id: "pathology", title: "Pathology", data: [
            { name: "Dr. Lal Pathlabs", rating: 5, address: "A1 Lab St, City" },
            { name: "SRL Diagnostics", rating: 4, address: "B2 Test Rd, City" },
            { name: "Metropolis Labs", rating: 5, address: "C3 Blood Dr, City" },
            { name: "Thyrocare", rating: 4, address: "D4 Sample Ave, City" }
          ]
        },
        { id: "clinics", title: "Clinics", data: [
            { name: "Sunshine Clinic", rating: 5, address: "E5 Health St, City" },
            { name: "City Care Clinic", rating: 4, address: "F6 Checkup Rd, City" },
            { name: "Family Care Clinic", rating: 5, address: "G7 Medical Dr, City" },
            { name: "Wellness Clinic", rating: 4, address: "H8 Treatment Ave, City" }
          ]
        }
      ].map((section) => (
        <div key={section.id} id={section.id} className="mt-12 p-6 bg-gray-100 rounded-lg shadow-md w-full max-w-[90%] mx-auto">
          <h2 className="text-3xl font-semibold">{section.title}</h2>
          <div className="grid grid-cols-2 gap-6 mt-4">
            {section.data.map((item) => (
              <InfoCard key={item.name} {...item} />
            ))}
          </div>
        </div>
      ))}
      </PincodeSection>
    </div>
  );
};

export default HealthCenters;
