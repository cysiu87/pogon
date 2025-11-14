import { Outlet, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState, useEffect, useContext, createContext } from "react";
import { faBars, faClose, faUser } from "@fortawesome/free-solid-svg-icons";
import useWindowDimensions from "../hooks/windowDimension";
import Cookies from "js-cookie"; // Import js-cookie
import { SessionContext } from "../App";


export const OpenContext = createContext();

const Layout = (props) => {
  const { sessionData, setSessionData } = useContext(SessionContext);
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [toggleIcon, setToggleIcon] = useState(<FontAwesomeIcon icon={faBars} />);
  const [dropClass, setDropClass] = useState("dropdown_menu");
  const [dropClass2, setDropClass2] = useState("dropdown_menu2");
  const { width } = useWindowDimensions();
  const [loginName, setLoginName] = useState("Login");
  const [logged, setLogged] = useState(false);
  const [dropLogClass, setDropLogClass] = useState("action_btn");
 
  
  useEffect(() => {
    // Check user cookie to maintain login state across refreshes
    const userCookie = Cookies.get("user");
    if (userCookie) {
      const user = JSON.parse(userCookie);
      if (user.logged) {        
        setLoginName(<FontAwesomeIcon icon={faUser} />);
        setDropLogClass("action_btn2");
        setLogged(true);
      } 
      else {
        setLoginName("Login");
        setLogged(false);
      }
    }

  }, [sessionData]);
  
  const handleToggleMenu = () => {
    setOpen((prevOpen) => !prevOpen);
    
  };

  const handleToggleMenu2 = () => {
    setOpen2((prevOpen) => !prevOpen);
    setOpen((prevOpen) => !prevOpen);
  };

  const handleToggleMenu3 = () => {
    if (open2) setOpen2((prevOpen2) => !prevOpen2);
  };

  const logout = () => {
    Cookies.remove("user"); // Remove user cookie
    setSessionData(null); // Clear session context
    setLogged(false); // Update logged state
    setOpen2(false); // Close dropdown
    setLoginName("Login"); // Reset login name
    setDropLogClass("action_btn"); // Reset button class
  };

  useEffect(() => {
    // Update dropdown and icon state based on the `open` state
    if (open) {
      setDropClass("dropdown_menu_open");
      setToggleIcon(<FontAwesomeIcon icon={faClose} />);
    } else {
      setDropClass("dropdown_menu");
      setToggleIcon(<FontAwesomeIcon icon={faBars} />);
    }
  }, [open]);

  useEffect(() => {
    // Update dropdown state for secondary menu
    if (open2) {
      setDropClass2("dropdown_menu_open2");
    } else {
      setDropClass2("dropdown_menu2");
    }
  }, [open2]);

  useEffect(() => {
    // Automatically close dropdown menu if width > 992
    if (width > 992 && open) {
      setOpen(false);
    }
  }, [width, open]);

  

 // console.log(Cookies.get("user")); // Debug: log user cookie

  return (
    <>
      <OpenContext.Provider value={open}>
        <header>
          <div className="navbar">
            <div className="logo">
              <Link to="/">Pogoń</Link>
            </div>
            <ul className="links">
              <li><Link onClick={handleToggleMenu3} to="/">Strona domowa</Link></li>
              {/* <li><Link onClick={handleToggleMenu3} to="/results">Wyniki</Link></li> */}              
              {/* <li><Link onClick={handleToggleMenu3} to="/diagrams">BDD</Link></li>
              <li><Link onClick={handleToggleMenu3} to="/sqlscripts">SqlScripts</Link></li> */}
              {/* <li><Link onClick={handleToggleMenu3} to="/sqlallscripts">SqlAllScripts</Link></li> */}
              {/* <li><Link onClick={handleToggleMenu3} to="/3dprints">3d</Link></li> */}
              <li><Link onClick={handleToggleMenu3} to="/resultsAdmin">Pogoń</Link></li>
              {/* <li><Link onClick={handleToggleMenu3} to="/contact">Contact</Link></li> */}
            </ul>
            {logged && (
              <>
                <button className={dropLogClass} onClick={handleToggleMenu2} >{loginName}</button>              
              </>
            )}
            {!logged && (
              <>
                <Link className={dropLogClass} to="/users">{loginName}</Link>              
              </>
            )}
            
            <div className="toggle_btn" onClick={handleToggleMenu}><i>{toggleIcon}</i></div>
          </div>
          <div className={dropClass2}>
            {logged && (
              <>
                {/* <li><Link onClick={handleToggleMenu2} to="/user/profile">User profile</Link></li> */}
                <li><Link onClick={handleToggleMenu2} to="/users/change">Change password</Link></li>
                <li><Link onClick={logout} className="action_btn_open">Logout</Link></li>
              </>
            )}
          </div>
          <div className={dropClass}>
            <li>
              <Link onClick={handleToggleMenu} to="/">
                Home
              </Link>
            </li>
            {/* <li>
              <Link onClick={handleToggleMenu} to="/results">
                Wyniki
              </Link>
            </li> */}
            <li>
              <Link onClick={handleToggleMenu} to="/resultsAdmin">
                Wyniki Admin
              </Link>
            </li>
            <li>
              <Link onClick={handleToggleMenu} to="/diagrams">
                BDD
              </Link>
            </li>
            <li>
              <Link onClick={handleToggleMenu} to="/sqlscripts">
                SqlScripts
              </Link>
            </li>
            <li>
              <Link onClick={handleToggleMenu} to="/3dprints">
                3d
              </Link>
            </li>
            <li>
              <Link onClick={handleToggleMenu} to="/contact">
                Contact
              </Link>
            </li>
            {!logged && (
              <li>
                <Link onClick={handleToggleMenu} className="action_btn_open" to="/users">
                  Login
                </Link>
              </li>
            )}
            {logged && (
              <>
                {/* <li><Link onClick={handleToggleMenu2} to="/user/profile">User profile</Link></li> */}
                <li><Link onClick={handleToggleMenu2} to="/users/change">Change password</Link></li>
                <li><Link onClick={logout} className="action_btn_open">Logout</Link></li>
              </>
            )}
            
          </div>
        </header>

        <div className="container-md main_content">
          <Outlet />
        </div>

        {/* <div className="footer">footer</div> */}
      </OpenContext.Provider>
    </>
  );
};

export default Layout;
