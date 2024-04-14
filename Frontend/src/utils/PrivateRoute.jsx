import { Outlet, Navigate} from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";



const PrivateRoutes = () => {
    const { user} = useContext(AuthContext);

    // Check if user is authenticated based on the presence of user token

    const isAuthenticated = user !== null ;

    return isAuthenticated ? <Outlet /> : <Navigate to='/login' />;
};

export default PrivateRoutes