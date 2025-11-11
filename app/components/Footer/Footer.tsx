"use client";

import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* About Section */}
          <div className={styles.section}>
            <h3 className={styles.title}>
              <i className="fas fa-film"></i> CineForum
            </h3>
            <p className={styles.description}>
              Your ultimate platform for discovering, rating, and discussing TV
              series. Join our community and share your passion for great
              television!
            </p>
            <div className={styles.social}>
              <a href="#" className={styles.socialLink} aria-label="Facebook">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#" className={styles.socialLink} aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className={styles.socialLink} aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className={styles.socialLink} aria-label="GitHub">
                <i className="fab fa-github"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Quick Links</h4>
            <ul className={styles.links}>
              <li>
                <Link href="/series" className={styles.link}>
                  <i className="fas fa-chevron-right"></i> Browse Series
                </Link>
              </li>
              <li>
                <Link href="/api-docs" className={styles.link}>
                  <i className="fas fa-chevron-right"></i> API Documentation
                </Link>
              </li>
              <li>
                <Link href="/auth" className={styles.link}>
                  <i className="fas fa-chevron-right"></i> Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Features</h4>
            <ul className={styles.links}>
              <li className={styles.feature}>
                <i className="fas fa-star"></i> Rate & Review
              </li>
              <li className={styles.feature}>
                <i className="fas fa-comments"></i> Community Comments
              </li>
              <li className={styles.feature}>
                <i className="fas fa-search"></i> Discover New Series
              </li>
              <li className={styles.feature}>
                <i className="fas fa-shield-alt"></i> Role-Based Access
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Get In Touch</h4>
            <ul className={styles.contacts}>
              <li className={styles.contact}>
                <i className="fas fa-envelope"></i>
                <span>contact@cineforum.com</span>
              </li>
              <li className={styles.contact}>
                <i className="fas fa-map-marker-alt"></i>
                <span>Vilnius, Lithuania</span>
              </li>
              <li className={styles.contact}>
                <i className="fas fa-code"></i>
                <span>Built with Next.js & Supabase</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottom}>
          <div className={styles.bottomContent}>
            <p className={styles.copyright}>
              © {currentYear} CineForum. All rights reserved.
            </p>
            <div className={styles.bottomLinks}>
              <a href="#" className={styles.bottomLink}>
                Privacy Policy
              </a>
              <span className={styles.separator}>•</span>
              <a href="#" className={styles.bottomLink}>
                Terms of Service
              </a>
              <span className={styles.separator}>•</span>
              <a href="#" className={styles.bottomLink}>
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
