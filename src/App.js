import { HashRouter , Routes, Route, Router } from "react-router-dom";
import React, { createContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import Layout from "./pages/Layout";
import NoLayout from "./pages/NoLayout";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import NoPage from "./pages/NoPage";
import Diagrams from "./pages/diagrams";
import SqlScripts from "./pages/SqlScripts";
import SqlAllScripts from "./components/sqlAllScripts";
import ThreeDeePrints from "./pages/3dprints";
import Users from "./pages/Users";
import Register from "./pages/user/register";
import Reset from "./pages/user/reset";
import Change from "./pages/user/change";
import Results from "./pages/Results";
import ResultsAdmin from "./pages/ResultsAdmin";

import "./App.css";

// Initialize user data in cookies
if (!Cookies.get("user")) {
  Cookies.set("user", JSON.stringify({ login: "none", logged: false }), { expires: 7 });
}

// Create a context for session data
export const SessionContext = createContext();
const Link1 = () => <Results />
function App() {
  const [sessionData, setSessionData] = useState(null);
  const [showCookiePopout, setShowCookiePopout] = useState(false);

  useEffect(() => {
    // Load initial data from cookies
    const user = Cookies.get("user");
    if (user) setSessionData(JSON.parse(user));

    // Check if the cookie consent has been acknowledged
    if (!Cookies.get("cookieConsent")) {
      setShowCookiePopout(true); // Show cookie popout if consent is not given
    }
  }, []);

  useEffect(() => {
    // Update cookies whenever `sessionData` changes
    if (sessionData) {
      Cookies.set("user", JSON.stringify(sessionData), { expires: 7 });
    }    

  }, [sessionData]);

  const handleCookieConsent = () => {
    Cookies.set("cookieConsent", true, { expires: 2 }); // Set consent for 1 year
    setShowCookiePopout(false);
  };

  const handleCookieDecline = () => {
    Cookies.set("cookieConsent", false, { expires: 1 }); // Set consent for 1 year
    setShowCookiePopout(false);
  };

  return (
    <>
    <SessionContext.Provider value={{ sessionData, setSessionData }}>
      {showCookiePopout && (
          <div className="cookie-popout-container">
            <div className="cookie-popout">
              <h3>JB Site</h3>
              <p>
                This website uses cookies to ensure you get<br></br> the best experience on our website.<br></br> By continuing
                to use this site, you agree to the use of cookies.
              </p>
              <button className="cook_btn" onClick={handleCookieConsent}>
                Accept
              </button>
              <button className="cook_btn" onClick={handleCookieDecline}>
                Decline
              </button>
            </div>
          </div>
        )}
      <HashRouter >
      <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
           
            {/* Other routes with layout and menu */}
            {sessionData?.logged && (
              <>              
                
                <Route path="users/change" element={<Change />} />
                
                <>
                  <Route path="resultsAdmin" element={<ResultsAdmin />} />
                  
                </>
                             
              </>
            )}
            <Route path="users/reset" element={<Reset />} />
            <Route path="users" element={<Users />} />
            <Route path="users/register" element={<Register />} />
            <Route path="*" element={<NoPage />} />
          </Route>

          {/* Route with LayoutNoMenu */}
          <Route path="/results" element={<NoLayout />}>
          <Route index element={<Results />} />
          </Route>

          
        </Routes>
        
        
      </HashRouter >
    </SessionContext.Provider></>
    
  );
}

export default App;
