import "../App.css";
import {Link, useNavigate} from 'react-router-dom'

const LandingPage = () => {


  const router = useNavigate();


  return (
    <div className="landingPageContainer">
      <nav>
        <div className="navHeader">
          <h2>Root Call</h2>
        </div>
        <div className="navList">
          <p onClick={()=>{
              router("/4dgd81c9e")
          }}>Join as Guest</p>
          <p onClick={()=>{
            router("/auth")
          }}>Register</p>
          <div onClick={()=>{
            router("/auth")
          }} role="button">Login</div>
        </div>
      </nav>

      <div className="landingMainContainer">
        <div>
          <h1>
            <span style={{ color: "#FF9839" }}>Connect</span> with your loved
            ones
          </h1>
          <p>Cover a distance by Root Call</p>
          <div role="button " className="startBtn">
            <Link to='/auth'>Get Started</Link>
          </div>
        </div>
        <div>
          <img src="/mobile.png" alt="" />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
