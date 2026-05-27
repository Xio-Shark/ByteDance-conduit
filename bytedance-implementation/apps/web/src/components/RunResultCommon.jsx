import {
  CheckCircle2,
  FileDiff,
  TriangleAlert,
} from "lucide-react";

export function ErrorNotice({ message }) {
  return (
    <div className="notice error">
      <TriangleAlert />
      <span>{message}</span>
    </div>
  );
}

export function MissingEvidencePanel({ detail, title }) {
  return (
    <Panel title={title}>
      <div className="evidence-missing">
        <TriangleAlert />
        <span>{detail}</span>
      </div>
    </Panel>
  );
}

export function ConfirmButton({ onConfirm, target }) {
  return (
    <button className="confirm-button" onClick={() => onConfirm(target)}>
      <CheckCircle2 />
      <span>Record review: {target}</span>
    </button>
  );
}

export function Panel({ children, title }) {
  return (
    <article className="panel">
      <div className="panel-title">
        <FileDiff />
        <span>{title}</span>
      </div>
      {children}
    </article>
  );
}

export function List({ items }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
