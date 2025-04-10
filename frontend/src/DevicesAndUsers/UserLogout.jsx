// src/pages/users/UserLogout.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const UserLogout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.removeItem("userToken");

    navigate("/");
  }, [navigate]);

  return null;
};

export default UserLogout;
