import './ProgressBar.css';

function ProgressBar({ label, current, total }) {
  const percent = total > 0 ? (current / total) * 100 : 0;
  return (
    <div className="progress-bar-block">
      {label && <label className="progress-bar-label">{label}</label>}
      <div className="genre-progress-bar-outer">
        <div
          className="genre-progress-bar-inner"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="progress-bar-count">{current} / {total}</div>
    </div>
  );
}

export default ProgressBar;
