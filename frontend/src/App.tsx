import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import ChatPage from "./pages/ChatPage";
import BankerPortalPage from "./pages/BankerPortalPage";
import Test from "./pages/test";

import { SelectedUserProvider } from "./Context/SelectedUserContext";

export default function App() {
  return (
    <Router>
      <SelectedUserProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/bank/dash/" element={<BankerPortalPage />} />
          <Route path="/test" element={<Test />} />
        </Routes>
      </SelectedUserProvider>
    </Router>
  );
}
