// src/components/RequireUserLogin.jsx
import { Navigate } from "react-router-dom";
import { isUserLoggedIn } from "../utils/auth";
import propstype from "prop-types";
const RequireUserLogin = ({ children }) => {
  if (!isUserLoggedIn()) {
    return <Navigate to="/users/login" />;
  }
  return children;
};
RequireUserLogin.propTypes = {
  children: propstype.node.isRequired,
};
export default RequireUserLogin;
