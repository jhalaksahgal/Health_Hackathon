import React, { useState } from 'react';

// Define types for Doctor and Appointment
type Doctor = {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
};

type Appointment = Doctor;

const doctorsData: Doctor[] = [
  { id: 1, name: "Dr. John Doe", description: "Specialist in Cardiology. Over 20 years of experience.", imageUrl: "https://img.freepik.com/premium-vector/doctor-profile-with-medical-service-icon_617655-48.jpg" },
  { id: 2, name: "Dr. Sarah Smith", description: "Expert in Neurology, providing advanced treatments for neurological conditions.", imageUrl: "https://img.freepik.com/premium-vector/doctor-profile-with-medical-service-icon_617655-48.jpg" },
  { id: 3, name: "Dr. Michael Brown", description: "Experienced Orthopedic surgeon with a focus on sports injuries.", imageUrl: "https://img.freepik.com/premium-vector/doctor-profile-with-medical-service-icon_617655-48.jpg" },
  { id: 4, name: "Dr. Emily Johnson", description: "Pediatrician specializing in childhood development and care.", imageUrl: "https://img.freepik.com/premium-vector/doctor-profile-with-medical-service-icon_617655-48.jpg" },
];

const DoctorsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor[] | null>(null);

  const bookAppointment = (doctor: Doctor) => {
    if (!appointments.some((appointment) => appointment.id === doctor.id)) {
      setAppointments((prevAppointments) => [...prevAppointments, doctor]);
    }
  };

  const removeAppointment = (doctorId: number) => {
    setAppointments((prevAppointments) => prevAppointments.filter((appointment) => appointment.id !== doctorId));
  };

  const filterAppointments = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filterText = e.target.value.toLowerCase();
    setSelectedDoctor(
      doctorsData.filter((doctor) => doctor.name.toLowerCase().includes(filterText))
    );
  };
// import React from 'react'

  return (
    <div className="min-h-screen bg-gray-100 mt-10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between mb-6">
          <input
            type="text"
            placeholder="Search doctors..."
            onChange={filterAppointments}
            className="p-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="bg-white p-4 shadow-lg rounded-md w-1/4">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Appointment Cart</h2>
            <ul>
              {appointments.length === 0 ? (
                <li className="text-gray-500">No appointments booked</li>
              ) : (
                appointments.map((doctor) => (
                  <li key={doctor.id} className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">{doctor.name}</span>
                    <button
                      onClick={() => removeAppointment(doctor.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </li>
                ))
              )}
            </ul>
            <button
              disabled={appointments.length === 0}
              className={`w-full mt-4 py-2 px-4 text-white font-semibold rounded-md focus:outline-none ${appointments.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              Confirm Appointment
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(selectedDoctor?.length ? selectedDoctor : doctorsData).map((doctor) => (
            <div key={doctor.id} className="bg-white shadow-lg rounded-md p-6">
              <div className="flex justify-center mb-4">
                <img
                  src={doctor.imageUrl}
                  alt={doctor.name}
                  className="w-24 h-24 rounded-full border-4 border-indigo-500"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">{doctor.name}</h3>
              <p className="text-gray-600 mt-2">{doctor.description}</p>
              <button
                onClick={() => bookAppointment(doctor)}
                className="w-full mt-4 py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none"
              >
                Book Appointment
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorsPage;
