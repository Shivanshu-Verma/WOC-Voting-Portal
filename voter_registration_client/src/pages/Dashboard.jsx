import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

function Dashboard() {
    const navigate = useNavigate();
    const [voterId, setVoterId] = useState("");
    const {GetStudentDetail} = useContext(AuthContext);
    
    const handleClick = async () => {
        try {
            const response = await GetStudentDetail(voterId);
        } catch (error) {
            toast.error("Student not found");
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-100 items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 text-center">Dashboard</h2>
                <div className="mb-4">
                    <label className="block text-gray-700">Voter ID</label>
                    <input 
                        type="text" 
                        value={voterId} 
                        onChange={(e) => setVoterId(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded mt-1" 
                        placeholder="Enter Voter ID"
                    />
                </div>
                <button 
                    onClick={handleClick} 
                    className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                    Get Student Detail
                </button>
            </div>
        </div>
    );
}

export default Dashboard;