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
		const { totalAmount } = req.body
		const user = req.user

		if (!totalAmount || totalAmount <= 0) {
			return res.status(400).json({ message: "Invalid amount" })
		}

		const tx_ref = `tx-${user._id}-${Date.now()}`

		const data = {
			amount: totalAmount.toString(),
			currency: "ETB",
			email: user.email,
			first_name: user.name || "Customer",
			last_name: "User",
			phone_number: "0912345678",
			tx_ref,
			callback_url: `${process.env.BASE_URL}/api/payment/verify/${tx_ref}`,
			return_url: `${process.env.FRONTEND_URL}/purchase-success`,
		}

		console.log("📤 Chapa payload:", data)

		const response = await axios.post(CHAPA_URL, data, chapaConfig)

		await Order.create({
			user: user._id,
			totalAmount,
			paymentStatus: "pending",
			paymentRef: tx_ref,
		})

		res.json({
			checkoutUrl: response.data.data.checkout_url,
		})
	} catch (error) {
		console.error("❌ Chapa error:", error.response?.data || error.message)
		res.status(500).json({
			message: "Payment initialization failed",
			error: error.response?.data,
		})
	}
}

// VERIFY PAYMENT
export const verifyPayment = async (req, res) => {
	const { tx_ref } = req.params

	try {
		const response = await axios.get(
			`https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
			chapaConfig
		)

		if (response.data.status === "success") {
			await Order.findOneAndUpdate(
				{ paymentRef: tx_ref },
				{ paymentStatus: "paid" }
			)

			return res.redirect(`${process.env.FRONTEND_URL}/purchase-success`)
		}

		res.redirect(`${process.env.FRONTEND_URL}/purchase-cancel`)
	} catch (error) {
		console.error("❌ Verify error:", error.response?.data || error.message)
		res.redirect(`${process.env.FRONTEND_URL}/purchase-cancel`)
	}
}
