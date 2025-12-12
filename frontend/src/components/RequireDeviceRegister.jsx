// src/components/RequireDeviceRegister.jsx
import { Navigate } from "react-router-dom";
import { isDeviceRegistered } from "../utils/auth";
import propstype from "prop-types";
const RequireDeviceRegister = ({ children }) => {
  if (!isDeviceRegistered()) {
    return <Navigate to="/users/register" />;
  }
  return children;
};
RequireDeviceRegister.propTypes = {
  children: propstype.node.isRequired,
};
export { RequireDeviceRegister };
// src/components/NotRequireDeviceRegister.jsx
const NotRequireDeviceRegister = ({ children }) => {
  if (isDeviceRegistered()) {
    return <Navigate to="/" />;
  }
  return children;
};
NotRequireDeviceRegister.propTypes = {
  children: propstype.node.isRequired,
};
export { NotRequireDeviceRegister };
