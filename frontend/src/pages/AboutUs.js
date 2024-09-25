import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const AboutUs = () => {
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: "easeInOut" } },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { delay: 0.3, staggerChildren: 0.2 } },
  };

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-gray-800 to-black text-white px-6"
    >
      <motion.div
        variants={containerVariants}
        className="text-center max-w-3xl"
      >
        <motion.h1
          variants={textVariants}
          className="text-5xl font-bold mb-6"
        >
          Welcome to Nexus
        </motion.h1>

        <motion.p
          variants={textVariants}
          className="text-lg leading-8"
        >
          Nexus is a multifaceted event management platform designed to streamline event planning, bringing together powerful tools, secure communication, and an intuitive user interface. Whether you're managing a corporate meeting, a wedding, or a party, Nexus provides personalized recommendations and smart insights that help you make informed decisions every step of the way.
        </motion.p>

        <motion.p
          variants={textVariants}
          className="text-lg leading-8 mt-4"
        >
          With modules dedicated to user authentication, vendor management, rental inventory, and task management, Nexus covers every aspect of event planning. As we continue to innovate, future integration of machine learning will offer enhanced recommendations, price prediction, and vendor performance insights.
        </motion.p>

        <motion.p
          variants={textVariants}
          className="text-lg leading-8 mt-4"
        >
          Join us in transforming the event management experience with Nexus, where efficiency meets creativity.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 1, ease: "easeInOut" }}
          className="mt-8"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-full"
          >
            <Link to='/'>get started</Link>
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.section>
  );
};

export default AboutUs;
