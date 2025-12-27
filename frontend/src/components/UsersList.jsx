import { useEffect } from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";

const UsersList = () => {
  const { users, loading, fetchAllUsers, deleteUser } = useUserStore();

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  if (loading) {
    return (
      <p className="text-center text-white text-lg">
        Loading users...
      </p>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-lg p-6"
    >
      <h2 className="text-2xl font-bold text-white mb-6">
        Users Management
      </h2>

      {users.length === 0 ? (
        <p className="text-gray-400">No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-white">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3">Name</th>
                <th className="text-left py-3">Email</th>
                <th className="text-left py-3">Role</th>
                <th className="text-right py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="border-b border-gray-700 hover:bg-gray-700/50"
                >
                  <td className="py-3">{user.name}</td>
                  <td className="py-3">{user.email}</td>
                  <td className="py-3 capitalize">{user.role}</td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => deleteUser(user._id)}
                      className="text-red-500 hover:text-red-400 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default UsersList;
