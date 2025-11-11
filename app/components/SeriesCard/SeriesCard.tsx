"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./SeriesCard.module.css";

interface SeriesCardProps {
  id: number;
  name: string;
  image_url: string | null;
  rating?: number;
  totalComments?: number;
}

export default function SeriesCard({
  id,
  name,
  image_url,
  rating,
  totalComments,
}: SeriesCardProps) {
  const placeholderImage =
    "https://images.unsplash.com/photo-1574267432644-f61f7af7798f?w=400&h=600&fit=crop";

  return (
    <Link href={`/series/${id}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        <Image
          src={image_url || placeholderImage}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={styles.image}
        />
        {rating !== undefined && rating > 0 && (
          <div className={styles.ratingBadge}>
            <i className="fas fa-star"></i>
            <span>{rating.toFixed(1)}</span>
          </div>
        )}
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{name}</h3>
        {totalComments !== undefined && (
          <div className={styles.stats}>
            <span className={styles.stat}>
              <i className="fas fa-comments"></i>
              {totalComments} {totalComments === 1 ? "comment" : "comments"}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
