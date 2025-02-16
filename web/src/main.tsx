import ReactDOM from "react-dom/client";
import { App } from "./App.tsx";
import { Toaster } from "./components/ui/sonner.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";

import "./globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <>
    <AuthProvider>
      <App />
    </AuthProvider>
    <Toaster />
  </>
);
