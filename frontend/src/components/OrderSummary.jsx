import { motion } from "framer-motion";
import { useCartStore } from "../stores/useCartStore";
import { Link } from "react-router-dom";
import { MoveRight } from "lucide-react";
import { useState } from "react";
import PaymentModal from "./PaymentModal";

const OrderSummary = () => {
  const { total, subtotal, coupon, isCouponApplied } = useCartStore();
  const [showModal, setShowModal] = useState(false);

  const savings = subtotal - total;

  return (
    <>
      <motion.div
        className="space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-xl font-semibold text-red-400">Order summary</p>

        <div className="space-y-4">
          <div className="space-y-2">
            <dl className="flex justify-between">
              <dt className="text-gray-300">Original price</dt>
              <dd className="text-white">${subtotal.toFixed(2)}</dd>
            </dl>

            {savings > 0 && (
              <dl className="flex justify-between">
                <dt className="text-gray-300">Savings</dt>
                <dd className="text-red-400">
                  -${savings.toFixed(2)}
                </dd>
              </dl>
            )}

            {coupon && isCouponApplied && (
              <dl className="flex justify-between">
                <dt className="text-gray-300">
                  Coupon ({coupon.code})
                </dt>
                <dd className="text-red-400">
                  -{coupon.discountPercentage}%
                </dd>
              </dl>
            )}

            <dl className="flex justify-between border-t border-gray-600 pt-2">
              <dt className="font-bold text-white">Total</dt>
              <dd className="font-bold text-red-400">
                ${total.toFixed(2)}
              </dd>
            </dl>
          </div>

          <motion.button
            onClick={() => setShowModal(true)}
            className="flex w-full items-center justify-center rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Proceed to Checkout
          </motion.button>

          <div className="flex justify-center gap-2">
            <span className="text-sm text-gray-400">or</span>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-red-400 underline"
            >
              Continue Shopping
              <MoveRight size={16} />
            </Link>
          </div>
        </div>
      </motion.div>

      {showModal && (
        <PaymentModal onClose={() => setShowModal(false)} />
      )}
    </>
  );
};

export default OrderSummary;
