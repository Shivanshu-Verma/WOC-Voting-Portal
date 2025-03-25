import { useNavigate } from 'react-router-dom';
import useEvmStore  from "../context/zustand";

const Warning = () => {
    const navigate = useNavigate();
    const handleClear = () => {
        useEvmStore.getState().clearStore();
        navigate('/')
    };
    handleClear()
    
    return (
        <div className="flex flex-col items-center mt-10">
            <h2 className="text-2xl font-bold text-red-500">Warning</h2>
            <p>Developer tools detected. Access is restricted.</p>
            <button onClick={() => navigate('/')} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
                Go Back
            </button>
        </div>
    );
};

export default Warning;
