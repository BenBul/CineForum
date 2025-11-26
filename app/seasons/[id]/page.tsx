"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Modal from "../../components/Modal/Modal";
import { supabase } from "../../_lib/supabase";
import styles from "./seasonDetail.module.css";

interface Season {
  id: number;
  name: string;
  created_at: string;
  fk_series: number;
  fk_user: string;
}

interface Series {
  id: number;
  name: string;
}

interface Episode {
  id: number;
  name: string;
  image_url: string | null;
  fk_season: number;
  fk_user: string;
}

interface Comment {
  id: number;
  text: string | null;
  rating: number;
  fk_user: string;
  created_at: string;
  fk_season?: number | null;
}

export default function SeasonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [season, setSeason] = useState<Season | null>(null);
  const [series, setSeries] = useState<Series | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Modal states
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isEditReviewModalOpen, setIsEditReviewModalOpen] = useState(false);
  const [selectedCommentForEdit, setSelectedCommentForEdit] =
    useState<Comment | null>(null);

  // Form states
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchData();
  }, [id]);

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setIsLoggedIn(!!session);
    if (session) {
      setUserId(session.user.id);
      setUserRole(session.user.user_metadata?.role || "user");
    }
  };

  const fetchData = async () => {
    try {
      await Promise.all([fetchSeason(), fetchEpisodes(), fetchComments()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSeason = async () => {
    try {
      const response = await fetch(`/api/seasons/${id}`);
      if (!response.ok) return;
      const seasonData = await response.json();
      setSeason(seasonData);

      // Fetch series data
      const seriesResponse = await fetch(`/api/series/${seasonData.fk_series}`);
      if (seriesResponse.ok) {
        const seriesData = await seriesResponse.json();
        setSeries(seriesData);
      }
    } catch (err) {
      console.error("Error fetching season:", err);
    }
  };

  const fetchEpisodes = async () => {
    try {
      const response = await fetch(`/api/seasons/${id}/episodes`);
      if (!response.ok) return;
      const data = await response.json();
      setEpisodes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching episodes:", err);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?fk_season=${id}`);
      if (!response.ok) return;
      const data = await response.json();
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setError("You must be logged in");
        setSubmitting(false);
        return;
      }

      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          text: reviewText || null,
          rating: reviewRating,
          fk_season: Number(id),
        }),
      });

      if (response.ok) {
        setIsReviewModalOpen(false);
        setReviewText("");
        setReviewRating(5);
        fetchComments();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to add review");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommentForEdit) return;

    setError("");
    setSubmitting(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setError("You must be logged in");
        return;
      }

      const response = await fetch(
        `/api/comments/${selectedCommentForEdit.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            text: reviewText || null,
            rating: reviewRating,
          }),
        }
      );

      if (response.ok) {
        setIsEditReviewModalOpen(false);
        setSelectedCommentForEdit(null);
        setReviewText("");
        setReviewRating(5);
        fetchComments();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update review");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (commentId: number) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        fetchComments();
      }
    } catch (err) {
      console.error("Error deleting review:", err);
    }
  };

  const openEditReviewModal = (comment: Comment) => {
    setSelectedCommentForEdit(comment);
    setReviewText(comment.text || "");
    setReviewRating(comment.rating);
    setIsEditReviewModalOpen(true);
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className={styles.main}>
          <div className={styles.loading}>Loading...</div>
        </main>
        <Footer />
      </>
    );
  }

  if (!season) {
    return (
      <>
        <Header />
        <main className={styles.main}>
          <div className={styles.error}>Season not found</div>
        </main>
        <Footer />
      </>
    );
  }

  const averageRating =
    comments.length > 0
      ? comments.reduce((sum, c) => sum + c.rating, 0) / comments.length
      : 0;

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          {/* Breadcrumb navigation */}
          <div className={styles.breadcrumb}>
            <button onClick={() => router.push("/home")} className={styles.breadcrumbLink}>
              Home
            </button>
            <span className={styles.breadcrumbSeparator}>/</span>
            {series && (
              <>
                <button
                  onClick={() => router.push(`/series/${series.id}`)}
                  className={styles.breadcrumbLink}
                >
                  {series.name}
                </button>
                <span className={styles.breadcrumbSeparator}>/</span>
              </>
            )}
            <span className={styles.breadcrumbCurrent}>{season.name}</span>
          </div>

          {/* Season header */}
          <div className={styles.header}>
            <h1 className={styles.title}>{season.name}</h1>
            {series && (
              <p className={styles.subtitle}>from {series.name}</p>
            )}
            {comments.length > 0 && (
              <div className={styles.ratingDisplay}>
                <span className={styles.stars}>
                  {"★".repeat(Math.round(averageRating))}
                  {"☆".repeat(5 - Math.round(averageRating))}
                </span>
                <span className={styles.ratingText}>
                  {averageRating.toFixed(1)} ({comments.length} review
                  {comments.length !== 1 ? "s" : ""})
                </span>
              </div>
            )}
          </div>

          {/* Episodes section */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Episodes</h2>
            {episodes.length === 0 ? (
              <p className={styles.emptyMessage}>No episodes yet</p>
            ) : (
              <div className={styles.episodeGrid}>
                {episodes.map((episode) => (
                  <div
                    key={episode.id}
                    className={styles.episodeCard}
                    onClick={() => router.push(`/episodes/${episode.id}`)}
                  >
                    <h3 className={styles.episodeName}>{episode.name}</h3>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Reviews section */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Reviews</h2>
              {isLoggedIn && (
                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className={styles.addButton}
                >
                  Add Review
                </button>
              )}
            </div>
            {comments.length === 0 ? (
              <p className={styles.emptyMessage}>
                No reviews yet. Be the first to review this season!
              </p>
            ) : (
              <div className={styles.reviewsList}>
                {comments.map((comment) => (
                  <div key={comment.id} className={styles.reviewCard}>
                    <div className={styles.reviewHeader}>
                      <div className={styles.reviewRating}>
                        {"★".repeat(comment.rating)}
                        {"☆".repeat(5 - comment.rating)}
                      </div>
                      <div className={styles.reviewDate}>
                        {new Date(comment.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    {comment.text && (
                      <p className={styles.reviewText}>{comment.text}</p>
                    )}
                    {(userId === comment.fk_user || userRole === "admin") && (
                      <div className={styles.reviewActions}>
                        <button
                          onClick={() => openEditReviewModal(comment)}
                          className={styles.editButton}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteReview(comment.id)}
                          className={styles.deleteButton}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Add Review Modal */}
        <Modal
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setReviewText("");
            setReviewRating(5);
            setError("");
          }}
          title="Add Review"
        >
          <form onSubmit={handleAddReview} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Rating
                <div className={styles.ratingInput}>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setReviewRating(rating)}
                      className={styles.starButton}
                    >
                      <span
                        className={
                          rating <= reviewRating ? styles.starFilled : styles.starEmpty
                        }
                      >
                        ★
                      </span>
                    </button>
                  ))}
                </div>
              </label>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Review (optional)
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className={styles.textarea}
                  rows={4}
                  placeholder="Share your thoughts about this season..."
                />
              </label>
            </div>
            {error && <div className={styles.error}>{error}</div>}
            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={() => {
                  setIsReviewModalOpen(false);
                  setReviewText("");
                  setReviewRating(5);
                  setError("");
                }}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={styles.submitButton}
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </Modal>

        {/* Edit Review Modal */}
        <Modal
          isOpen={isEditReviewModalOpen}
          onClose={() => {
            setIsEditReviewModalOpen(false);
            setSelectedCommentForEdit(null);
            setReviewText("");
            setReviewRating(5);
            setError("");
          }}
          title="Edit Review"
        >
          <form onSubmit={handleEditReview} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Rating
                <div className={styles.ratingInput}>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setReviewRating(rating)}
                      className={styles.starButton}
                    >
                      <span
                        className={
                          rating <= reviewRating ? styles.starFilled : styles.starEmpty
                        }
                      >
                        ★
                      </span>
                    </button>
                  ))}
                </div>
              </label>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Review (optional)
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className={styles.textarea}
                  rows={4}
                  placeholder="Share your thoughts about this season..."
                />
              </label>
            </div>
            {error && <div className={styles.error}>{error}</div>}
            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={() => {
                  setIsEditReviewModalOpen(false);
                  setSelectedCommentForEdit(null);
                  setReviewText("");
                  setReviewRating(5);
                  setError("");
                }}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={styles.submitButton}
              >
                {submitting ? "Updating..." : "Update"}
              </button>
            </div>
          </form>
        </Modal>
      </main>
      <Footer />
    </>
  );
}
