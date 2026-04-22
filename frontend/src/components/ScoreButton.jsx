// frontend/src/components/ScoreButton.jsx
// Drop this anywhere you display a candidacy in the recruiter dashboard.
//
// Usage:
//   <ScoreButton candidacyId={candidacy._id} existingScore={candidacy.sbertScore} />

import { useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Score → colour thresholds
function getScoreStyle(score) {
  if (score >= 75) return { color: '#16a34a', bg: '#dcfce7', label: 'Strong Match' };
  if (score >= 50) return { color: '#ca8a04', bg: '#fef9c3', label: 'Partial Match' };
  return { color: '#dc2626', bg: '#fee2e2', label: 'Weak Match' };
}

export default function ScoreButton({ candidacyId, existingScore = null, onScored }) {
  const [score, setScore] = useState(existingScore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleScore() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post(`${API_BASE}/api/score/${candidacyId}`);
      setScore(data.scorePercent);
      if (onScored) onScored(data.scorePercent);
    } catch (err) {
      const msg = err.response?.data?.error || 'Scoring failed. Is the SBERT service running?';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const style = score !== null ? getScoreStyle(score) : null;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontFamily: 'inherit' }}>
      {/* Score badge */}
      {score !== null && (
        <div
          style={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '4px 12px',
            borderRadius: '8px',
            background: style.bg,
            border: `1px solid ${style.color}22`,
            minWidth: '72px',
          }}
        >
          <span style={{ fontSize: '20px', fontWeight: 700, color: style.color, lineHeight: 1.2 }}>
            {score}%
          </span>
          <span style={{ fontSize: '10px', color: style.color, fontWeight: 500, letterSpacing: '0.03em' }}>
            {style.label}
          </span>
        </div>
      )}

      {/* Button */}
      <button
        onClick={handleScore}
        disabled={loading}
        title={score !== null ? 'Re-score with SBERT' : 'Score CV with SBERT'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '7px 14px',
          borderRadius: '7px',
          border: '1px solid #e2e8f0',
          background: loading ? '#f1f5f9' : '#ffffff',
          color: loading ? '#94a3b8' : '#334155',
          fontSize: '13px',
          fontWeight: 500,
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s ease',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.borderColor = '#6366f1'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
      >
        {loading ? (
          <>
            <SpinnerIcon />
            Scoring…
          </>
        ) : (
          <>
            <BrainIcon />
            {score !== null ? 'Re-score' : 'Score CV'}
          </>
        )}
      </button>

      {/* Error */}
      {error && (
        <span style={{ fontSize: '12px', color: '#dc2626', maxWidth: '200px' }}>
          ⚠ {error}
        </span>
      )}
    </div>
  );
}

// Minimal inline SVG icons — no extra dependencies needed
function BrainIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3Z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3Z"/>
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      style={{ animation: 'spin 0.8s linear infinite' }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  );
}