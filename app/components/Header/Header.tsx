"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./Header.module.css";
import { supabase, signOut } from "../../_lib/supabase";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      if (session) {
        setUserEmail(session.user.email || "");
        setUserRole(session.user.user_metadata?.role || "user");
      }
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsLoggedIn(!!session);
        if (session) {
          setUserEmail(session.user.email || "");
          setUserRole(session.user.user_metadata?.role || "user");
        } else {
          setUserEmail("");
          setUserRole(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
    router.push("/auth");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/series" className={styles.logo} onClick={closeMenu}>
          <i className="fas fa-film"></i>
          <span>CineForum</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ""}`}>
          <Link
            href="/series"
            className={`${styles.navLink} ${
              isActive("/series") ? styles.active : ""
            }`}
            onClick={closeMenu}
          >
            <i className="fas fa-th-large"></i>
            <span>Series</span>
          </Link>

          {isLoggedIn && userRole === "admin" && (
            <Link
              href="/admin"
              className={`${styles.navLink} ${
                isActive("/admin") ? styles.active : ""
              }`}
              onClick={closeMenu}
            >
              <i className="fas fa-cog"></i>
              <span>Admin</span>
            </Link>
          )}

          <Link
            href="/api-docs"
            className={`${styles.navLink} ${
              isActive("/api-docs") ? styles.active : ""
            }`}
            onClick={closeMenu}
          >
            <i className="fas fa-book"></i>
            <span>API Docs</span>
          </Link>

          {isLoggedIn ? (
            <div className={styles.userMenu}>
              <span className={styles.userInfo}>
                <i className="fas fa-user-circle"></i>
                <span className={styles.userEmail}>{userEmail}</span>
                {userRole === "admin" && (
                  <span className="badge badge-primary">Admin</span>
                )}
              </span>
              <button
                onClick={handleSignOut}
                className={`btn btn-outline ${styles.signOutBtn}`}
              >
                <i className="fas fa-sign-out-alt"></i>
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <Link href="/auth" className="btn btn-primary" onClick={closeMenu}>
              <i className="fas fa-sign-in-alt"></i>
              <span>Sign In</span>
            </Link>
          )}
        </nav>

        {/* Mobile Hamburger Menu */}
        <button
          className={`${styles.hamburger} ${
            isMenuOpen ? styles.hamburgerOpen : ""
          }`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
}
