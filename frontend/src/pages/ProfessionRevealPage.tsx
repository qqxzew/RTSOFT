import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ProfessionReveal } from "../components/ProfessionReveal";

export const ProfessionRevealPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showReveal, setShowReveal] = useState(true);

  const profession = location.state?.profession || "Frontend Developer";

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowReveal(false);
      navigate("/roadmap", {
        state: {
          profession,
          userData: location.state?.userData,
        },
      });
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate, profession, location.state?.userData]);

  return showReveal ? <ProfessionReveal profession={profession} /> : null;
};
