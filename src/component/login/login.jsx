import { useEffect, useState } from "react";
import * as Yup from "yup";
import "../login/loginPage.css";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { FaEye, FaEyeSlash, FaLock, FaUserAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getLicense, login } from "../../service/auth.service";

const Login = () => {
  const navigate = useNavigate();
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialValues] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "en",
  );

  const translations = {
    en: {
      title: "HRMS",
      subtitle: "Human Resource Management System (VER 1.0)",
      welcome: "Welcome Back",
      username: "Username",
      usernamePlaceholder: "Enter Username",
      password: "Password",
      passwordPlaceholder: "Enter Password",
       usernameRequired: "Username is required",
      passwordRequired: "Password is required",
      login: "Login",
      developed: "Designed & Developed by",
      browserText: "Best viewed on",
       invalidCredentials: "Invalid username or password",
    },
    hi: {
      title: "एचआरएमएस",
      subtitle: "मानव संसाधन प्रबंधन प्रणाली (संस्करण 1.0)",
      welcome: "वापसी पर आपका स्वागत है",
      username: "उपयोगकर्ता नाम",
      usernamePlaceholder: "उपयोगकर्ता नाम दर्ज करें",
      password: "पासवर्ड",
      passwordPlaceholder: "पासवर्ड दर्ज करें",
      usernameRequired: "उपयोगकर्ता नाम आवश्यक है",
    passwordRequired: "पासवर्ड आवश्यक है",
      login: "लॉगिन",
      developed: "डिज़ाइन एवं विकसित",
      browserText: "सर्वोत्तम प्रदर्शन हेतु",
      invalidCredentials: "अमान्य उपयोगकर्ता नाम या पासवर्ड",
    },
  };

  const t = translations[language];

  const toggleLanguage = () => {
    const newLang = language === "en" ? "hi" : "en";
    setLanguage(newLang);
    localStorage.setItem("language", newLang);
  };

  const validationSchema = Yup.object().shape({
    username: Yup.string()
      .required(t.usernameRequired)
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must not exceed 20 characters"),
    password: Yup.string()
      .required(t.passwordRequired)
      .min(3, "Password must be at least 3 characters")
      .max(40, "Password must not exceed 40 characters"),
  });

  const showError = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleLoginSubmit = async (values) => {
    setMessage("");
    setLoading(true);
    const username = values.username;
    const password = values.password;

    try {
      const isLicenseValid = await getLicense();

      if (!isLicenseValid) {
        localStorage.setItem("license-exp", "Y");
        navigate("/license-exp");
        return;
      }

      localStorage.setItem("license-exp", "N");

      const response = await login(username, password);

      if (response?.success) {
        navigate("/dashboard", { replace: true });
      } else {
        showError(response?.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      let resMessage = "Something went wrong, please try again!";

      if (error.response) {
        const status = error.response.status;
        if (status === 401) resMessage = t.invalidCredentials;
        else if (status === 403)
          resMessage = "Your account is locked or disabled";
        else if (status === 400) resMessage = "Invalid input format";
        else if (status === 500)
          resMessage = "Server error during authentication";
      }

      showError(resMessage);
    } finally {
      setLoading(false);
    }
  };

  // Clock
  useEffect(() => {
    const updateClock = () => {
      const date = new Date();
      let h = date.getHours();
      let m = date.getMinutes();
      let s = date.getSeconds();
      let session = "AM";

      if (h === 0) h = 12;
      if (h > 12) {
        h = h - 12;
        session = "PM";
      }

      h = h < 10 ? "0" + h : h;
      m = m < 10 ? "0" + m : m;
      s = s < 10 ? "0" + s : s;

      setTime(`${h}:${m}:${s} ${session}`);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="login-wrapper">
      {/* HEADER */}
      <header className="main-header">
        <div className="container header-container">
          <div></div>

          <div className="brand-center">
            <h1>{t.title}</h1>
            <p>{t.subtitle}</p>
          </div>



          <div className="clock-pill">{time}</div>

        

          <div className="language-container">
            <button
              className="language-toggle-btn"
              onClick={toggleLanguage}
              // title={language === "en" ? "Change Language" : "भाषा बदलें"}
            >
              <svg
                className="language-svg"
                xmlns="http://www.w3.org/2000/svg"
                width="26"
                height="26"
                viewBox="0 0 64 64"
                fill="none"
              >
                <path
                  d="M37.6672 9.95973V31.9997H34.4272V9.95973H31.5071V7.11973H41.8271V9.95973H37.6672ZM22.5871 6.71973C24.6671 6.71973 26.2538 7.23973 27.3471 8.27973C28.4671 9.31973 29.0271 10.6264 29.0271 12.1997C29.0271 13.3464 28.7205 14.3864 28.1071 15.3197C27.5205 16.2264 26.6405 16.9464 25.4671 17.4797C24.2938 18.0131 22.8271 18.3064 21.0671 18.3597L20.8671 15.5597C22.6805 15.5064 23.9605 15.1864 24.7071 14.5997C25.4805 14.0131 25.8671 13.2264 25.8671 12.2397C25.8671 11.2797 25.5471 10.5864 24.9071 10.1597C24.2938 9.73306 23.5738 9.51973 22.7471 9.51973C21.7605 9.51973 20.8671 9.65306 20.0671 9.91973C19.2671 10.1864 18.4138 10.5464 17.5071 10.9997L16.5071 8.23973C17.2005 7.86639 18.0538 7.51973 19.0671 7.19973C20.1071 6.87973 21.2805 6.71973 22.5871 6.71973ZM29.4671 23.2797C29.4671 24.5064 29.1871 25.5331 28.6271 26.3597C28.0671 27.1864 27.3071 27.7997 26.3471 28.1997C25.4138 28.5997 24.3471 28.7997 23.1471 28.7997C21.6271 28.7997 20.2138 28.4264 18.9071 27.6797C17.6271 26.9331 16.4005 25.7464 15.2271 24.1197C14.0805 22.4931 12.9471 20.3731 11.8271 17.7597L14.6671 16.7197C15.4405 18.6131 16.2405 20.2531 17.0671 21.6397C17.9205 22.9997 18.8271 24.0531 19.7871 24.7997C20.7471 25.5197 21.7738 25.8797 22.8671 25.8797C23.8805 25.8797 24.7071 25.6531 25.3471 25.1997C25.9871 24.7197 26.3071 23.9597 26.3071 22.9197C26.3071 21.6397 25.8671 20.5331 24.9871 19.5997C24.1071 18.6664 23.0405 17.8131 21.7871 17.0397L24.1471 16.9197L25.8671 16.5597C26.2405 16.8797 26.6538 17.2664 27.1071 17.7197C27.5605 18.1731 27.9205 18.6264 28.1871 19.0797L28.3872 19.8397C28.7338 20.3464 29.0005 20.8797 29.1871 21.4397C29.3738 21.9997 29.4671 22.6131 29.4671 23.2797ZM30.1071 17.9997C31.3871 17.9997 32.4938 17.9064 33.4272 17.7197C34.3605 17.5064 35.4538 17.1731 36.7071 16.7197V19.5997C35.5605 20.1064 34.5205 20.4397 33.5871 20.5997C32.6805 20.7597 31.6805 20.8397 30.5871 20.8397C30.1871 20.8397 29.7205 20.8131 29.1871 20.7597C28.6538 20.6797 28.1471 20.5997 27.6671 20.5197C27.2138 20.4131 26.8805 20.3197 26.6671 20.2397L24.7871 17.9997L25.0271 17.3997C25.8005 17.5864 26.6138 17.7331 27.4671 17.8397C28.3205 17.9464 29.2005 17.9997 30.1071 17.9997Z"
                  fill="currentColor"
                ></path>
                <path
                  d="M52.3467 58.6664L49.136 50.4158H38.5707L35.3973 58.6664H32L42.416 31.8984H45.44L55.8187 58.6664H52.3467ZM48.128 47.4291L45.1413 39.3651C45.0667 39.1659 44.9421 38.8051 44.768 38.2824C44.5939 37.7598 44.4195 37.2246 44.2453 36.6771C44.096 36.1046 43.9715 35.6691 43.872 35.3704C43.6728 36.1419 43.4613 36.9011 43.2373 37.6478C43.0381 38.3696 42.864 38.9419 42.7147 39.3651L39.6907 47.4291H48.128Z"
                  fill="currentColor"
                ></path>
              </svg>

              <span className="language-tooltips">
                {language === "en" ? "Change Language" : "भाषा बदलें"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* BODY */}
      <div className="login-viewport">
        <div className="premium-card">
          <h3 className="text-center mb-4 mt-3">{t.welcome}</h3>

          {message && (
            <div className="alert alert-danger text-center" role="alert">
              {message}
            </div>
          )}

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleLoginSubmit}
          >
            {({ errors, touched }) => (
              <Form className="text-start">
                {/* Username */}
                <div className="mb-3 position-relative">
                  <label className="form-label fw-semibold">
                    <FaUserAlt className="input-icon" />
                    {t.username}
                  </label>
                  <Field
                    type="text"
                    name="username"
                    className="form-control custom-input ps-3"
                    placeholder={t.usernamePlaceholder}
                  />
                  <ErrorMessage
                    name="username"
                    component="div"
                    className="error-text"
                  />
                </div>

                {/* Password */}
                <div className="mb-3 position-relative">
                  <label className="form-label fw-semibold">
                    <FaLock className="input-icon" />
                    {t.password}
                  </label>
                  <div className="input-with-icon">
                    <Field
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className="form-control custom-input ps-3 pe-5"
                      placeholder={t.passwordPlaceholder}
                    />

                    <span
                      className="input-eye"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="error-text"
                  />
                </div>

                <button
                  className="btn login-btn w-100 mt-3"
                  type="submit"
                  disabled={loading}
                >
                  {" "}
                  {loading && (
                    <span className="spinner-border spinner-border-sm me-2"></span>
                  )}
                  {t.login}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="footer text-center">
        <div className="container">
          <p className="mb-0">
            {t.developed} <strong>Vedant Tech Solutions</strong> ©{" "}
            {new Date().getFullYear()} HRMS
          </p>
          <div className="small-text">
            {t.browserText} on&nbsp;
            <img
              src="/browsers/chrome.svg"
              alt="Chrome"
              className="browser-img"
            />
            Chrome 120+,&nbsp;
            <img
              src="/browsers/firefox.svg"
              alt="Firefox"
              className="browser-img"
            />
            Firefox 115+,&nbsp;
            <img src="/browsers/edge.svg" alt="Edge" className="browser-img" />
            Edge 120+
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;
