import axios from "axios"
import Order from "../models/order.model.js"
import User from "../models/user.model.js"
import Product from "../models/product.model.js"

const CHAPA_URL = process.env.CHAPA_URL
const CHAPA_AUTH = process.env.CHAPA_AUTH

const chapaConfig = {
  headers: {
    Authorization: `Bearer ${CHAPA_AUTH}`,
    "Content-Type": "application/json",
  },
}

// Helper function to confirm order and decrease stock
const confirmOrderAndUpdateStock = async (tx_ref) => {
  try {
    const order = await Order.findOne({ paymentRef: tx_ref });
    
    if (!order) {
      console.error("❌ Order not found for tx_ref:", tx_ref);
      return false;
    }

    // Check if already processed (avoid duplicate processing)
    if (order.paymentStatus === "paid") {
      console.log("⚠️ Order already confirmed for tx_ref:", tx_ref);
      return true;
    }

    // Update order status
    order.paymentStatus = "paid";
    order.orderStatus = "delivered";
    await order.save();
    console.log("✅ Order status updated to paid for tx_ref:", tx_ref);

    // Decrease inventory for each product in the order
    for (const item of order.products) {
      try {
        const product = await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: -item.quantity } },
          { new: true }
        );
        
        if (product) {
          console.log(`✅ Stock decreased for product ${item.product}: ${item.quantity} units. New stock: ${product.stock}`);
        } else {
          console.error(`❌ Product not found: ${item.product}`);
        }
      } catch (productError) {
        console.error(`❌ Error updating stock for product ${item.product}:`, productError.message);
      }
    }

    // Clear user's cart
    const user = await User.findById(order.user);
    if (user) {
      user.cartItems = [];
      await user.save();
      console.log("✅ User cart cleared for order:", tx_ref);
    }

    console.log("✅ Order confirmed and inventory updated for tx_ref:", tx_ref);
    return true;
  } catch (error) {
    console.error("❌ Error in confirmOrderAndUpdateStock:", error);
    return false;
  }
};

// INITIATE PAYMENT
export const initiatePayment = async (req, res) => {
  try {
    const { data } = req.body || {};
    const { totalAmount } = data || {};

    if (!totalAmount) {
      return res.status(400).json({ message: "Total amount is required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Populate cart items with product details
    await user.populate({
      path: "cartItems.product",
      select: "name price description image category stock",
    });

    if (!user.cartItems || user.cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Build order products array
    const orderProducts = user.cartItems
      .filter((item) => item.product) // Filter out any null products
      .map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      }));

    // Calculate total amount
    const calculatedTotal = orderProducts.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Verify stock availability
    for (const item of user.cartItems) {
      if (!item.product) continue;
      if (item.product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${item.product.name}. Available: ${item.product.stock}, Requested: ${item.quantity}` 
        });
      }
    }

    const email = user.email || "test@chapa.co";
    const firstName = user.name?.split(" ")[0] || "Test";
    const lastName = user.name?.split(" ").slice(1).join(" ") || "User";

    const tx_ref = `tx-${Date.now()}-${user._id}`;

    // Create order BEFORE payment (pending status)
    const order = await Order.create({
      user: user._id,
      products: orderProducts,
      totalAmount: calculatedTotal,
      paymentRef: tx_ref,
      paymentStatus: "pending",
    });

    const response = await axios.post(
      "https://api.chapa.co/v1/transaction/initialize",
      {
        amount: totalAmount.toString(),
        currency: "ETB",
        email,
        first_name: firstName,
        last_name: lastName,
        tx_ref,
        return_url: `${process.env.BASE_URL || "http://localhost:5000"}/api/payment/redirect?tx_ref=${tx_ref}`,
        callback_url: `${process.env.BASE_URL || "http://localhost:5000"}/api/payment/verify`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_AUTH}`,
        },
      }
    );

    res.json({ checkoutUrl: response.data.data.checkout_url });
  } catch (error) {
    console.error("❌ Chapa error:", error.response?.data || error.message);
    res.status(500).json({ message: "Payment initiation failed" });
  }
};

// VERIFY PAYMENT - Route with tx_ref in path
export const verifyPayment = async (req, res) => {
  const { tx_ref } = req.params;

  try {
    console.log("REDIRECT VERIFY HIT (path param):", tx_ref);

    const response = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      chapaConfig
    );

    if (response.data.status === "success") {
      return res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:5173"}/purchase-success?tx_ref=${tx_ref}`
      );
    }

    res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/purchase-cancel`);
  } catch (error) {
    console.error("❌ VERIFY ERROR:", error.response?.data || error.message);
    res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/purchase-cancel`);
  }
};

// REDIRECT HANDLER - Handles Chapa's return_url redirect
export const paymentRedirect = async (req, res) => {
  try {
    // Try to get tx_ref from query params (we include it in return_url, Chapa might also append it)
    const tx_ref = req.query.tx_ref || req.query.transaction_id || req.query.ref;
    
    console.log("PAYMENT REDIRECT HIT - Full URL:", req.url);
    console.log("PAYMENT REDIRECT HIT - Query params:", JSON.stringify(req.query));
    console.log("Found tx_ref:", tx_ref);

    if (!tx_ref) {
      // If no tx_ref in query, this is a problem - redirect to cancel
      console.error("❌ No tx_ref found in redirect URL. Full request:", {
        url: req.url,
        query: req.query,
        headers: req.headers
      });
      return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/purchase-cancel?error=no_tx_ref`);
    }

    // Verify the transaction with Chapa
    try {
      console.log("Verifying transaction with Chapa:", tx_ref);
      const response = await axios.get(
        `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
        chapaConfig
      );

      console.log("Chapa verification response:", response.data.status);

      if (response.data.status === "success") {
        console.log("✅ Payment verified successfully, updating order and stock...");
        // Update order and decrease stock (backup in case callback doesn't fire)
        await confirmOrderAndUpdateStock(tx_ref);
        return res.redirect(
          `${process.env.FRONTEND_URL || "http://localhost:5173"}/purchase-success?tx_ref=${tx_ref}`
        );
      } else {
        console.log("❌ Payment verification failed, redirecting to cancel");
        return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/purchase-cancel?tx_ref=${tx_ref}&status=${response.data.status}`);
      }
    } catch (verifyError) {
      console.error("❌ Verification error:", verifyError.response?.data || verifyError.message);
      // If verification fails but we have tx_ref, still redirect to success
      // The callback will handle the actual payment confirmation
      console.log("⚠️ Verification failed, but redirecting to success page anyway (callback will confirm)");
      return res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:5173"}/purchase-success?tx_ref=${tx_ref}`
      );
    }
  } catch (error) {
    console.error("❌ REDIRECT ERROR:", error);
    res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/purchase-cancel?error=redirect_failed`);
  }
};


export const chapaCallback = async (req, res) => {
  try {
    const { tx_ref } = req.body;

    console.log("CALLBACK HIT:", tx_ref);

    if (!tx_ref) {
      return res.status(400).json({ message: "tx_ref missing" });
    }

    // Always verify server-to-server
    const response = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      chapaConfig
    );

    if (response.data.status === "success") {
      // Use helper function to confirm order and update stock
      await confirmOrderAndUpdateStock(tx_ref);
    }

    // Chapa expects 200 OK
    res.sendStatus(200);
  } catch (error) {
    console.error("❌ CALLBACK ERROR:", error.response?.data || error.message);
    res.sendStatus(500);
  }
};

// CHECKOUT SUCCESS - Verify order exists and clear cart if needed
export const checkoutSuccess = async (req, res) => {
  try {
    const { data } = req.body || {};
    const { tx_ref } = data || {};

    if (!tx_ref) {
      return res.status(400).json({ message: "Transaction reference is required" });
    }

    // Find order by transaction reference
    const order = await Order.findOne({ paymentRef: tx_ref });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // If user is authenticated, clear their cart (in case it wasn't cleared by callback)
    if (req.user && req.user._id) {
      const user = await User.findById(req.user._id);
      if (user && user.cartItems.length > 0) {
        // Only clear if this order belongs to the user
        if (order.user.toString() === user._id.toString()) {
          user.cartItems = [];
          await user.save();
        }
      }
    }

    res.json({ 
      message: "Order verified successfully", 
      orderId: order._id,
      paymentStatus: order.paymentStatus
    });
  } catch (error) {
    console.error("❌ CHECKOUT SUCCESS ERROR:", error);
    res.status(500).json({ message: "Failed to verify order", error: error.message });
  }
};
