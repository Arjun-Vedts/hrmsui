import { useState, useEffect } from "react";
import { BiSolidExit } from "react-icons/bi";
import { FaHome, FaHSquare, FaUserClock } from "react-icons/fa";
import { FaAddressCard, FaBell, FaCaretDown } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import "./navbar.css";
import { getHeaderModuleDetailList, getHeaderModuleList } from "../../service/admin.service";
import * as FaIcons from "react-icons/fa";


const Navbar = () => {

    const navigate = useNavigate();
    const [headerModuleList, setHeaderModuleList] = useState([]);
    const [headerModuleDetailList, setHeaderModuleDetailList] = useState([]);
    const [notifiCount, setNotifiCount] = useState(0);
    const [notifiList, setNotifiList] = useState([]);
    const title = localStorage.getItem("title");
    const roleName = localStorage.getItem("roleName");
    const empName = localStorage.getItem("empName");
    const designationCode = localStorage.getItem("designationCode");
    const roleId = localStorage.getItem("roleId");

    useEffect(() => {
        if (roleId) {
            fetchHeaderModuleList(roleId);
            fetchHeaderModuleDetailList(roleId);
        }
    }, [roleId]);


    const handleLogout = (e) => {
        e.preventDefault();
        localStorage.clear();
        navigate("/login");
    };


    const fetchHeaderModuleList = async (roleId) => {
        try {
            const moduleListResponse = await getHeaderModuleList(roleId);

            setHeaderModuleList(moduleListResponse);
        } catch (error) {
            console.error('Error fetching Header Module list:', error);
        }
    };

    const fetchHeaderModuleDetailList = async (roleId) => {
        try {
            const moduleDetailListResponse = await getHeaderModuleDetailList(roleId);
            setHeaderModuleDetailList(moduleDetailListResponse);
            //   const notifiCount = await getNotifiCount();
            //   const notifiList = await getNotifiList();
            //   setNotifiCount(notifiCount);
            //   setNotifiList(notifiList);

        } catch (error) {
            console.error('Error fetching Header Module Detail list:', error);
        }
    };

    const changePassword = async () => {

    }

    return (
        <nav className="navbar sticky-top navbar-expand-lg navbar-dark bg-dark-new nav-ams">
            <div className="row w-100">
                <div className="container d-flex">
                    <div className="col-md-4">
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <a href="/dashboard" className="nav-link p-0">
                                    <div
                                        className="d-flex align-items-center gap-3 px-2 py-1"
                                    >
                                        <h3 className="mb-0 d-flex align-items-center ms-1" style={{ fontWeight: 600 }}>
                                            <span className="neon-text">HRMS</span>
                                        </h3>

                                        <h6
                                            className="mb-0 d-flex align-items-end login-name"
                                            style={{ fontSize: "1rem" }}
                                        >
                                            {title || ''} {empName}, {designationCode || ''}
                                            {/* ({roleName || ''}) */}
                                        </h6>
                                    </div>
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div className="col-md-8 d-flex justify-content-end">
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item dropdown">
                                <a href="/dashboard" className="nav-link nav-animate">
                                    <FaHome className="icon-name" />Home
                                </a>
                            </li>


                            {headerModuleList.map((module, index) => {
                                const filteredDetails = headerModuleDetailList.filter(
                                    (detail) => detail.formModuleId === module.formModuleId
                                );

                                return filteredDetails.length >= 1 ? (
                                    <li key={index} className="nav-item dropdown">
                                        <a className="nav-link nav-animate">
                                            {(() => {
                                                const IconComponent = FaIcons[module.moduleIcon];
                                                return IconComponent ? <IconComponent className="icon-name" /> : null;
                                            })()}

                                            {module.formModuleName}
                                            <FaCaretDown className="arrow-down" />
                                        </a>
                                        <ul className="dropdown-menu mt-2">
                                            {filteredDetails.map((detail, idx) => (
                                                <li key={idx}>
                                                    <a className="dropdown-item" href={`/${detail?.formUrl}`} onClick={() => localStorage.setItem("formDetailId", detail.formDetailId)}>
                                                        {detail.formDispName}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                ) : (
                                    <li key={index} className="nav-item dropdown">
                                        <a
                                            href={`/${filteredDetails[0]?.formUrl ? filteredDetails[0]?.formUrl : "dashboard"}`}
                                            className="nav-link nav-animate"
                                            onClick={() => localStorage.setItem("formDetailId", module.FormDetailId)}
                                        >
                                            {module.formModuleName}
                                        </a>
                                    </li>
                                );
                            })}

                            {/* <li className="nav-item dropdown">
                                <a href="/dashboard" className="nav-link nav-animate" onClick={(e) => e.preventDefault()}>
                                    <FaHSquare className="icon-name" /> Help
                                    <FaCaretDown className="arrow-down" />
                                </a>
                                <ul className="dropdown-menu mt-2">
                                    <li>
                                        <a className="dropdown-item" href='#' onClick={changePassword}>
                                            Change Password
                                        </a>
                                    </li>
                                </ul>
                            </li> */}

                            <li className="nav-item dropdown" >
                                <a href="#" className="nav-link nav-animate">
                                    <FaBell className="icon-name" />
                                    <span className='notification-count'>{Number(notifiCount)}</span>
                                </a>
                                <ul className="dropdown-menu dropdown-menu-end dropdown-menu-notification mt-2 dms-notification shadow-lg rounded p-0">
                                    <li className="dropdown-header border-bottom text-dark employee-text py-2 bg-white sticky-top z-10 notificationStyles" >
                                        <strong className="fw-bold ">Notifications</strong>
                                    </li>



                                </ul>
                            </li>

                            <li className="nav-item dropdown" >
                                <a href="#" onClick={handleLogout} className="nav-link nav-animate">
                                    <BiSolidExit className="icon-name" /> Logout
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar;