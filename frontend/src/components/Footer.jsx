// import React from "react";
import { Link } from "react-scroll";
import { motion } from "framer-motion";
import {
  FaFacebookF,
  FaInstagram,
  FaTelegramPlane,
  FaGoogle,
} from "react-icons/fa";
import {
  SiVisa,
  SiMastercard,
  SiPaypal,
  SiAmericanexpress,
  SiDiscover,
} from "react-icons/si";
import { MdLocationOn, MdPhone } from "react-icons/md";

const Footer = () => {
  return (
    <footer className="bg-red-500 text-white px-6 py-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 ml-[10%]">
        {/* Left Section - About */}
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          whileInView={{ opacity: 1, y: -5 }}
          transition={{
            type: "spring",
            damping: 12,
            stiffness: 100,
            delay: 0.9,
          }}
        >
          <h2 className="text-xl font-bold mb-4">COTTEX</h2>
          <p className="text-sm mb-4">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Eum ea
            ratione quidem libero, praesentium ab atque? Quidem maxime, numquam
            dolores
          </p>
          <div className="flex items-center gap-2 text-sm mb-2">
            <MdPhone />
            <span>+251947710962</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MdLocationOn />
            <span>Addis Ababa, Ethiopia</span>
          </div>
        </motion.div>

        {/* Middle Section - Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          whileInView={{ opacity: 1, y: -5 }}
          transition={{
            type: "spring",
            damping: 12,
            stiffness: 100,
            delay: 1,
          }}
        >
          <h2 className="text-xl font-bold mb-4">Quick Links</h2>
          <Link to="#hero" smooth={true} duration={500}>
            <div className="grid grid-cols-2 gap-x-6 text-sm">
              <div className="space-y-2">
                <p className="hover:underline cursor-pointer">Home</p>
                <p className="hover:underline cursor-pointer">About</p>
                <p className="hover:underline cursor-pointer">Contact us</p>
                <p className="hover:underline cursor-pointer">Privacy Policy</p>
              </div>
              <div className="space-y-2">
                <p className="hover:underline cursor-pointer">Home</p>
                <p className="hover:underline cursor-pointer">About</p>
                <p className="hover:underline cursor-pointer">Contact us</p>
                <p className="hover:underline cursor-pointer">Privacy Policy</p>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Right Section - Social & Payments */}
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          whileInView={{ opacity: 1, y: -5 }}
          transition={{
            type: "spring",
            damping: 12,
            stiffness: 100,
            delay: 1,
          }}
        >
          <h2 className="text-xl font-bold mb-4">Follow Us</h2>
          <div className="flex gap-4 text-xl mb-6">
            <FaFacebookF className="hover:text-black hover:scale-110 transition duration-300 cursor-pointer" />
            <FaInstagram className="hover:text-black hover:scale-110 transition duration-300 cursor-pointer" />
            <FaTelegramPlane className="hover:text-black hover:scale-110 transition duration-300 cursor-pointer" />
            <FaGoogle className="hover:text-black hover:scale-110 transition duration-300 cursor-pointer" />
          </div>

          <h3 className="text-lg font-semibold mb-2">Payment Methods</h3>
          <div className="flex gap-3 text-3xl">
            <SiVisa
              style={{ color: "#1A1F71" }}
              className="hover:scale-110 transition duration-300 cursor-pointer"
            />
            <SiMastercard
              style={{ color: "#EB001B" }}
              className="hover:scale-110 transition duration-300 cursor-pointer"
            />
            <SiPaypal
              style={{ color: "#003087" }}
              className="hover:scale-110 transition duration-300 cursor-pointer"
            />
            <SiAmericanexpress
              style={{ color: "#2E77BC" }}
              className="hover:scale-110 transition duration-300 cursor-pointer"
            />
            <SiDiscover
              style={{ color: "#99ffbb" }}
              className="hover:scale-110 transition duration-300 cursor-pointer"
            />
          </div>
        </motion.div>
      </div>

      {/* Bottom Copyright */}
      <div className="border-t border-white mt-10 pt-4 text-center text-sm">
        Copyright © 2025 COTTEX. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
