"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, signOut } from "../_lib/supabase";
import styles from "./home.module.css";

export default function HomePage() {
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const getToken = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          console.warn("⚠️ No valid session found, redirecting to /auth");
          router.push("/auth");
          return;
        }

        setEmail(session.user.email || "");
        setToken(session.access_token);
      } catch (err) {
        console.error("💥 Error fetching token:", err);
        setError("Failed to fetch token");
        router.push("/auth");
      } finally {
        setLoading(false);
      }
    };

    getToken();
  }, [router]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      setError("Failed to sign out");
      return;
    }
    router.push("/auth");
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingSpinner}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Welcome to CineForum</h1>
          <button onClick={handleSignOut} className={styles.signOutButton}>
            Sign Out
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <h2>User Information</h2>
            <p className={styles.info}>
              <strong>Email:</strong> {email}
            </p>
          </div>

          <div className={styles.section}>
            <h2>JWT Token</h2>
            <div className={styles.tokenContainer}>
              <code className={styles.token}>{token}</code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(token);
                  alert("Token copied to clipboard!");
                }}
                className={styles.copyButton}
              >
                Copy Token
              </button>
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}
        </div>
      </div>
    </div>
  );
}
