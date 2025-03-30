import { createContext, use } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { axiosInstance } from '../pages/EvmRegister'
import useEvmStore from "./zustand";


const base_url = import.meta.env.VITE_BACKEND_URL;

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const ec = useEvmStore((state) => state.ec);
  const setEc = useEvmStore((state) => state.setEc);
  const setEvmId = useEvmStore((state) => state.setEvmId);
  const setNumVoteCast = useEvmStore((state) => state.setNumVoteCast);

  const LoginEcMember = async (data) => {
    try {
      const responce = await axios.post(`${base_url}/ec/login/staff`, {
        // const responce = await axios.post(`http://172.31.81.76:5000/set-cookie`, {
        ...data
      }, {
        withCredentials: true
      });
      console.log(responce);
      
      if (responce.status === 200) {
        setEc({ role: 'ec', ...responce.data.Data });
        localStorage.setItem("ecFingerprintLeft", responce.data.Data.biometric_left);
        localStorage.setItem("ecFingerprintRight", responce.data.Data.biometric_right);
      }
      else {
        toast.error(`Login Failed`);
      }
    } catch (error) {
      console.log(error);
      toast.error(`Login Failed ${error}`);
    }
  }

  const GetStudentDetail = async (voterId) => {
    try {
      const response = await axiosInstance.get(`${base_url}/vote-cast/login/${voterId}`, {
        withCredentials: true
      });

      console.log("API Response:", response.data);

      if (response.status === 200 && response.data?.Success) {
        return response.data;
      } else {
        setEvmId(null);
        console.log("settingevmis null");
        navigate('/')
        toast.error("Student Detail Fetch Failed");
        return null;
      }
      return response.data
    } catch (error) {
      console.error("Error fetching student details:", error);
      toast.error("Student Detail Fetch Failed");
      // setEvmId(null);
      // navigate('/')
      return null;
    }
  };

  const CastVote =async (data)=>{
    try {
      const responce= await axiosInstance.post(`${base_url}/vote-cast/cast`,{
        ...data
      },{
        withCredentials:true
      })
      console.log(responce);
      
      if (responce.status === 200) {
        toast.success("voted casted successfully")
        setNumVoteCast();
        navigate('/voter-login')
      }
      else{
        toast.error("error in vote cast")
      }
      navigate('/voter-login')
    } catch (error) {
      toast.error("error in vote cast :axios error");
      navigate('/voter-login')
    }
  }


  const contextData = {
    LoginEcMember,
    ec,
    GetStudentDetail,
    CastVote
  }


  return (
    <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>
  );
}