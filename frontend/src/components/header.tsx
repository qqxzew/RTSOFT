import {
  Bubbles,
  House,
  LayoutDashboard,
  Video,
  LogOut,
  User,
  Map,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../utils/api";

const Header: React.FC<{}> = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = apiService.isAuthenticated();
      const name = localStorage.getItem("authUsername");
      setIsLoggedIn(authenticated);
      setUserName(name || "User");
    };

    checkAuth();
    // Listen for storage changes
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const handleLogout = () => {
    apiService.clearToken();
    localStorage.removeItem("onboardingComplete");
    localStorage.removeItem("onboardingResponses");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.a
            href="/"
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="flex items-center gap-3 cursor-pointer"
          >
            <motion.img
              whileHover={{ rotate: 5 }}
              src="/skolnik.png"
              alt="Školník"
              className="h-12 w-auto"
            />
            <h1
              className="text-2xl font-black text-black tracking-tight"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Školník
            </h1>
          </motion.a>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <MenuItem label="Domů" href="/" icon={<House size={17} />} />
            <MenuItem
              label="Přehled"
              href="/prehled"
              icon={<LayoutDashboard size={17} />}
            />
            <MenuItem
              label="Roadmap"
              href="/roadmap"
              icon={<Map size={17} />}
            />
            <MenuItem
              label="AI Chat"
              href="/chat"
              icon={<Bubbles size={17} />}
            />
            <MenuItem
              label="3D Chat"
              href="/chat3d"
              icon={<Video size={17} />}
            />
          </nav>

          {/* User Section */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 cursor-pointer"
                >
                  <User size={18} className="text-[#86BC25]" />
                  <span
                    className="font-semibold text-black"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    Ahoj, {userName}
                  </span>
                </motion.div>
                <motion.button
                  onClick={handleLogout}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-2.5 rounded-xl border-2 border-gray-200 hover:border-red-500 hover:bg-red-50 transition-all duration-300 group"
                >
                  <LogOut
                    size={18}
                    className="text-gray-600 group-hover:text-red-500 transition-colors"
                  />
                </motion.button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

const MenuItem: React.FC<{
  label: string;
  href: string;
  icon: React.ReactNode;
}> = ({ label, href, icon }) => {
  return (
    <motion.a
      href={href}
      whileHover={{ scale: 1.05, y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-gray-600 hover:text-black hover:bg-gray-50 transition-all duration-200 font-semibold relative group"
      style={{ fontFamily: "Montserrat, sans-serif" }}
    >
      <motion.span className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-[#86BC25] to-[#6a9c1d] group-hover:w-full transition-all duration-300 rounded-full" />
      <motion.span
        whileHover={{ rotate: 10, scale: 1.1 }}
        className="inline-block"
      >
        {icon}
      </motion.span>
      <span className="text-sm font-semibold">{label}</span>
    </motion.a>
  );
};

export default Header;
