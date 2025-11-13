import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// ✅ Get backend URL from .env file
const server = process.env.REACT_APP_BACKEND_URL;

const withAuth = (WrappedComponent) => {
  const AuthComponent = (props) => {
    const router = useNavigate();
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
      const checkAuth = async () => {
        try {
          const response = await axios.get(`${server}/api/v1/users/verify`, {
            withCredentials: true,
          });
          
          if (response.status === 200) {
            setIsAuthenticated(true);
          }
        } catch (error) {
          router('/auth');
        } finally {
          setIsChecking(false);
        }
      };

      checkAuth();
    }, [router]);

    if (isChecking) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          Loading...
        </div>
      );
    }

    return isAuthenticated ? <WrappedComponent {...props} /> : null;
  };
  
  return AuthComponent;
};

export default withAuth;