import { Outlet, Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faUser} from '@fortawesome/free-regular-svg-icons';

const Layout = () => {
  return (
    <>   
        <div className="myNavBar">
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top ">
                <div className="container-md">
                <span class="navbar-text "><img src="./Obraz1.png" width="100px" alt="JB"></img></span>   
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            {/* <li className="nav-item">
                                <Link className="nav-link active myNavLink aa" to="/diagrams">BDD</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link active myNavLink aa" to="/">SQL Scripts</Link>
                            </li> */}
                            {/* <li className="nav-item">
                            <a className="nav-link disabled" href="#" tabindex="-1" aria-disabled="true">Disabled</a>
                            </li> */}
                            
                        </ul>   
                        <ul className="navbar-nav  mb-2 mb-lg-0 float-end">
                            {/* <div className="float-end"> */}
                                <li className="nav-item dropdown aas">
                                    <a className="nav-link dropdown-toggle " href="/" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    <FontAwesomeIcon icon={faUser} />
                                    </a>
                                    <ul className="dropdown-menu"aria-labelledby="navbarDropdown">
                                        <li><Link className="dropdown-item myNavLink" to="/contact">Profile</Link></li>
                                        <li><Link className="dropdown-item myNavLink" to="/">Login</Link></li>
                                        <li><Link className="dropdown-item myNavLink" to="/">Singin</Link></li>
                                        {/* <li><hr className="dropdown-divider"/></li> */}
                                        {/* <li><Link className="dropdown-item myNavLink" to="/">Contact</Link></li>        
                                        <li><Link className="dropdown-item myNavLink" to="/">About</Link></li>         */}
                                        <li><hr className="dropdown-divider"/></li>
                                        <li><Link className="dropdown-item myNavLink" to="/">Logout</Link></li>      
                                    </ul>
                                </li>
                            {/* </div> */}
                        </ul>             
                    </div>
                </div>
            </nav>
        </div>
        <div className="container-fluid artic"><Outlet /></div>
        
    </>
  )
};

export default Layout;