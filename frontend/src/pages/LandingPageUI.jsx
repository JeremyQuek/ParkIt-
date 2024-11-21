import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./style.css";

function LandingPage() {
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(false);
  const [showClickText, setShowClickText] = useState(false);

  useEffect(() => {
    const welcomeTimer = setTimeout(() => {
      setShowWelcome(true);
    }, 1000);

    const showTextTimer = setTimeout(() => {
      setShowClickText(true);
    }, 3000);

    return () => {
      clearTimeout(welcomeTimer);
      clearTimeout(showTextTimer);
    };
  }, []);

  const handleClickAnywhere = () => {
    navigate("/navigation");
  };

  return (
    <div onClick={handleClickAnywhere}>
      {showWelcome && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{
            position: "absolute",
            top: "25%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
          }}
        >
          <h1 style={{ color: "black" }}>Welcome Back!</h1>
          <h2 style={{ color: "black" }}>Ready to travel?</h2>
        </motion.div>
      )}

      {/* Static logo, no animation */}
      <div
        style={{
          position: "absolute",
          top: "51%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "150px",
          height: "150px",
        }}
      >
        <img
          src={`${process.env.PUBLIC_URL}/graph_icon.png`}
          alt="Graph Icon"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </div>

      {showClickText && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{
            position: "absolute",
            bottom: "10%",
            left: "50%",
            transform: "translateX(-50%)",
            textAlign: "center",
          }}
        >
          <p style={{ color: "gray", fontSize: "16px" }}>
            Click anywhere to continue
          </p>
        </motion.div>
      )}
    </div>
  );
}

export default LandingPage;
