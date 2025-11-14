import React, { useState, useRef, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "../axiosConfig";
import Cookies from "js-cookie";
import { SessionContext } from "../App";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";




import pl from "../translations/polski.json";
import en from "../translations/english.json";
import auth from "../env";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Users = (props) => {
  const { setSessionData } = useContext(SessionContext);
  const [responseMsg, setResponseMsg] = useState("");
  const [responseClass, setResponseClass] = useState("login_res_hide");
  const [inputType, setInputype] = useState("password")
  const [showPassIcon, setShowPassIcon] = useState(faEye)
  const loginForm = useRef();

  const dev = auth.DEV;
  const host = dev ? auth.DEV_URL: auth.PROD_URL;

  // Language handling
  const language = props.language || "en";
  const lang = language === "pl" ? pl : en;

  // Login function
  const Login = (event) => {
    event.preventDefault();
    const email = loginForm.current.email.value;
    const password = loginForm.current.password.value;
    axios
      .post("/api/users/login", { email, password })
      .then((response) => {
        const status = response?.data?.data?.status;
        // Set response message and class based on login success
        if (status === "OK") {
          const newUser = {
            login: response.data.data.login,
            id: response.data.data.id,
            logged: true,
          };

          // Store user data in cookies
          Cookies.set("user", JSON.stringify(newUser), { expires: 7 }); // Expires in 7 days
          setSessionData(newUser);

          setResponseClass("login_res_show login_res_s");
          setResponseMsg(lang.translation.login.success || "Login success.");
        } else {
          setResponseClass("login_res_show login_res_f");
          setResponseMsg(lang.translation.login.failed || "Login failed.");
        }
      })
      .catch((error) => {
        console.error(error);

        setResponseClass("login_res_show login_res_f");
        setResponseMsg(error.message || lang.translation.login.error);
      })
      .finally(() => {
        // Clear form inputs after submission
        if (loginForm.current) {
          loginForm.current.email.value = "";
          loginForm.current.password.value = "";
        }
      });
      
  };

  const showPassword = (event) => {
    event.preventDefault()
    setInputype(inputType==="password"?"text":"password")
    setShowPassIcon(inputType==="password"?faEyeSlash:faEye)
  }

  return (
    <div className="users">
      <form className="contact_form" ref={loginForm} onSubmit={Login}>
        <div className="mb-3">
          <h3>{lang.translation.login.title || "Login"}</h3>
          <label htmlFor="email" className="form-label">
            {lang.translation.contact.email || "Email"}
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            placeholder="name@example.com"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            {lang.translation.login.password || "Password"}
          </label>
          <input
            type={inputType}
            className="form-control"
            id="password"
            name="password"
            placeholder="*********"
            required
          /><button className="showPass" onClick={showPassword}
          ><FontAwesomeIcon icon={showPassIcon} /></button>
        </div>
        <div className="mb-3">
          <button
            title={lang.translation.contact.send || "Send"}
            className="diagrams_submit_button"
            type="submit"
          >
            {lang.translation.login.logIn || "Log In"}
          </button>
        </div>
        <div className="login_options">
          <div className="login_option1">
            <Link to="/users/register">{lang.translation.login.register || "Register"}</Link>
          </div>
          /
          <div className="login_option2">
            <Link to="/users/reset">{lang.translation.login.reset || "Reset password"}</Link>
          </div>
        </div>
      </form>
      <div className={responseClass}>
        <p>{responseMsg}</p>
      </div>
    </div>
  );
};

export default Users;
