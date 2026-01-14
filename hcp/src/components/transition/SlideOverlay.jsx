import React from "react";
import { motion } from "framer-motion";
import "../../styles/common/SlideOverlay.css";

export default function SlideOverlay({ children }) {
  return (
    <motion.div
      className="slide-overlay"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{
        type: "tween",
        duration: 0.32,
        ease: [0.23, 1, 0.32, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
