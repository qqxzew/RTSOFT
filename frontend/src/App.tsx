import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Landing } from "./pages/Landing";
import { GoogleLogin } from "./pages/GoogleLogin";
import { Onboarding } from "./pages/Onboarding";
import { ProfessionRevealPage } from "./pages/ProfessionRevealPage";
import { Roadmap } from "./pages/Roadmap";
import { RoadmapPage } from "./pages/RoadmapPage";
import { Auth } from "./pages/Auth";
import { AIOnboarding } from "./pages/AIOnboarding";
import { Overview } from "./pages/Overview";
import { Chat } from "./pages/Chat";
import { Chat3D } from "./pages/Chat3D";
import "./App.css";
import Header from "./components/header";
import { apiService } from "./utils/api";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = apiService.isAuthenticated();
  const onboardingComplete = localStorage.getItem("onboardingComplete");

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (!onboardingComplete && window.location.pathname !== "/ai-onboarding") {
    return <Navigate to="/ai-onboarding" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/auth" element={<Auth />} />

          {/* AI Onboarding - requires auth but not onboarding completion */}
          <Route
            path="/ai-onboarding"
            element={
              apiService.isAuthenticated() ? (
                <AIOnboarding />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />

          {/* Protected routes - require auth AND onboarding completion */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Header />
                <Landing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/prehled"
            element={
              <ProtectedRoute>
                <Header />
                <Overview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/roadmap"
            element={
              <ProtectedRoute>
                <Header />
                <RoadmapPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat3d"
            element={
              <ProtectedRoute>
                <Chat3D />
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={
              <ProtectedRoute>
                <Header />
                <GoogleLogin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Header />
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profession-reveal"
            element={
              <ProtectedRoute>
                <Header />
                <ProfessionRevealPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/roadmap-old"
            element={
              <ProtectedRoute>
                <Header />
                <Roadmap />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
