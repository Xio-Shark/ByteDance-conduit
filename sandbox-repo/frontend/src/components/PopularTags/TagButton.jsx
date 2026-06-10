import { useFeedContext } from "../../context/FeedContext";

function TagButton({ tagsList }) {
  const { changeTab } = useFeedContext();

  const handleClick = (e) => {
    changeTab(e, "tag");
  };

  return tagsList.slice(0, 50).map((name, index) => (
    <button
      className={`tag-pill tag-default${index < 5 ? " tag-top-five" : ""}`}
      key={name}
      onClick={handleClick}
    >
      {index < 5 ? <span className="tag-rank">Top {index + 1}</span> : null}
      {name}
    </button>
  ));
}

export default TagButton;
