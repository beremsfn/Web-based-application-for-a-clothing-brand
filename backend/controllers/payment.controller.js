import axios from "axios"
import Order from "../models/order.model.js"

const CHAPA_URL = process.env.CHAPA_URL
const CHAPA_AUTH = process.env.CHAPA_AUTH

const chapaConfig = {
  headers: {
    Authorization: `Bearer ${CHAPA_AUTH}`,
    "Content-Type": "application/json",
  },
}

// INITIATE PAYMENT
export const initiatePayment = async (req, res) => {
  try {
    const { totalAmount } = req.body;

    if (!totalAmount) {
      return res.status(400).json({ message: "Total amount is required" });
    }

    const email = req.user?.email || "test@chapa.co";
    const firstName = req.user?.firstName || "Test";
    const lastName = req.user?.lastName || "User";

    const tx_ref = `tx-${Date.now()}`;

    const response = await axios.post(
      "https://api.chapa.co/v1/transaction/initialize",
      {
        amount: totalAmount.toString(),
        currency: "ETB",
        email,
        first_name: firstName,
        last_name: lastName,
        tx_ref,
        callback_url: "http://localhost:5000/api/payment/verify",
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



// VERIFY PAYMENT
export const verifyPayment = async (req, res) => {
  const { tx_ref } = req.params;

  try {
    console.log("REDIRECT VERIFY HIT:", tx_ref);

    const response = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      chapaConfig
    );

    if (response.data.status === "success") {
      return res.redirect(
        `${process.env.FRONTEND_URL}/purchase-success`
      );
    }

    res.redirect(`${process.env.FRONTEND_URL}/purchase-cancel`);
  } catch (error) {
    console.error("❌ VERIFY ERROR:", error.response?.data || error.message);
    res.redirect(`${process.env.FRONTEND_URL}/purchase-cancel`);
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
      await Order.findOneAndUpdate(
        { paymentRef: tx_ref },
        { paymentStatus: "paid" }
      );
    }

    // Chapa expects 200 OK
    res.sendStatus(200);
  } catch (error) {
    console.error("❌ CALLBACK ERROR:", error.response?.data || error.message);
    res.sendStatus(500);
  }
};
