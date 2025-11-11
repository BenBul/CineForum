"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import SeriesCard from "../components/SeriesCard/SeriesCard";
import Modal from "../components/Modal/Modal";
import { supabase } from "../_lib/supabase";
import styles from "./series.module.css";

interface Series {
  id: number;
  name: string;
  image_url: string | null;
  created_at: string;
  created_by: string;
}

export default function SeriesPage() {
  const [series, setSeries] = useState<Series[]>([]);
  const [filteredSeries, setFilteredSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSeriesName, setNewSeriesName] = useState("");
  const [newSeriesImage, setNewSeriesImage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchSeries();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSeries(series);
    } else {
      const filtered = series.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSeries(filtered);
    }
  }, [searchQuery, series]);

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setIsLoggedIn(!!session);
    if (session) {
      setUserRole(session.user.user_metadata?.role || "user");
    }
  };

  const fetchSeries = async () => {
    try {
      const response = await fetch("/api/series");
      if (response.ok) {
        const data = await response.json();
        setSeries(data);
        setFilteredSeries(data);
      }
    } catch (err) {
      console.error("Failed to fetch series:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setError("You must be logged in to create a series");
        setSubmitting(false);
        return;
      }

      const response = await fetch("/api/series", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          name: newSeriesName,
          image_url: newSeriesImage || null,
        }),
      });

      if (response.ok) {
        setIsModalOpen(false);
        setNewSeriesName("");
        setNewSeriesImage("");
        fetchSeries();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to create series");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Header />
      <main className="main-content">
        <div className="container">
          {/* Hero Section */}
          <section className={styles.hero}>
            <h1 className={styles.heroTitle}>
              <i className="fas fa-tv"></i> Discover TV Series
            </h1>
            <p className={styles.heroSubtitle}>
              Explore, rate, and discuss your favorite TV shows with the
              community
            </p>
          </section>

          {/* Search and Actions */}
          <section className={styles.actions}>
            <div className={styles.searchWrapper}>
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search series..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className={styles.clearButton}
                  aria-label="Clear search"
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>

            {isLoggedIn && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn btn-primary"
              >
                <i className="fas fa-plus"></i>
                Add Series
              </button>
            )}
          </section>

          {/* Series Grid */}
          {loading ? (
            <div className={styles.loading}>
              <div className="spinner"></div>
              <p>Loading series...</p>
            </div>
          ) : filteredSeries.length === 0 ? (
            <div className={styles.empty}>
              <i className="fas fa-film"></i>
              <h3>No series found</h3>
              <p>
                {searchQuery
                  ? "Try adjusting your search"
                  : "Be the first to add a series!"}
              </p>
            </div>
          ) : (
            <>
              <div className={styles.results}>
                <p>
                  Showing <strong>{filteredSeries.length}</strong>{" "}
                  {filteredSeries.length === 1 ? "series" : "series"}
                </p>
              </div>
              <div className={styles.grid}>
                {filteredSeries.map((s) => (
                  <SeriesCard
                    key={s.id}
                    id={s.id}
                    name={s.name}
                    image_url={s.image_url}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />

      {/* Create Series Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setError("");
          setNewSeriesName("");
          setNewSeriesImage("");
        }}
        title="Add New TV Series"
        size="md"
      >
        <form onSubmit={handleCreateSeries} className={styles.form}>
          <div className="form-group">
            <label htmlFor="seriesName" className="form-label">
              Series Name *
            </label>
            <input
              id="seriesName"
              type="text"
              value={newSeriesName}
              onChange={(e) => setNewSeriesName(e.target.value)}
              className="form-input"
              placeholder="Enter series name..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="seriesImage" className="form-label">
              Image URL (optional)
            </label>
            <input
              id="seriesImage"
              type="url"
              value={newSeriesImage}
              onChange={(e) => setNewSeriesImage(e.target.value)}
              className="form-input"
              placeholder="https://example.com/image.jpg"
            />
            <small className={styles.hint}>
              <i className="fas fa-info-circle"></i>
              Must be a valid HTTP/HTTPS URL
            </small>
          </div>

          {error && (
            <div className={styles.error}>
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-ghost"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div
                    className="spinner"
                    style={{ width: "20px", height: "20px" }}
                  ></div>
                  Creating...
                </>
              ) : (
                <>
                  <i className="fas fa-plus"></i>
                  Create Series
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
