import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Mail, Lock, User, ArrowRight, Loader, Phone } from "lucide-react";
import { motion } from "framer-motion";
import axios from "../lib/axios"; // make sure this exists

const SignUpPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);

  // STEP 1 — SEND OTP
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await axios.post("/auth/send-otp", {
        phone: formData.phone,
      });

      setShowOtpModal(true);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2 — VERIFY OTP + SIGNUP
  const handleVerifyOtp = async () => {
    try {
      setLoading(true);

      await axios.post("/auth/verify-otp", {
        phone: formData.phone,
        otp,
      });

      // OTP verified → SIGNUP
      await axios.post("/auth/signup", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      alert("Account created successfully!");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div
        className="sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Create your account
        </h2>
      </motion.div>

      <motion.div
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* NAME */}
            <Input label="Full name" icon={<User />} value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} />

            {/* EMAIL */}
            <Input label="Email" icon={<Mail />} type="email" value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })} />

            {/* PHONE */}
            <Input label="Phone" icon={<Phone />} value={formData.phone}
              placeholder="+2519xxxxxxx"
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />

            {/* PASSWORD */}
            <Input label="Password" icon={<Lock />} type="password" value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })} />

            {/* CONFIRM */}
            <Input label="Confirm Password" icon={<Lock />} type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} />

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              {loading ? <Loader className="animate-spin" /> : "Sign up"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-red-400">
              Login here <ArrowRight className="inline h-4 w-4" />
            </Link>
          </p>
        </div>
      </motion.div>

      {/* OTP MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg w-80">
            <h3 className="text-white text-lg mb-4">Enter OTP</h3>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
              placeholder="6-digit OTP"
            />
            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full bg-red-600 text-white py-2 rounded"
            >
              Verify OTP
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Input = ({ label, icon, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300">{label}</label>
    <div className="mt-1 relative">
      <div className="absolute left-3 top-2 text-gray-400">{icon}</div>
      <input
        {...props}
        required
        className="w-full pl-10 p-2 bg-gray-700 text-white rounded"
      />
    </div>
  </div>
);

export default SignUpPage;
