// MetricsChart.jsx
// Before/after readability chart — ported from v1.0 panel.js drawChart() + showMetricsGrid()
// Fix #22: Flesch score legend added below chart.
// Fix #21: wrapped in React.memo to avoid re-renders when metrics unchanged.

import { memo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Flesch score interpretation (shown as legend below chart)
const FLESCH_LEGEND = [
  { range: '90–100', label: 'Very easy (Grade 5)' },
  { range: '70–90',  label: 'Easy (Grade 6–7)' },
  { range: '60–70',  label: 'Standard (Grade 8–9)' },
  { range: '30–60',  label: 'Difficult (College)' },
  { range: '0–30',   label: 'Very difficult (Academic)' },
];

const MetricsChart = memo(function MetricsChart({ before, after }) {
  if (!before || !after) return null;

  const data = {
    labels: ['Readability', 'Sentence Len', 'Difficult %', 'Read Time (min)'],
    datasets: [
      {
        label: 'Before',
        data: [before.readabilityScore, before.avgSentenceLength, before.difficultWordPct, before.readingTime],
        backgroundColor: 'rgba(211, 47, 47, 0.5)',
        borderColor: 'rgba(211, 47, 47, 0.9)',
        borderWidth: 1,
        borderRadius: 3,
      },
      {
        label: 'After',
        data: [after.readabilityScore, after.avgSentenceLength, after.difficultWordPct, after.readingTime],
        backgroundColor: 'rgba(46, 125, 50, 0.6)',
        borderColor: 'rgba(46, 125, 50, 1)',
        borderWidth: 1,
        borderRadius: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { size: 11 }, boxWidth: 12 } },
      tooltip: {
        callbacks: {
          afterLabel: (ctx) => {
            if (ctx.dataIndex === 0) {
              const score = ctx.raw;
              if (score >= 90) return 'Very easy reading';
              if (score >= 70) return 'Easy reading';
              if (score >= 60) return 'Standard reading';
              if (score >= 30) return 'Difficult reading';
              return 'Very difficult reading';
            }
            return '';
          }
        }
      }
    },
    scales: {
      y: { beginAtZero: true, ticks: { font: { size: 10 } } },
      x: { ticks: { font: { size: 10 } } },
    },
  };

  const metrics = [
    { label: 'Readability Score',   b: before.readabilityScore,  a: after.readabilityScore,  higherBetter: true  },
    { label: 'Avg Sentence Length', b: before.avgSentenceLength, a: after.avgSentenceLength, higherBetter: false },
    { label: 'Difficult Words %',   b: before.difficultWordPct,  a: after.difficultWordPct,  higherBetter: false },
    { label: 'Reading Time (min)',  b: before.readingTime,       a: after.readingTime,       higherBetter: false, neutral: true },
  ];

  return (
    <div style={{ animation: 'slideIn 0.25s ease both' }}>

      {/* Section label */}
      <div style={{
        fontSize: 10,
        fontWeight: 700,
        color: '#6E6E73',
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        marginBottom: 10,
        fontFamily: 'system-ui, sans-serif',
      }}>
        Readability Improvement
      </div>

      {/* Bar chart */}
      <div style={{ position: 'relative', width: '100%', height: 180, marginBottom: 12 }}>
        <Bar data={data} options={options} />
      </div>

      {/* Metrics grid (2 columns) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        {metrics.map(m => {
          const improved = m.higherBetter ? m.a > m.b : m.a < m.b;
          const isNeutral = m.neutral === true;
          const same = m.a === m.b;
          return (
            <div key={m.label} style={{
              background: '#FFFFFF',
              border: '1px solid #E8E6E1',
              borderRadius: 8,
              padding: '8px 10px',
            }}>
              <div style={{ fontSize: 10, color: '#6E6E73', marginBottom: 4, fontWeight: 600, letterSpacing: '0.04em', fontFamily: 'system-ui, sans-serif' }}>
                {m.label}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontFamily: 'system-ui, sans-serif' }}>
                <span style={{ color: '#6E6E73', fontWeight: 600 }}>{m.b}</span>
                <span style={{ color: same ? '#6E6E73' : improved ? '#10b981' : '#ef4444', fontSize: 10 }}>→</span>
                <span style={{ color: same ? '#6E6E73' : improved ? '#10b981' : '#ef4444', fontWeight: 700 }}>{m.a}</span>
                {!same && (
                  <span style={{ fontSize: 10, color: improved ? '#10b981' : '#ef4444' }}>
                    {improved ? '↑' : '↓'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Flesch score legend */}
      <details style={{ fontSize: 11, color: '#6E6E73', fontFamily: 'system-ui, sans-serif' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#6E6E73', userSelect: 'none' }}>
          What does the Readability Score mean?
        </summary>
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {FLESCH_LEGEND.map(l => (
            <div key={l.range} style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontWeight: 600, minWidth: 60 }}>{l.range}</span>
              <span>{l.label}</span>
            </div>
          ))}
          <p style={{ marginTop: 6, color: '#a88f6b' }}>Higher = easier to read. Target: 60+ for dyslexia-friendly text.</p>
        </div>
      </details>

    </div>
  );
});

export default MetricsChart;
