"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          background:
            "linear-gradient(135deg, #f8fafc 0%, #eff6ff 50%, #eef2ff 100%)",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            maxWidth: "480px",
          }}
        >
          {/* Icon */}
          <div
            style={{
              margin: "0 auto 1.5rem",
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "#fee2e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="36"
              height="36"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#ef4444"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>

          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#111827",
              margin: "0 0 0.5rem",
            }}
          >
            Something went terribly wrong
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#6b7280",
              margin: "0 0 2rem",
              lineHeight: 1.6,
            }}
          >
            {error?.message ||
              "A critical error occurred. Please refresh the page or try again."}
          </p>

          <button
            onClick={reset}
            style={{
              padding: "0.625rem 1.5rem",
              borderRadius: "0.5rem",
              background: "#4f46e5",
              color: "white",
              border: "none",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
              marginRight: "0.75rem",
            }}
          >
            Try again
          </button>

          <a
            href="/"
            style={{
              padding: "0.625rem 1.5rem",
              borderRadius: "0.5rem",
              background: "transparent",
              color: "#4f46e5",
              border: "1px solid #4f46e5",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Go home
          </a>
        </div>
      </body>
    </html>
  );
}
