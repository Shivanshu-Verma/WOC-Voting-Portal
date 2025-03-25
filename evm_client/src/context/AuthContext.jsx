import { createContext, use } from "react";
import axios from "axios";
import  useUserStore  from "./zustand";
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axiosInstance from "./axios";

const base_url = "http://localhost:5000";//TODO:Change with backend url

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const ec = useUserStore((state) => state.ec);
  const setEc = useUserStore((state) => state.setEc);
  const api=axiosInstance ; //use this for api with header proctected routes

  const LoginEcMember = async (data) => {
    try {
      // const responce = await axios.post(`${base_url}/loginEcmember`, {
      //   ...data
      // });
      const responce ={
        status:200,
        name:"hell",
      }
      if (responce.status === 200) {
        setEc({ role: 'ec', ...responce.data });
        navigate("/evm-register");
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
      const response = await api.get(`${base_url}/getStudentDetail/${voterId}`);
      if (response.status === 200) {

        navigate("/", { state: { voterInfo: response.data } });
        return response.data;
      } else {
        toast.error("Student Detail Fetch Failed");
      }
    } catch (error) {
      console.log(error);
      toast.error("Student Detail Fetch Failed");
    }
  };

  const contextData = {
    LoginEcMember,
    ec,
    GetStudentDetail
  }


  return (
    <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>
  );
}