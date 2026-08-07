
import { Outlet } from "react-router-dom";
import Navbar from "../component/navbar/Navbar";

export default function Layout() {

  const isRestrictedMode = sessionStorage.getItem("launchMode") === "true";

  return (
    <div className="relative min-h-screen bg-gray-50 flex flex-col">
      {!isRestrictedMode && <Navbar />}
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
}
