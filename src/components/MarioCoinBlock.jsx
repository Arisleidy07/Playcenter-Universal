import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

function MarioCoinBlock() {
  const audioRef = useRef(null);
  const navigate = useNavigate();
  const [showCoins, setShowCoins] = useState(false);

  const handleClick = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setShowCoins(true);

      audioRef.current.onended = () => {
        setShowCoins(false);
        navigate("/arcade");
      };
    }
  };

  const coins = Array.from({ length: 150 });

  return (
    <>
      <motion.div
        whileTap={{ y: -8, rotate: [0, -10, 10, 0] }}
        className="cursor-pointer inline-block z-[100]"
        onClick={handleClick}
        title="¡Haz clic!"
      >
        <img
          src="/bloquemario.webp"
          alt="Bloque de monedas de Mario"
          className="w-12 h-13"
        />
        <audio ref={audioRef} src="/mario_coin_sound.mp3" preload="auto" />
      </motion.div>

      <AnimatePresence>
        {showCoins && (
          <motion.div
            key="coin-rain"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-95 pointer-events-auto z-[9999] overflow-hidden"
          >
            {coins.map((_, i) => (
              <BigCoin key={i} index={i} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const BigCoin = ({ index }) => {
  // Posición horizontal random en toda la pantalla
  const xStart = Math.random() * window.innerWidth;
  const xEnd = xStart + (Math.random() * 150 - 75);
  const delay = Math.random() * 0.7;
  const fallDuration = 2 + Math.random();

  return (
    <motion.img
      src="/mario_coin.png" // Tu PNG limpio con fondo transparente
      alt="Moneda"
      className="absolute"
      style={{
        top: -50,
        left: xStart,
        width: 200,
        height: 200,
        pointerEvents: "none",
        userSelect: "none",
      }}
      initial={{ y: -50, opacity: 1, rotate: 0, x: 0 }}
      animate={{
        y: [
          -50,
          window.innerHeight - 40,
          window.innerHeight - 70,
          window.innerHeight - 40,
        ],
        x: [0, xEnd - xStart, xEnd - xStart, xEnd - xStart],
        rotate: [0, 360, 450, 360],
        opacity: [1, 1, 1, 0],
      }}
      transition={{
        y: { duration: fallDuration, ease: "easeIn", times: [0, 0.7, 0.85, 1], delay },
        x: { duration: fallDuration, ease: "easeInOut", delay },
        rotate: { duration: fallDuration, ease: "linear", delay },
        opacity: { duration: 0.3, delay: delay + fallDuration * 0.85, ease: "easeOut" },
      }}
    />
  );
};

export default MarioCoinBlock;
