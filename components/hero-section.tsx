"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { AnimatedFlag } from "@/components/animated-flag"

const flagGradients = [
  "original-pride-flag-gradient",
  "pride-flag-gradient",
  "trans-flag-gradient",
  "bi-flag-gradient",
  "pan-flag-gradient",
  "lesbian-flag-gradient",
  "nonbinary-flag-gradient",
]

// Updated to match the exact flag colors from the main page flags array
const heroFlagsDisplayData = [
  { stripes: ["#FF69B4", "#FF0000", "#FF8E00", "#FFFF00", "#008E00", "#00C0C0", "#400098", "#8E008E"] }, // Original Pride
  { stripes: ["#e40303", "#ff8c00", "#ffed00", "#008018", "#004cff", "#732982"] }, // Pride
  { stripes: ["#5bcefa", "#f5a9b8", "#ffffff", "#f5a9b8", "#5bcefa"] }, // Trans
  { stripes: ["#d60270", "#9b59b6", "#0038a8"] }, // Bisexual
  { stripes: ["#ff218c", "#ffd800", "#21b1ff"] }, // Pansexual
  { stripes: ["#d52d00", "#ef7627", "#ff9a56", "#ffffff", "#d162a4", "#b55690", "#a30262"] }, // Lesbian
  { stripes: ["#fcf434", "#ffffff", "#9c59d1", "#000000"] }, // Non-binary
]

export default function HeroSection() {
  const [currentGradient, setCurrentGradient] = useState(0)
  const [nextGradient, setNextGradient] = useState(1)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [currentFlagIndex, setCurrentFlagIndex] = useState(0)
  const [nextFlagIndex, setNextFlagIndex] = useState(1)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true)
      setNextGradient((currentGradient + 1) % flagGradients.length)
      setNextFlagIndex((currentFlagIndex + 1) % heroFlagsDisplayData.length)

      setTimeout(() => {
        setCurrentGradient((currentGradient + 1) % flagGradients.length)
        setCurrentFlagIndex((currentFlagIndex + 1) % heroFlagsDisplayData.length)
        setIsTransitioning(false)
      }, 800)
    }, 5000)

    return () => clearInterval(interval)
  }, [currentGradient, currentFlagIndex])

  return (
    <section className="hero-container">
      {/* Aurora Flag Background with Fade Transition */}
      <div className="aurora-flag-container">
        {/* Current Flag */}
        <div
          className="aurora-flag-wrapper"
          style={{
            opacity: isTransitioning ? 0 : 1,
            transition: "opacity 800ms ease-in-out",
          }}
        >
          <AnimatedFlag
            backgroundColors={heroFlagsDisplayData[currentFlagIndex].stripes || []}
            svgForeground={heroFlagsDisplayData[currentFlagIndex].svgForeground}
            className="aurora-flag"
            numOfColumns={200}
            staggeredDelay={20}
            billow={0.05}
          />
        </div>

        {/* Next Flag - for transition */}
        <div
          className="aurora-flag-wrapper aurora-flag-overlay"
          style={{
            opacity: isTransitioning ? 1 : 0,
            transition: "opacity 800ms ease-in-out",
          }}
        >
          <AnimatedFlag
            backgroundColors={heroFlagsDisplayData[nextFlagIndex].stripes || []}
            svgForeground={heroFlagsDisplayData[nextFlagIndex].svgForeground}
            className="aurora-flag"
            numOfColumns={200}
            staggeredDelay={20}
            billow={0.05}
          />
        </div>
      </div>

      <div className="text-center relative z-10">
        <motion.h1
          initial={{
            opacity: 0,
            scale: 2.5,
            lineHeight: "1.5",
            y: "10vh",
          }}
          animate={{
            opacity: 1,
            scale: 1,
            lineHeight: "0.9",
            y: 0,
          }}
          transition={{
            duration: 1.8,
            ease: [0.16, 1, 0.3, 1],
            opacity: { duration: 0.8 },
          }}
          className="hero-text"
        >
          <div className="hero-text-container">
            {/* Base layer */}
            <div className="hero-text-layer">
              <div className={`flag-text-mask ${flagGradients[currentGradient]}`}>PRIDE</div>
              <div className={`flag-text-mask ${flagGradients[currentGradient]}`}>GUIDE</div>
            </div>

            {/* Transition layer */}
            <div className="hero-text-layer hero-text-overlay" style={{ opacity: isTransitioning ? 1 : 0 }}>
              <div className={`flag-text-mask ${flagGradients[nextGradient]}`}>PRIDE</div>
              <div className={`flag-text-mask ${flagGradients[nextGradient]}`}>GUIDE</div>
            </div>
          </div>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="mt-8"
        >
          <div className={`hero-text-subtitle transition-all`}>BY PRISM</div>
          <button
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
            className="bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-opacity-90 transition-all"
          >
            Explore Flags
          </button>
        </motion.div>
      </div>
    </section>
  )
}
