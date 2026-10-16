import { ArrowRight, CheckCircle, HandHeart } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCartStore } from "../stores/useCartStore";
import axios from "../lib/axios";
import Confetti from "react-confetti";

const PurchaseSuccessPage = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(null);
  const [txRef, setTxRef] = useState(null);
  const { clearCart } = useCartStore();

  useEffect(() => {
    // Try multiple ways to get tx_ref
    const urlParams = new URLSearchParams(window.location.search);
    const txRefParam = urlParams.get("tx_ref") || urlParams.get("transaction_id") || urlParams.get("ref");
    
    console.log("URL params:", window.location.search);
    console.log("Found tx_ref:", txRefParam);

    if (!txRefParam) {
      setError("No transaction reference found in URL. Please check your payment confirmation email.");
      setIsProcessing(false);
      return;
    }

    setTxRef(txRefParam);

    const handleCheckoutSuccess = async () => {
      try {
        const response = await axios.post("/payment/checkout-success", {
          tx_ref: txRefParam,
        });

        console.log("Checkout success response:", response);
        
        // Clear cart only if order was verified successfully
        if (response.message || response.orderId) {
          clearCart();
        }
      } catch (err) {
        console.error("Checkout success error:", err);
        // Don't show error if order exists - payment might have succeeded
        // but frontend call failed due to auth issues
        if (err.response?.status === 404) {
          setError("Order not found. Please contact support with transaction reference: " + txRefParam);
        } else {
          // Payment might have succeeded, just show warning
          console.warn("Could not verify order, but payment may have succeeded");
        }
      } finally {
        setIsProcessing(false);
      }
    };

    handleCheckoutSuccess();
  }, [clearCart]);

  if (isProcessing) return <div className="text-center">Processing...</div>;

  if (error) return <div className="text-center text-red-400">{error}</div>;

  return (
    <div className="h-screen flex items-center justify-center px-4">
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        gravity={0.1}
        numberOfPieces={700}
        recycle={false}
      />

      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl overflow-hidden relative z-10">
        <div className="p-6 sm:p-8">
          <div className="flex justify-center">
            <CheckCircle className="text-white w-16 h-16 mb-4" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-center text-white mb-2">
            Purchase Successful!
          </h1>

          <p className="text-gray-300 text-center mb-2">
            Thank you for your order. We're processing it now.
          </p>

          <p className="text-white text-center text-sm mb-6">
            Transaction reference: <span className="font-mono">{txRef}</span>
          </p>

          <div className="space-y-4">
            <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center">
              <HandHeart className="mr-2" size={18} />
              Thanks for trusting us!
            </button>

            <Link
              to="/"
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center"
            >
              Continue Shopping
              <ArrowRight className="ml-2" size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSuccessPage;
