import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";

const PaymentModal = ({ onClose }) => {
  const {
    subtotal,
    total,
    coupon,
    initiatePayment,
    paymentLoading,
  } = useCartStore();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <motion.div
        className="w-full max-w-md rounded-lg bg-gray-800 p-6 shadow-xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            Confirm Payment
          </h2>
          <button onClick={onClose}>
            <X className="text-gray-400" />
          </button>
        </div>

        {/* Summary */}
        <div className="mt-4 space-y-2 text-sm text-gray-300">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>ETB {subtotal.toFixed(2)}</span>
          </div>

          {coupon && (
            <div className="flex justify-between text-green-400">
              <span>Discount</span>
              <span>-{coupon.discountPercentage}%</span>
            </div>
          )}

          <div className="flex justify-between border-t border-gray-600 pt-2 text-lg font-bold text-white">
            <span>Total</span>
            <span>ETB {total.toFixed(2)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={paymentLoading}
            className="w-full rounded-md border border-gray-600 py-2 text-gray-300 disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            disabled={paymentLoading}
            onClick={initiatePayment}
            className="w-full rounded-md bg-red-600 py-2 text-white disabled:opacity-60"
          >
            {paymentLoading ? "Processing..." : "Proceed to Payment"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentModal;
