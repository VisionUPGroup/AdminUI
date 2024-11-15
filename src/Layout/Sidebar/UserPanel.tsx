import { ImagePath } from "@/Constants";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";

const UserPanel = () => {
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    // Retrieve userData from cookies
    const userData = Cookies.get("userData");
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        setUserName(parsedData.username || "User"); // Adjust based on the exact field name
      } catch (error) {
        console.error("Failed to parse user data:", error);
      }
    }
  }, []);

  return (
    <div>
      <div className="sidebar-user text-center">
        <div>
          <img
            className="img-60 rounded-circle lazyloaded blur-up"
            src={`${ImagePath}/dashboard/man.png`}
            alt="admin image"
          />
        </div>
        <h6 className="mt-3 f-14">{userName}</h6>
      </div>
    </div>
  );
};

export default UserPanel;
