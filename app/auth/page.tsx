"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp, signIn } from "../_lib/supabase";
import styles from "./auth.module.css";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          console.error("❌ Login failed:", error);
          setError(error.message);
          return;
        }
        router.push("/series");
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          console.error("❌ Registration failed:", error);
          setError(error.message);
          return;
        }
        setSuccess("Check your email for confirmation link");
        return;
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("💥 Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.background}>
        <div className={styles.shape}></div>
        <div className={styles.shape}></div>
      </div>

      <div className={styles.container}>
        <Link href="/series" className={styles.logo}>
          <i className="fas fa-film"></i>
          <span>CineForum</span>
        </Link>

        <div className={styles.card}>
          <h1 className={styles.title}>
            <i
              className={`fas ${isLogin ? "fa-sign-in-alt" : "fa-user-plus"}`}
            ></i>
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className={styles.subtitle}>
            {isLogin
              ? "Sign in to rate and review your favorite TV series"
              : "Join our community of TV show enthusiasts"}
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <i className="fas fa-envelope"></i> Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <i className="fas fa-lock"></i> Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="form-input"
                minLength={6}
              />
            </div>

            {error && (
              <div className={styles.error}>
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            {success && (
              <div className={styles.success}>
                <i className="fas fa-check-circle"></i>
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? (
                <>
                  <div
                    className="spinner"
                    style={{ width: "20px", height: "20px" }}
                  ></div>
                  {isLogin ? "Signing in..." : "Creating account..."}
                </>
              ) : (
                <>
                  <i
                    className={`fas ${
                      isLogin ? "fa-sign-in-alt" : "fa-user-plus"
                    }`}
                  ></i>
                  {isLogin ? "Sign In" : "Sign Up"}
                </>
              )}
            </button>
          </form>

          <div className={styles.divider}>
            <span>OR</span>
          </div>

          <div className={styles.toggle}>
            <p>
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                  setSuccess("");
                }}
                className={styles.toggleButton}
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>

          <Link href="/series" className={styles.guestLink}>
            <i className="fas fa-eye"></i>
            Continue as Guest
          </Link>
        </div>
      </div>
    </div>
  );
}
