"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Modal from "../../components/Modal/Modal";
import { supabase } from "../../_lib/supabase";
import styles from "./seriesDetail.module.css";

interface Series {
  id: number;
  name: string;
  image_url: string | null;
  created_at: string;
  fk_user: string;
}

interface Season {
  id: number;
  name: string;
  fk_series: number;
  fk_user: string;
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
  fk_series?: number | null;
  fk_season?: number | null;
  fk_episode?: number | null;
}

export default function SeriesDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [series, setSeries] = useState<Series | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [episodes, setEpisodes] = useState<{ [key: number]: Episode[] }>({});
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Modal states
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isSeasonModalOpen, setIsSeasonModalOpen] = useState(false);
  const [isEpisodeModalOpen, setIsEpisodeModalOpen] = useState(false);
  const [isEditSeriesModalOpen, setIsEditSeriesModalOpen] = useState(false);
  const [isEditSeasonModalOpen, setIsEditSeasonModalOpen] = useState(false);
  const [isEditEpisodeModalOpen, setIsEditEpisodeModalOpen] = useState(false);
  const [selectedSeasonId, setSelectedSeasonId] = useState<number | null>(null);
  const [selectedSeasonForEdit, setSelectedSeasonForEdit] =
    useState<Season | null>(null);
  const [selectedEpisodeForEdit, setSelectedEpisodeForEdit] =
    useState<Episode | null>(null);

  // Form states
  const [commentText, setCommentText] = useState("");
  const [commentRating, setCommentRating] = useState(5);
  const [seasonName, setSeasonName] = useState("");
  const [episodeName, setEpisodeName] = useState("");
  const [episodeImage, setEpisodeImage] = useState("");
  const [seriesName, setSeriesName] = useState("");
  const [seriesImage, setSeriesImage] = useState("");
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

  const canEdit = (ownerId: string) => {
    if (!isLoggedIn) return false;
    return userRole === "admin" || userId === ownerId;
  };

  const fetchData = async () => {
    try {
      await Promise.all([fetchSeries(), fetchSeasons(), fetchComments()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSeries = async () => {
    const response = await fetch(`/api/series/${id}`);
    if (response.ok) {
      const data = await response.json();
      setSeries(data);
    }
  };

  const fetchSeasons = async () => {
    const response = await fetch(`/api/series/${id}/seasons`);
    if (response.ok) {
      const data = await response.json();
      setSeasons(data);
      data.forEach((season: Season) => fetchEpisodes(season.id));
    }
  };

  const fetchEpisodes = async (seasonId: number) => {
    const response = await fetch(`/api/seasons/${seasonId}/episodes`);
    if (response.ok) {
      const data = await response.json();
      setEpisodes((prev) => ({ ...prev, [seasonId]: data }));
    }
  };

  const fetchComments = async () => {
    const response = await fetch(`/api/comments?fk_series=${id}`);
    if (response.ok) {
      const data = await response.json();
      setComments(data);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
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
          fk_series: parseInt(id),
          text: commentText,
          rating: commentRating,
        }),
      });

      if (response.ok) {
        setIsCommentModalOpen(false);
        setCommentText("");
        setCommentRating(5);
        fetchComments();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to add comment");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddSeason = async (e: React.FormEvent) => {
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

      const response = await fetch("/api/seasons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          name: seasonName,
          fk_series: parseInt(id),
        }),
      });

      if (response.ok) {
        setIsSeasonModalOpen(false);
        setSeasonName("");
        fetchSeasons();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to add season");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session || !selectedSeasonId) {
        setError("You must be logged in");
        setSubmitting(false);
        return;
      }

      const response = await fetch("/api/episodes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          name: episodeName,
          fk_season: selectedSeasonId,
          image_url: episodeImage || null,
        }),
      });

      if (response.ok) {
        setIsEpisodeModalOpen(false);
        setEpisodeName("");
        setEpisodeImage("");
        setSelectedSeasonId(null);
        fetchEpisodes(selectedSeasonId);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to add episode");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!series) return;

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

      const response = await fetch(`/api/series/${series.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          name: seriesName || series.name,
          image_url: seriesImage || series.image_url,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        setSeries(updated);
        setIsEditSeriesModalOpen(false);
        setSeriesName("");
        setSeriesImage("");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update series");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSeries = async () => {
    if (!series) return;
    if (
      !confirm(
        "Are you sure you want to delete this series? This cannot be undone."
      )
    )
      return;

    setSubmitting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setError("You must be logged in");
        return;
      }

      const response = await fetch(`/api/series/${series.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        router.push("/series");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to delete series");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSeason = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeasonForEdit) return;

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

      const response = await fetch(`/api/seasons/${selectedSeasonForEdit.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          name: seasonName || selectedSeasonForEdit.name,
        }),
      });

      if (response.ok) {
        setIsEditSeasonModalOpen(false);
        setSeasonName("");
        setSelectedSeasonForEdit(null);
        fetchSeasons();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update season");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSeason = async (seasonId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this season and all its episodes?"
      )
    )
      return;

    setSubmitting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setError("You must be logged in");
        return;
      }

      const response = await fetch(`/api/seasons/${seasonId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        fetchSeasons();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to delete season");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEpisodeForEdit) return;

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
        `/api/episodes/${selectedEpisodeForEdit.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            name: episodeName || selectedEpisodeForEdit.name,
            image_url: episodeImage || selectedEpisodeForEdit.image_url,
          }),
        }
      );

      if (response.ok) {
        setIsEditEpisodeModalOpen(false);
        setEpisodeName("");
        setEpisodeImage("");
        setSelectedEpisodeForEdit(null);
        if (selectedEpisodeForEdit.fk_season) {
          fetchEpisodes(selectedEpisodeForEdit.fk_season);
        }
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update episode");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEpisode = async (episodeId: number, seasonId: number) => {
    if (!confirm("Are you sure you want to delete this episode?")) return;

    setSubmitting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setError("You must be logged in");
        return;
      }

      const response = await fetch(`/api/episodes/${episodeId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        fetchEpisodes(seasonId);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to delete episode");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
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
            <p>Loading series...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!series) {
    return (
      <div className="page-wrapper">
        <Header />
        <main className="main-content">
          <div className={styles.notFound}>
            <i className="fas fa-exclamation-triangle"></i>
            <h2>Series Not Found</h2>
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
          {/* Series Header */}
          <section className={styles.hero}>
            <div className={styles.heroImage}>
              <Image
                src={
                  series.image_url ||
                  "https://images.unsplash.com/photo-1574267432644-f61f7af7798f?w=800&h=1200&fit=crop"
                }
                alt={series.name}
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className={styles.image}
                priority
              />
            </div>
            <div className={styles.heroContent}>
              <h1 className={styles.title}>{series.name}</h1>
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
              <div className={styles.actions}>
                {isLoggedIn && (
                  <>
                    <button
                      onClick={() => setIsCommentModalOpen(true)}
                      className="btn btn-primary"
                    >
                      <i className="fas fa-comment"></i> Add Review
                    </button>
                    {canEdit(series.fk_user) && (
                      <>
                        <button
                          onClick={() => {
                            setSeriesName(series.name);
                            setSeriesImage(series.image_url || "");
                            setIsEditSeriesModalOpen(true);
                          }}
                          className="btn btn-outline"
                        >
                          <i className="fas fa-edit"></i> Edit Series
                        </button>
                        <button
                          onClick={handleDeleteSeries}
                          className="btn btn-danger"
                          disabled={submitting}
                        >
                          <i className="fas fa-trash"></i> Delete Series
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setIsSeasonModalOpen(true)}
                      className="btn btn-secondary"
                    >
                      <i className="fas fa-plus"></i> Add Season
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Seasons & Episodes */}
          <section className={styles.seasons}>
            <h2 className={styles.sectionTitle}>
              <i className="fas fa-list"></i> Seasons & Episodes
            </h2>
            {seasons.length === 0 ? (
              <div className={styles.empty}>
                <i className="fas fa-folder-open"></i>
                <p>No seasons yet. Be the first to add one!</p>
              </div>
            ) : (
              <div className={styles.seasonsList}>
                {seasons.map((season) => (
                  <div key={season.id} className={styles.season}>
                    <div className={styles.seasonHeader}>
                      <button
                        onClick={() => router.push(`/seasons/${season.id}`)}
                        className={styles.seasonNameButton}
                      >
                        <h3>{season.name}</h3>
                      </button>
                      <div className={styles.seasonActions}>
                        {isLoggedIn && (
                          <>
                            {canEdit(season.fk_user) && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedSeasonForEdit(season);
                                    setSeasonName(season.name);
                                    setIsEditSeasonModalOpen(true);
                                  }}
                                  className="btn btn-outline"
                                  title="Edit season"
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button
                                  onClick={() => handleDeleteSeason(season.id)}
                                  className="btn btn-danger"
                                  title="Delete season"
                                  disabled={submitting}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => {
                                setSelectedSeasonId(season.id);
                                setIsEpisodeModalOpen(true);
                              }}
                              className="btn btn-outline"
                            >
                              <i className="fas fa-plus"></i> Add Episode
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    {episodes[season.id] && episodes[season.id].length > 0 ? (
                      <div className={styles.episodes}>
                        {episodes[season.id].map((episode, index) => (
                          <div key={episode.id} className={styles.episode}>
                            <span className={styles.episodeNumber}>
                              {index + 1}
                            </span>
                            <button
                              onClick={() =>
                                router.push(`/episodes/${episode.id}`)
                              }
                              className={styles.episodeNameButton}
                            >
                              {episode.name}
                            </button>
                            {isLoggedIn && canEdit(episode.fk_user) && (
                              <div className={styles.episodeActions}>
                                <button
                                  onClick={() => {
                                    setSelectedEpisodeForEdit(episode);
                                    setEpisodeName(episode.name);
                                    setEpisodeImage(episode.image_url || "");
                                    setIsEditEpisodeModalOpen(true);
                                  }}
                                  className="btn btn-outline"
                                  title="Edit episode"
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteEpisode(episode.id, season.id)
                                  }
                                  className="btn btn-danger"
                                  title="Delete episode"
                                  disabled={submitting}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={styles.noEpisodes}>No episodes yet</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Comments */}
          <section className={styles.comments}>
            <h2 className={styles.sectionTitle}>
              <i className="fas fa-comments"></i> Reviews ({comments.length})
            </h2>
            {comments.length === 0 ? (
              <div className={styles.empty}>
                <i className="fas fa-comment-slash"></i>
                <p>No reviews yet. Be the first to review!</p>
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
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="btn btn-danger"
                          title="Delete review"
                          disabled={submitting}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
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

      {/* Add Comment Modal */}
      <Modal
        isOpen={isCommentModalOpen}
        onClose={() => {
          setIsCommentModalOpen(false);
          setError("");
        }}
        title="Add Your Review"
        size="md"
      >
        <form onSubmit={handleAddComment} className={styles.form}>
          <div className="form-group">
            <label className="form-label">Rating *</label>
            <div className={styles.ratingInput}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setCommentRating(star)}
                  className={styles.starButton}
                >
                  <i
                    className={`fas fa-star ${
                      star <= commentRating
                        ? styles.starFilled
                        : styles.starEmpty
                    }`}
                  ></i>
                </button>
              ))}
              <span className={styles.ratingValue}>{commentRating} / 5</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="commentText" className="form-label">
              Review (optional)
            </label>
            <textarea
              id="commentText"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="form-textarea"
              placeholder="Share your thoughts about this series..."
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
              onClick={() => setIsCommentModalOpen(false)}
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

      {/* Add Season Modal */}
      <Modal
        isOpen={isSeasonModalOpen}
        onClose={() => {
          setIsSeasonModalOpen(false);
          setError("");
        }}
        title="Add Season"
        size="sm"
      >
        <form onSubmit={handleAddSeason} className={styles.form}>
          <div className="form-group">
            <label htmlFor="seasonName" className="form-label">
              Season Name *
            </label>
            <input
              id="seasonName"
              type="text"
              value={seasonName}
              onChange={(e) => setSeasonName(e.target.value)}
              className="form-input"
              placeholder="e.g., Season 1"
              required
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
              onClick={() => setIsSeasonModalOpen(false)}
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
              {submitting ? "Adding..." : "Add Season"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Episode Modal */}
      <Modal
        isOpen={isEpisodeModalOpen}
        onClose={() => {
          setIsEpisodeModalOpen(false);
          setError("");
          setSelectedSeasonId(null);
        }}
        title="Add Episode"
        size="md"
      >
        <form onSubmit={handleAddEpisode} className={styles.form}>
          <div className="form-group">
            <label htmlFor="episodeName" className="form-label">
              Episode Name *
            </label>
            <input
              id="episodeName"
              type="text"
              value={episodeName}
              onChange={(e) => setEpisodeName(e.target.value)}
              className="form-input"
              placeholder="e.g., Pilot"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="episodeImage" className="form-label">
              Image URL (optional)
            </label>
            <input
              id="episodeImage"
              type="url"
              value={episodeImage}
              onChange={(e) => setEpisodeImage(e.target.value)}
              className="form-input"
              placeholder="https://example.com/image.jpg"
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
                setIsEpisodeModalOpen(false);
                setSelectedSeasonId(null);
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
              {submitting ? "Adding..." : "Add Episode"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Series Modal */}
      <Modal
        isOpen={isEditSeriesModalOpen}
        onClose={() => {
          setIsEditSeriesModalOpen(false);
          setError("");
          setSeriesName("");
          setSeriesImage("");
        }}
        title="Edit Series"
        size="md"
      >
        <form onSubmit={handleEditSeries} className={styles.form}>
          <div className="form-group">
            <label htmlFor="editSeriesName" className="form-label">
              Series Name *
            </label>
            <input
              id="editSeriesName"
              type="text"
              value={seriesName}
              onChange={(e) => setSeriesName(e.target.value)}
              className="form-input"
              placeholder="e.g., Breaking Bad"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="editSeriesImage" className="form-label">
              Image URL (optional)
            </label>
            <input
              id="editSeriesImage"
              type="url"
              value={seriesImage}
              onChange={(e) => setSeriesImage(e.target.value)}
              className="form-input"
              placeholder="https://example.com/image.jpg"
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
                setIsEditSeriesModalOpen(false);
                setSeriesName("");
                setSeriesImage("");
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
              {submitting ? "Updating..." : "Update Series"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Season Modal */}
      <Modal
        isOpen={isEditSeasonModalOpen}
        onClose={() => {
          setIsEditSeasonModalOpen(false);
          setError("");
          setSeasonName("");
          setSelectedSeasonForEdit(null);
        }}
        title="Edit Season"
        size="sm"
      >
        <form onSubmit={handleEditSeason} className={styles.form}>
          <div className="form-group">
            <label htmlFor="editSeasonName" className="form-label">
              Season Name *
            </label>
            <input
              id="editSeasonName"
              type="text"
              value={seasonName}
              onChange={(e) => setSeasonName(e.target.value)}
              className="form-input"
              placeholder="e.g., Season 1"
              required
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
                setIsEditSeasonModalOpen(false);
                setSeasonName("");
                setSelectedSeasonForEdit(null);
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
              {submitting ? "Updating..." : "Update Season"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Episode Modal */}
      <Modal
        isOpen={isEditEpisodeModalOpen}
        onClose={() => {
          setIsEditEpisodeModalOpen(false);
          setError("");
          setEpisodeName("");
          setEpisodeImage("");
          setSelectedEpisodeForEdit(null);
        }}
        title="Edit Episode"
        size="md"
      >
        <form onSubmit={handleEditEpisode} className={styles.form}>
          <div className="form-group">
            <label htmlFor="editEpisodeName" className="form-label">
              Episode Name *
            </label>
            <input
              id="editEpisodeName"
              type="text"
              value={episodeName}
              onChange={(e) => setEpisodeName(e.target.value)}
              className="form-input"
              placeholder="e.g., Pilot"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="editEpisodeImage" className="form-label">
              Image URL (optional)
            </label>
            <input
              id="editEpisodeImage"
              type="url"
              value={episodeImage}
              onChange={(e) => setEpisodeImage(e.target.value)}
              className="form-input"
              placeholder="https://example.com/image.jpg"
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
                setIsEditEpisodeModalOpen(false);
                setEpisodeName("");
                setEpisodeImage("");
                setSelectedEpisodeForEdit(null);
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
              {submitting ? "Updating..." : "Update Episode"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
