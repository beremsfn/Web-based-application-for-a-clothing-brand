import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { BrowserRouter } from "react-router-dom";
import { FavoritesProvider } from "./context/FavoritesContext"; // ✅ ADD THIS

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<FavoritesProvider> {/* ✅ ADD THIS */}
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</FavoritesProvider>
	</StrictMode>
);
