"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const CompanyLogos = () => {
  const logos = [
    { src: "/comp.logos/Adobe_idLnet8cfu_1.png", alt: "Adobe" },
    { src: "/comp.logos/Meta_idlf4cVSsS_2.png", alt: "Meta" },
    { src: "/comp.logos/Amazon_Logo_2.webp", alt: "Amazon" },
    { src: "/comp.logos/Ford.png", alt: "Ford", scale: 0.85 },
    { src: "/comp.logos/Airbnb_Logo_1.png", alt: "Airbnb" },
    {
      src: "/comp.logos/Rivian_Logo_Alternative_1.png",
      alt: "Rivian",
      invert: true,
    },
  ];

  // Quadruple the logos for smoother infinite scrolling
  const scrollingLogos = [...logos, ...logos, ...logos, ...logos];

  return (
    <section className="py-4 mt-[-12rem] relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-lg text-gray-500 mb-4">
          Trusted by users at top companies
        </p>
        <div className="overflow-hidden relative w-full">
          <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent z-10" />
          <motion.div
            className="flex space-x-12 py-4"
            initial={{ x: 0 }}
            animate={{ x: `-${logos.length * 160}px` }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 25,
                ease: "linear",
              },
            }}
          >
            {scrollingLogos.map((logo, index) => (
              <motion.div
                key={index}
                className="relative h-10 w-28 flex-shrink-0"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  fill
                  style={{
                    objectFit: "contain",
                    filter: logo.invert ? "brightness(0) invert(1)" : "none",
                    transform: logo.scale ? `scale(${logo.scale})` : "none",
                  }}
                  priority={index < logos.length}
                  sizes="(max-width: 768px) 80px, 120px"
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CompanyLogos;
