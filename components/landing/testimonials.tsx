"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";

const testimonials = [
  {
    name: "Tom Baker",
    role: "Junior Developer at Brightway Digital (Leeds)",
    text: "Was really skeptical about AI interviews at first, but this actually helped loads with my confidence. The feedback about my 'ums' and rushed answers was spot on. After a week of practice, I felt so much more prepared. Just landed my first dev role! 🎉",
  },
  {
    name: "Rachel Singh",
    role: "Business Analyst at Yorkshire Finance Ltd",
    text: "Coming from retail into business analysis was scary. VoxHire helped me practice explaining my transferable skills better. The AI caught when I was being too vague and helped me give more concrete examples. Really grateful for this tool!",
  },
  {
    name: "David Chen",
    role: "Data Analyst at DataSense Solutions (Manchester)",
    text: "Been using VoxHire during my job search - absolute lifesaver! Could practice at weird hours (I'm a night owl 🦉). The questions felt really similar to my actual interviews. Just got an offer yesterday, and I know this helped me prepare!",
  },
  {
    name: "Emma Thompson",
    role: "Frontend Developer at WebCraft Studios (Bristol)",
    text: "This tool is brilliant for practice! The AI picked up on things like my tendency to interrupt and helped me work on active listening. Used it for about 2 weeks before interviews - definitely worth it. Started my new job last month! 💻",
  },
];

export const Testimonials = () => {
  const controls = useAnimation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    let isActive = true;

    const animate = async () => {
      if (!mounted || !isActive) return;

      try {
        await controls.start((i) => ({
          y: [0, -8, 0],
          transition: {
            duration: 4,
            delay: i * 0.3,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 1,
          },
        }));
      } catch (error) {
        // Handle any animation errors silently
        console.error("Animation error:", error);
      }
    };

    animate();

    return () => {
      isActive = false;
      controls.stop();
    };
  }, [controls, mounted]);

  if (!mounted) return null;

  return (
    <section className="relative z-10 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Real User Stories
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            See how VoxHire helps people like you prepare for their dream roles
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              custom={index}
              animate={controls}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false }}
              whileHover={{ scale: 1.02 }}
              className="flex flex-col gap-4 bg-[#14549d]/10 p-6 rounded-xl hover:bg-[#14549d]/20 transition-colors duration-300"
            >
              <div>
                <h4 className="font-semibold text-white">{testimonial.name}</h4>
                <p className="text-sm text-gray-400">{testimonial.role}</p>
              </div>
              <p className="text-gray-300">{testimonial.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
