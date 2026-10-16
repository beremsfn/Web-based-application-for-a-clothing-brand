import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Mail, Lock, Loader } from "lucide-react";
import { toast } from "react-hot-toast";
import { authApi } from "../lib/apiClient";

const ForgotPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");
    const emailFromUrl = searchParams.get("email");

    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [newPin, setNewPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [loading, setLoading] = useState(false);

    // If token and email are in URL, go directly to reset step
    useEffect(() => {
        if (token && emailFromUrl) {
            setEmail(emailFromUrl);
            setStep(2);
        }
    }, [token, emailFromUrl]);

    /* ======================
       STEP 1 – REQUEST RESET
    ====================== */
    const handleRequestReset = async (e) => {
        e.preventDefault();
        
        // Frontend validation
        if (!email || !email.trim()) {
            toast.error("Please enter your email address");
            return;
        }

        // Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            toast.error("Please enter a valid email address");
            return;
        }

        setLoading(true);

        try {
            await authApi.post("/forgot-password", { email: email.trim() });
            toast.success("Temporary password sent to your email");
            setStep(2);
        } catch (error) {
            toast.error(error.message || "Failed to send reset link");
        } finally {
            setLoading(false);
        }
    };

    /* ======================
       STEP 2 – RESET PASSWORD
    ====================== */
    const handleResetPin = async (e) => {
        e.preventDefault();

        if (newPin !== confirmPin) {
            return toast.error("Passwords do not match");
        }

        setLoading(true);

        try {
            await authApi.post("/reset-password", {
                email,
                token: token || "",
                newPassword: newPin,
            });

            toast.success("Password reset successful");
            setStep(3);
            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center py-12 px-4">
            <motion.div
                className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h2 className="text-2xl font-bold text-center text-white mb-6">
                    Forgot Password
                </h2>

                {/* STEP 1 */}
                {step === 1 && (
                    <form onSubmit={handleRequestReset} className="space-y-4">
                        <Input
                            icon={Mail}
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                        />
                        <SubmitButton loading={loading} text="Send Reset Link" />
                    </form>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                    <form onSubmit={handleResetPin} className="space-y-4">
                        <Input
                            icon={Lock}
                            placeholder="New Password"
                            value={newPin}
                            onChange={(e) => setNewPin(e.target.value)}
                            type="password"
                        />
                        <Input
                            icon={Lock}
                            placeholder="Confirm New Password"
                            value={confirmPin}
                            onChange={(e) => setConfirmPin(e.target.value)}
                            type="password"
                        />
                        <SubmitButton loading={loading} text="Reset Password" />
                    </form>
                )}

                {/* SUCCESS */}
                {step === 3 && (
                    <p className="text-center text-green-400">
                        Your password has been reset successfully.
                    </p>
                )}
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;

/* ======================
   Reusable Components
====================== */

const Input = ({ icon: Icon, ...props }) => (
    <div className="relative">
        <Icon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        <input
            {...props}
            required
            className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600
                 rounded-md text-white placeholder-gray-400 focus:ring-red-500
                 focus:border-red-500"
        />
    </div>
);

const SubmitButton = ({ loading, text }) => (
    <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center items-center py-2 rounded-md
               bg-red-600 hover:bg-red-700 text-white font-medium transition
               disabled:opacity-50"
    >
        {loading ? <Loader className="h-5 w-5 animate-spin" /> : text}
    </button>
);
