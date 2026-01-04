// src/components/GoogleSignIn.tsx
import { useEffect } from "react";
import axios from "axios";

const API_BASE =
  (import.meta.env.VITE_API_BASE as string) || "http://localhost:5000";

type Props = {
  onSuccess?: (data: any) => void;
  onError?: (err: any) => void;
  endpoint?: string; // full endpoint or relative (default '/api/auth/google')
};

declare global {
  interface Window {
    google?: any;
  }
}

export default function GoogleSignIn({
  onSuccess,
  onError,
  endpoint = "/api/auth/google",
}: Props) {
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || null;
    if (!clientId) {
      console.warn("VITE_GOOGLE_CLIENT_ID not set (check frontend/.env)");
      return;
    }

    // normalize endpoint to full URL
    const fullEndpoint = endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    function initButton() {
      if (!window.google?.accounts?.id) {
        console.warn("Google Identity Services not available yet");
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          try {
            const id_token = response.credential;
            // If this is a linking endpoint (contains '/link'), attach Authorization header
            const isLinkEndpoint = String(fullEndpoint).includes("/link");
            const token = localStorage.getItem("token");
            const headers: Record<string, string> =
              isLinkEndpoint && token
                ? { Authorization: `Bearer ${token}` }
                : {};

            const res = await axios.post(
              fullEndpoint,
              { id_token },
              headers && Object.keys(headers).length ? { headers } : {}
            );

            // if backend returned token (login flow), save it
            if (res?.data?.token) {
              try {
                localStorage.setItem("token", res.data.token);
              } catch (e) {}
            }

            if (onSuccess) onSuccess(res.data);
          } catch (err) {
            console.error("Google signin backend verify failed", err);
            if (onError) onError(err);
          }
        },
        ux_mode: "popup",
      });

      const btn = document.getElementById("google-signin-button");
      if (btn) {
        window.google.accounts.id.renderButton(btn, {
          theme: "outline",
          size: "large",
          text: "signin_with",
        });
      }
    }

    const existing = document.getElementById("gis-script");
    if (!existing) {
      const script = document.createElement("script");
      script.id = "gis-script";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initButton;
      document.body.appendChild(script);
      return () => {
        try {
          document.body.removeChild(script);
        } catch (e) {}
      };
    } else {
      initButton();
      return;
    }
  }, [endpoint, onError, onSuccess]);

  return <div id="google-signin-button" style={{ display: "inline-block" }} />;
}
