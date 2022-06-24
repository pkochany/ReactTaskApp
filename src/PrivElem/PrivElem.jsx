import {isExpired} from "react-jwt";
import {Navigate} from "react-router";


const PrivElem = (navTo)  => {
    const token = localStorage.getItem("JWTtoken")
    const isTokenExpired = isExpired(token);


    if (isTokenExpired === true) {
        return <Navigate to="/listazadan"/>
    } else {
        return <Navigate to={navTo}/>
    }
};

export default PrivElem;