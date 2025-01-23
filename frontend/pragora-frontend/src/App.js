import React from "react";
import AppRoutes from "./AppRoutes";
import { AuthProvider } from "./contexts/AuthContext";
import { ProfileProvider } from "./contexts/ProfileContext";

const App = () => {
  return (
    <AuthProvider>
      <ProfileProvider>
        <AppRoutes />
      </ProfileProvider>
    </AuthProvider>
  );
};

export default App;

