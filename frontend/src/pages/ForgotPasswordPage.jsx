import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Shield, Lock, Loader } from "lucide-react";
import { toast } from "react-hot-toast";
import { authApi } from "../lib/apiClient";

const ForgotPasswordPage = () => {
    const [step, setStep] = useState(1);

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPin, setNewPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [loading, setLoading] = useState(false);

    /* ======================
       STEP 1 – SEND OTP
    ====================== */
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await authApi.post("/forgot-password", { email });
            toast.success("OTP sent to your email");
            setStep(2);
        } catch (error) {
            toast.error(error.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    /* ======================
       STEP 2 – VERIFY OTP
    ====================== */
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await authApi.post("/verify-otp", { email, otp });
            toast.success("OTP verified");
            setStep(3);
        } catch (error) {
            toast.error(error.message || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    /* ======================
       STEP 3 – RESET PIN
    ====================== */
    const handleResetPin = async (e) => {
        e.preventDefault();

        if (newPin !== confirmPin) {
            return toast.error("PINs do not match");
        }

        setLoading(true);

        try {
            await authApi.post("/reset-password", {
                email,
                otp,
                newPassword: newPin,
            });

            toast.success("Password reset successful");
            setStep(4);
        } catch (error) {
            toast.error(error.message || "Failed to reset password");
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
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <Input
                            icon={Mail}
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                        />
                        <SubmitButton loading={loading} text="Send OTP" />
                    </form>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <Input
                            icon={Shield}
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                        <SubmitButton loading={loading} text="Verify OTP" />
                    </form>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                    <form onSubmit={handleResetPin} className="space-y-4">
                        <Input
                            icon={Lock}
                            placeholder="New PIN / Password"
                            value={newPin}
                            onChange={(e) => setNewPin(e.target.value)}
                            type="password"
                        />
                        <Input
                            icon={Lock}
                            placeholder="Re-enter New PIN"
                            value={confirmPin}
                            onChange={(e) => setConfirmPin(e.target.value)}
                            type="password"
                        />
                        <SubmitButton loading={loading} text="Reset Password" />
                    </form>
                )}

                {/* SUCCESS */}
                {step === 4 && (
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
