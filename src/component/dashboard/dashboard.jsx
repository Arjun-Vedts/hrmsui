import AdminDashboard from "./adminDashboard";
import "./dashboard.css";
import UserDashboard from "./userDashboard";

const Dashboard = () => {

    const roleName = localStorage.getItem("roleName");

    return (
        <>
            {roleName !== "ROLE_USER" ? (
                <AdminDashboard />
            ) : (
                <UserDashboard />
            )}
        </>
    );
}

export default Dashboard;