import Order from "../models/order.model.js";

export const getUserOrders = async (req, res) => {
	try {
		const orders = await Order.find({ user: req.user._id })
			.populate({
				path: "products.product",
				select: "name price image",
			})
			.sort({ createdAt: -1 });

		res.json(orders);
	} catch (error) {
		console.log("Error in getUserOrders controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getAllOrders = async (req, res) => {
	try {
		if (req.user.role !== "admin") {
			return res.status(403).json({ message: "Access denied" });
		}

		const orders = await Order.find({})
			.populate({
				path: "user",
				select: "name email",
			})
			.populate({
				path: "products.product",
				select: "name price image",
			})
			.sort({ createdAt: -1 });

		res.json(orders);
	} catch (error) {
		console.log("Error in getAllOrders controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const cancelOrder = async (req, res) => {
	try {
		const { data } = req.body || {};
		const { orderId } = data || {};

		if (!orderId) {
			return res.status(400).json({ message: "Order ID is required" });
		}

		const order = await Order.findOne({ _id: orderId, user: req.user._id });

		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}

		if (order.orderStatus !== "pending") {
			return res.status(400).json({ message: "Only pending orders can be canceled" });
		}

		order.orderStatus = "canceled";
		await order.save();

		res.json({ message: "Order canceled successfully" });
	} catch (error) {
		console.log("Error in cancelOrder controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};