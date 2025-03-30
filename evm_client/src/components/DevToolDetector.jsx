import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DevToolsDetector = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleDevToolsOpen = () => {
            console.clear();
            console.log('%c STOP! ', 'color: red; font-size: 50px; font-weight: bold;');
            window.location.reload();
            navigate('/warning');
        };

        const checkDevTools = setInterval(() => {
            if (window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160) {
                handleDevToolsOpen();
            }
        }, 1000);

        return () => clearInterval(checkDevTools);
    }, [navigate]);

    return null;
};

export default DevToolsDetector;
