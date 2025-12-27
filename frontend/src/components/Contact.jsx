import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";

;

const Contact = () => {
  const form = useRef();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const sendEmail = (e) => {
    e.preventDefault();
    setSent(false);
    setErrorMsg("");
    setLoading(true);

    emailjs
      .sendForm(
        "service_zgpq2hy", // Replace with your actual service ID
        "template_9bpb5na", //  Replace with your template ID
        form.current,
        "rBxqSqR39OUywmjmr" //  Replace with your public key
      )
      .then(
        (result) => {
          console.log("Email sent:", result.text);
          setSent(true);
          setLoading(false);
          form.current.reset();
        },
        (error) => {
          console.error("Email send failed:", error.text || error);
          setErrorMsg("Failed to send. Please try again.");
          setLoading(false);
        }
      );
  };
  // Auto-hide the success message after 3 seconds
  useEffect(() => {
    let timer;
    if (sent) {
      timer = setTimeout(() => {
        setSent(false);
      }, 3000); // 3 seconds
    }
    return () => clearTimeout(timer); // clean up
  }, [sent]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate sending
    setSent(true);
  };
  return (
    <div
      id="contact"
      className="bg-gradient-to-br from-[#1a1c1f] via-[#121214] to-black text-white py-20 px-6 md:px-20"
    >
      <motion.h2
        initial={{ opacity: 0, y: 0 }}
        whileInView={{ opacity: 1, y: -50 }}
        transition={{ type: "spring", damping: 12, stiffness: 100, delay: 0.3 }}
        className="text-4xl font-bold text-center text-white mb-12"
      >
        Contact
      </motion.h2>

      <motion.form
        initial={{ opacity: 0, y: 0 }}
        whileInView={{ opacity: 1, y: -50 }}
        transition={{ type: "spring", damping: 12, stiffness: 100, delay: 0.5 }}
        ref={form}
        onSubmit={sendEmail}
        className="max-w-3xl mx-auto space-y-6"
      >
        <div>
          <label className="block mb-2 text-gray-300">Your Name</label>
          <input
            type="text"
            name="name"
            required
            className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div>
          <label className="block mb-2 text-gray-300">Your Email</label>
          <input
            type="email"
            name="email"
            required
            className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div>
          <label className="block mb-2 text-gray-300">Your Message</label>
          <textarea
            name="message"
            rows="5"
            required
            className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg w-full font-semibold transition duration-300 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Message"}
        </motion.button>

        {sent && (
          <p className="text-green-400 text-center pt-4">
            ✅ Message sent successfully!
          </p>
        )}
        {errorMsg && (
          <p className="text-red-400 text-center pt-4">❌ {errorMsg}</p>
        )}
      </motion.form>
    </div>
  );
};

export default Contact;
