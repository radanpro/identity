// frontend/src/components/Dashboard.jsx
import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";

const Dashboard = () => {
  return (
    <div className="flex-col">
      <Header page="Dashboard" />
      <div className="flex flex-col items-center justify-center h-screen bg-gray-200">
        <h1 className="text-3xl mb-4">Dashboard</h1>
        <Link to="/camera" className="p-2 bg-green-500 text-white">
          Go to Monitoring
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
