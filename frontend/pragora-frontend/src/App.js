import React, { useEffect, useState } from "react";
import AppRoutes from "./AppRoutes";
import { getUserDetails } from "./api/auth";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userDetails = await getUserDetails();
        setUser(userDetails);
      } catch (error) {
        console.error("Failed to fetch user details:", error);
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  return <AppRoutes user={user} />;
}

export default App;
