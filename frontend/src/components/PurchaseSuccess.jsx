import { useEffect } from "react";
import { useCartStore } from "../stores/useCartStore";

const PurchaseSuccess = () => {
  const { clearCart } = useCartStore();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold text-green-600">
        Payment Successful
      </h1>
      <p className="text-gray-400">
        Thank you for your purchase. Your order has been confirmed.
      </p>
    </div>
  );
};

export default PurchaseSuccess;
