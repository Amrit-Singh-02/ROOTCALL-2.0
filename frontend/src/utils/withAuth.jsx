import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const server = process.env.REACT_APP_BACKEND_URL;

const withAuth = (WrappedComponent) => {
  const AuthComponent = (props) => {
    const router = useNavigate();
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => { 
      const checkAuth = async () => {
        try {
          console.log("🔍 Checking auth at:", `${server}/api/v1/users/verify`);
          
          const response = await axios.get(`${server}/api/v1/users/verify`, {
            withCredentials: true,
          });
          
          console.log("✅ Auth check passed:", response.status);
          
          if (response.status === 200) {
            setIsAuthenticated(true);
          } else {
            console.log("❌ Not authenticated, redirecting...");
            router('/auth');
          }
        } catch (error) {
          console.error("❌ Auth check failed:", error.response?.status || error.message);
          setIsAuthenticated(false);
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
          height: '100vh',
          flexDirection: 'column'
        }}>
          <p>Loading...</p>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null; // Don't render anything if not authenticated
    }

    return <WrappedComponent {...props} />;
  };
  
  return AuthComponent;
};

export default withAuth;