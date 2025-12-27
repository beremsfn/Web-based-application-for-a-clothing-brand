import { useState } from "react";
import { motion } from "framer-motion";
import { useUserStore } from "../stores/useUserStore";
import { toast } from "react-hot-toast";
import {
  Mail,
  User,
  Shield,
  Calendar,
  Lock,
} from "lucide-react";

export default function ProfilePage() {
  const user = useUserStore((state) => state.user);
  const changePassword = useUserStore((state) => state.changePassword);

  const [activeTab, setActiveTab] = useState("profile");
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handlePinChange = async (e) => {
    e.preventDefault();

    if (newPin !== confirmPin) {
      return toast.error("New PINs do not match");
    }

    setLoading(true);

    await changePassword({
      currentPassword: currentPin,
      newPassword: newPin,
    });

    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");
    setLoading(false);
  };

  return (
    <div className="flex justify-center py-12 px-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-center text-3xl font-bold text-white mb-6">
          Account Settings
        </h2>

        {/* Tabs */}
        <div className="flex bg-gray-800 rounded-lg overflow-hidden mb-6">
          <TabButton
            active={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </TabButton>
          <TabButton
            active={activeTab === "pin"}
            onClick={() => setActiveTab("pin")}
          >
            Change PIN
          </TabButton>
        </div>

        {/* Content */}
        <div className="bg-gray-800 rounded-lg p-6 text-white shadow">
          {activeTab === "profile" && (
            <div className="space-y-5">
              <ProfileRow icon={User} label="Full Name" value={user.name} />
              <ProfileRow icon={Mail} label="Email Address" value={user.email} />
              <ProfileRow icon={Shield} label="Role" value={user.role} />
              <ProfileRow
                icon={Calendar}
                label="Member Since"
                value={new Date(user.createdAt).toLocaleDateString()}
              />
            </div>
          )}

          {activeTab === "pin" && (
            <form onSubmit={handlePinChange} className="space-y-4">
              <InputField
                label="Current PIN"
                value={currentPin}
                onChange={setCurrentPin}
              />

              <InputField
                label="New PIN"
                value={newPin}
                onChange={setNewPin}
              />

              <InputField
                label="Confirm New PIN"
                value={confirmPin}
                onChange={setConfirmPin}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 transition py-2 rounded font-medium"
              >
                {loading ? "Updating..." : "Update PIN"}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ======================
   Helper Components
====================== */

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-3 text-sm font-medium transition ${
      active
        ? "bg-red-600 text-white"
        : "text-gray-300 hover:bg-gray-700"
    }`}
  >
    {children}
  </button>
);

const ProfileRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 bg-gray-700 p-3 rounded-md">
    <Icon className="h-5 w-5 text-gray-300" />
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  </div>
);

const InputField = ({ label, value, onChange }) => (
  <div>
    <label className="block text-sm text-gray-300 mb-1">{label}</label>
    <div className="flex items-center bg-gray-700 rounded px-3">
      <Lock className="h-4 w-4 text-gray-400 mr-2" />
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent py-2 text-white focus:outline-none"
        required
      />
    </div>
  </div>
);
