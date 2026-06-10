import { Link } from "react-router-dom";
import { useState } from "react";
import ArticleMeta from "../ArticleMeta";
import ArticleTags from "../ArticleTags";
import FavButton from "../FavButton";

const READING_COUNT_BASE = 128;
const READING_COUNT_RANGE = 872;

function getReadingCount(article) {
  const seed = article.slug ?? article.title;
  if (typeof seed !== "string" || seed.trim() === "") {
    throw new Error("Article slug or title is required to calculate reading count");
  }
  const total = [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return READING_COUNT_BASE + (total % READING_COUNT_RANGE);
}

function ArticlesPreview({ articles, loading, updateArticles }) {
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const handleFav = (article) => {
    const items = [...articles];

    const updatedArticles = items.map((item) =>
      item.slug === article.slug ? { ...item, ...article } : item,
    );

    updateArticles((prev) => ({ ...prev, articles: updatedArticles }));
  };

  const visibleArticles = showFavoritesOnly ? articles?.filter((article) => article.favorited) : articles;

  return articles?.length > 0 ? (
    <>
      <button
        className="favorite-filter-toggle"
        onClick={() => setShowFavoritesOnly((value) => !value)}
        type="button"
      >
        {showFavoritesOnly ? "Show all articles" : "Show favorites only"}
      </button>
      {visibleArticles.map((article) => {
      return (
        <div className="article-preview" key={article.slug}>
          <ArticleMeta author={article.author} createdAt={article.createdAt}>
            <FavButton
              favorited={article.favorited}
              favoritesCount={article.favoritesCount}
              handler={handleFav}
              right
              slug={article.slug}
            />
          </ArticleMeta>
          <Link
            to={`/article/${article.slug}`}
            state={article}
            className="preview-link"
          >
            <h1>{article.title}</h1>
          {article.coverImage ? (
            <img src={article.coverImage} alt={`${article.title} coverImage`} className="coverImage-thumb" />
          ) : null}
            <p>{article.description}</p>
            <span>Read more...</span>
            <span className="reading-count">
              <i className="ion-eye"></i> {getReadingCount(article)} reads
            </span>
            <ArticleTags tagList={article.tagList} />
          </Link>
        </div>
      );
      })}
    </>
  ) : loading ? (
    <div className="article-preview">Loading article...</div>
  ) : (
    <div className="article-preview">No articles available.</div>
  );
}

export default ArticlesPreview;
