import { useState } from "react";
import { answerClarification } from "../api.js";

export function ClarificationsPanel({
  runId,
  clarifications = [],
  pendingQuestions = [],
  history = [],
  onAnswered,
}) {
  const hasAny = clarifications.length > 0 || pendingQuestions.length > 0 || history.length > 0;
  if (!hasAny) return null;

  return (
    <div className="clarifications">
      <p className="muted">
        澄清轮次（{clarifications.length}） · 待回答（{pendingQuestions.length}） · 已回答（{history.length}）
      </p>

      {clarifications.length > 0 ? (
        <ol className="clarify-rounds">
          {clarifications.map((question, index) => (
            <li key={`${index}-${question}`}>
              <span className="clarify-round">第 {index + 1} 轮</span>
              <p>{typeof question === "string" ? question : (question?.question ?? "")}</p>
            </li>
          ))}
        </ol>
      ) : null}

      {history.length > 0 ? (
        <ol className="clarify-history">
          {history.map((entry) => (
            <li key={`${entry.runId}-${entry.questionId}-${entry.answeredAt}`}>
              <span className="clarify-round">已回答 · {entry.questionId}</span>
              <p className="answered">{entry.answer}</p>
              <span className="muted">{entry.answeredAt}</span>
            </li>
          ))}
        </ol>
      ) : null}

      {pendingQuestions.length > 0 ? (
        <ol className="clarify-pending">
          {pendingQuestions.map((question) => (
            <PendingQuestionItem
              key={question.id}
              runId={runId}
              question={question}
              onAnswered={onAnswered}
            />
          ))}
        </ol>
      ) : null}
    </div>
  );
}

function PendingQuestionItem({ runId, question, onAnswered }) {
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!runId) {
      setError("缺少 runId");
      return;
    }
    const trimmed = answer.trim();
    if (!trimmed) {
      setError("请先填写回答");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const entry = await answerClarification(runId, {
        questionId: question.id,
        question: questionText(question),
        answer: trimmed,
      });
      setAnswer("");
      if (typeof onAnswered === "function") {
        await onAnswered(entry);
      }
    } catch (err) {
      setError(err.message || "提交失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <li className="clarify-pending-item">
      <span className="clarify-round">待回答 · {question.id}</span>
      <p>{questionText(question)}</p>
      <form onSubmit={handleSubmit} className="clarify-answer-form">
        <textarea
          rows={2}
          placeholder="PM 答复..."
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          disabled={submitting}
        />
        <button type="submit" disabled={submitting}>
          {submitting ? "提交中..." : "提交回答"}
        </button>
        {error ? <p className="error" role="alert">{error}</p> : null}
      </form>
    </li>
  );
}

function questionText(question) {
  return String(question?.text ?? question?.question ?? "").trim();
}
