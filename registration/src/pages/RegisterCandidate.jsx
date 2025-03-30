import constants from "../assets/constants.js";
import { useState } from "react";

import { useNavigate } from "react-router-dom";
import axios from "axios";

const RegisterCandidate = () =>{

    const [formData, setFormData] = useState({
        id: "",
        name: "",
        contact: "",
        verifiedByVolunteer: "",
        position: "",
        imageUrl: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    
}