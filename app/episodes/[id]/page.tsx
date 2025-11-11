"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Modal from "../../components/Modal/Modal";
import { supabase } from "../../_lib/supabase";
import styles from "./episodeDetail.module.css";

interface Episode {
  id: number;
  name: string;
  image_url: string | null;
  created_at: string;
  fk_season: number;
  fk_user: string;
}

interface Season {
  id: number;
  name: string;
  fk_series: number;
}

interface Series {
  id: number;
  name: string;
}

interface Comment {
  id: number;
  text: string | null;
  rating: number;
  fk_user: string;
  created_at: string;
  fk_episode?: number | null;
}

export default function EpisodeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [season, setSeason] = useState<Season | null>(null);
  const [series, setSeries] = useState<Series | null>(null);
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
      await Promise.all([fetchEpisode(), fetchComments()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEpisode = async () => {
    try {
      const response = await fetch(`/api/episodes/${id}`);
      if (!response.ok) return;
      const episodeData = await response.json();
      setEpisode(episodeData);

      // Fetch season data
      const seasonResponse = await fetch(
        `/api/seasons/${episodeData.fk_season}`
      );
      if (seasonResponse.ok) {
        const seasonData = await seasonResponse.json();
        setSeason(seasonData);

        // Fetch series data
        const seriesResponse = await fetch(
          `/api/series/${seasonData.fk_series}`
        );
        if (seriesResponse.ok) {
          const seriesData = await seriesResponse.json();
          setSeries(seriesData);
        }
      }
    } catch (err) {
      console.error("Error fetching episode:", err);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?fk_episode=${id}`);
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
          fk_episode: Number(id),
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
        setReviewText("");
        setReviewRating(5);
        setSelectedCommentForEdit(null);
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

    setSubmitting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setError("You must be logged in");
        return;
      }

      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        fetchComments();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to delete review");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const canEdit = (ownerId: string) => {
    if (!isLoggedIn) return false;
    return userRole === "admin" || userId === ownerId;
  };

  const averageRating =
    comments.length > 0
      ? comments.reduce((sum, c) => sum + c.rating, 0) / comments.length
      : 0;

  if (loading) {
    return (
      <div className="page-wrapper">
        <Header />
        <main className="main-content">
          <div className={styles.loading}>
            <div className="spinner"></div>
            <p>Loading episode...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!episode || !season || !series) {
    return (
      <div className="page-wrapper">
        <Header />
        <main className="main-content">
          <div className={styles.notFound}>
            <i className="fas fa-exclamation-triangle"></i>
            <h2>Episode Not Found</h2>
            <button
              onClick={() => router.push("/series")}
              className="btn btn-primary"
            >
              Back to Series
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Header />
      <main className="main-content">
        <div className="container">
          {/* Breadcrumb Navigation */}
          <nav className={styles.breadcrumb}>
            <button
              onClick={() => router.push("/series")}
              className={styles.breadcrumbLink}
            >
              <i className="fas fa-home"></i> Series
            </button>
            <span className={styles.breadcrumbSeparator}>/</span>
            <button
              onClick={() => router.push(`/series/${series.id}`)}
              className={styles.breadcrumbLink}
            >
              {series.name}
            </button>
            <span className={styles.breadcrumbSeparator}>/</span>
            <button
              onClick={() => router.push(`/series/${series.id}`)}
              className={styles.breadcrumbLink}
            >
              {season.name}
            </button>
            <span className={styles.breadcrumbSeparator}>/</span>
            <span className={styles.breadcrumbCurrent}>{episode.name}</span>
          </nav>

          {/* Episode Header */}
          <section className={styles.hero}>
            <div className={styles.heroImage}>
              <Image
                src={
                  episode.image_url ||
                  "https://images.unsplash.com/photo-1522869635100-ce306e08e8de?w=800&h=450&fit=crop"
                }
                alt={episode.name}
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className={styles.image}
                priority
              />
            </div>
            <div className={styles.heroContent}>
              <h1 className={styles.title}>{episode.name}</h1>
              <div className={styles.episodeInfo}>
                <span className={styles.seriesName}>{series.name}</span>
                <span className={styles.seasonName}>{season.name}</span>
              </div>
              {averageRating > 0 && (
                <div className={styles.rating}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i
                      key={star}
                      className={`fas fa-star ${
                        star <= Math.round(averageRating)
                          ? styles.starFilled
                          : styles.starEmpty
                      }`}
                    ></i>
                  ))}
                  <span className={styles.ratingText}>
                    {averageRating.toFixed(1)} ({comments.length}{" "}
                    {comments.length === 1 ? "review" : "reviews"})
                  </span>
                </div>
              )}
              {isLoggedIn && (
                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="btn btn-primary"
                >
                  <i className="fas fa-comment"></i> Write Review
                </button>
              )}
            </div>
          </section>

          {/* Reviews Section */}
          <section className={styles.reviews}>
            <h2 className={styles.sectionTitle}>
              <i className="fas fa-star"></i> Episode Reviews ({comments.length}
              )
            </h2>
            {comments.length === 0 ? (
              <div className={styles.empty}>
                <i className="fas fa-comment-slash"></i>
                <p>No reviews yet. Be the first to review this episode!</p>
              </div>
            ) : (
              <div className={styles.commentsList}>
                {comments.map((comment) => (
                  <div key={comment.id} className={styles.comment}>
                    <div className={styles.commentHeader}>
                      <div className={styles.commentRating}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i
                            key={star}
                            className={`fas fa-star ${
                              star <= comment.rating
                                ? styles.starFilled
                                : styles.starEmpty
                            }`}
                          ></i>
                        ))}
                      </div>
                      <span className={styles.commentDate}>
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                      {isLoggedIn && canEdit(comment.fk_user) && (
                        <div className={styles.commentActions}>
                          <button
                            onClick={() => {
                              setSelectedCommentForEdit(comment);
                              setReviewText(comment.text || "");
                              setReviewRating(comment.rating);
                              setIsEditReviewModalOpen(true);
                            }}
                            className="btn btn-outline"
                            title="Edit review"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteReview(comment.id)}
                            className="btn btn-danger"
                            title="Delete review"
                            disabled={submitting}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      )}
                    </div>
                    {comment.text && (
                      <p className={styles.commentText}>{comment.text}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />

      {/* Add Review Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setError("");
        }}
        title="Write Episode Review"
        size="md"
      >
        <form onSubmit={handleAddReview} className={styles.form}>
          <div className="form-group">
            <label className="form-label">Rating *</label>
            <div className={styles.ratingInput}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className={styles.starButton}
                >
                  <i
                    className={`fas fa-star ${
                      star <= reviewRating
                        ? styles.starFilled
                        : styles.starEmpty
                    }`}
                  ></i>
                </button>
              ))}
              <span className={styles.ratingValue}>{reviewRating} / 5</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reviewText" className="form-label">
              Review (optional)
            </label>
            <textarea
              id="reviewText"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="form-textarea"
              placeholder="Share your thoughts about this episode..."
              rows={5}
            />
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
              onClick={() => setIsReviewModalOpen(false)}
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
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Review Modal */}
      <Modal
        isOpen={isEditReviewModalOpen}
        onClose={() => {
          setIsEditReviewModalOpen(false);
          setError("");
          setSelectedCommentForEdit(null);
        }}
        title="Edit Episode Review"
        size="md"
      >
        <form onSubmit={handleEditReview} className={styles.form}>
          <div className="form-group">
            <label className="form-label">Rating *</label>
            <div className={styles.ratingInput}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className={styles.starButton}
                >
                  <i
                    className={`fas fa-star ${
                      star <= reviewRating
                        ? styles.starFilled
                        : styles.starEmpty
                    }`}
                  ></i>
                </button>
              ))}
              <span className={styles.ratingValue}>{reviewRating} / 5</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reviewText" className="form-label">
              Review (optional)
            </label>
            <textarea
              id="reviewText"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="form-textarea"
              placeholder="Share your thoughts about this episode..."
              rows={5}
            />
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
              onClick={() => {
                setIsEditReviewModalOpen(false);
                setSelectedCommentForEdit(null);
              }}
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
              {submitting ? "Updating..." : "Update Review"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
