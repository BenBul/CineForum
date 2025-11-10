"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp, signIn } from "../_lib/supabase";
import styles from "./auth.module.css";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          console.error("❌ Login failed:", error);
          setError(error.message);
          return;
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          console.error("❌ Registration failed:", error);
          setError(error.message);
          return;
        }
        setError("Check your email for confirmation link");
        return;
      }

      router.push("/home");
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("💥 Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>{isLogin ? "Login" : "Register"}</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? "Loading..." : isLogin ? "Login" : "Register"}
          </button>
        </form>

        <div className={styles.toggle}>
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className={styles.toggleButton}
            >
              {isLogin ? "Register" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
