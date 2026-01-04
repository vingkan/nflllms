/**
 * Fantasy Football Analytics - Workload News Article
 *
 * This script loads JSON data and renders tables and report cards
 * for the static article page.
 */

// ==========================================================================
// Configuration
// ==========================================================================

const ASSETS_PATH = "../assets";

// ==========================================================================
// Utility Functions
// ==========================================================================

/**
 * Format a decimal as a percentage string
 */
function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined) return "--";
  return (value * 100).toFixed(decimals) + "%";
}

/**
 * Format a number with commas
 */
function formatNumber(value) {
  if (value === null || value === undefined) return "--";
  return Math.round(value).toLocaleString();
}

/**
 * Calculate percentage of total
 */
function calcPercent(value, total) {
  if (!total) return 0;
  return (value / total) * 100;
}

/**
 * Get badge class for workload level
 */
function getBadgeClass(level) {
  const classes = {
    high: "badge--high",
    medium: "badge--medium",
    low: "badge--low",
    unknown: "badge--unknown",
  };
  return classes[level] || "badge--unknown";
}

/**
 * Capitalize first letter
 */
function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ==========================================================================
// Data Loading
// ==========================================================================

/**
 * Fetch JSON data from the assets folder
 */
async function fetchJSON(path) {
  try {
    const response = await fetch(`${ASSETS_PATH}/${path}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading ${path}:`, error);
    return null;
  }
}

// ==========================================================================
// Overall Results Table
// ==========================================================================

/**
 * Render the overall results table
 */
function renderOverallResultsTable(data) {
  const container = document.getElementById("overall-results-table");
  if (!container || !data || !data[0]) {
    if (container)
      container.innerHTML = '<p class="text-muted">Failed to load data.</p>';
    return;
  }

  const d = data[0];
  const totalExpected = d.expected_low + d.expected_medium + d.expected_high;
  const totalActual = d.actually_low + d.actually_medium + d.actually_high;

  const html = `
    <table class="data-table">
      <thead>
        <tr>
          <th></th>
          <th colspan="3" class="text-center">Workload Level</th>
        </tr>
        <tr>
          <th>Metric</th>
          <th class="text-right">Low</th>
          <th class="text-right">Medium</th>
          <th class="text-right">High</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Reported Expectations</td>
          <td class="text-right">${formatNumber(
            d.expected_low
          )} <span class="text-muted">(${calcPercent(
    d.expected_low,
    totalExpected
  ).toFixed(0)}%)</span></td>
          <td class="text-right">${formatNumber(
            d.expected_medium
          )} <span class="text-muted">(${calcPercent(
    d.expected_medium,
    totalExpected
  ).toFixed(0)}%)</span></td>
          <td class="text-right">${formatNumber(
            d.expected_high
          )} <span class="text-muted">(${calcPercent(
    d.expected_high,
    totalExpected
  ).toFixed(0)}%)</span></td>
        </tr>
        <tr>
          <td>Actual Workloads</td>
          <td class="text-right">${formatNumber(
            d.actually_low
          )} <span class="text-muted">(${calcPercent(
    d.actually_low,
    totalActual
  ).toFixed(0)}%)</span></td>
          <td class="text-right">${formatNumber(
            d.actually_medium
          )} <span class="text-muted">(${calcPercent(
    d.actually_medium,
    totalActual
  ).toFixed(0)}%)</span></td>
          <td class="text-right">${formatNumber(
            d.actually_high
          )} <span class="text-muted">(${calcPercent(
    d.actually_high,
    totalActual
  ).toFixed(0)}%)</span></td>
        </tr>
        <tr>
          <td>Precision</td>
          <td class="text-right"><strong>${formatPercent(
            d.overall_precision_low
          )}</strong></td>
          <td class="text-right"><strong>${formatPercent(
            d.overall_precision_medium
          )}</strong></td>
          <td class="text-right"><strong>${formatPercent(
            d.overall_precision_high
          )}</strong></td>
        </tr>
        <tr>
          <td>Recall</td>
          <td class="text-right"><strong>${formatPercent(
            d.overall_recall_low
          )}</strong></td>
          <td class="text-right"><strong>${formatPercent(
            d.overall_recall_medium
          )}</strong></td>
          <td class="text-right"><strong>${formatPercent(
            d.overall_recall_high
          )}</strong></td>
        </tr>
      </tbody>
    </table>
  `;

  container.innerHTML = html;
}

// ==========================================================================
// By Reason Table
// ==========================================================================

/**
 * Render the results by reason table
 */
function renderByReasonTable(data) {
  const container = document.getElementById("by-reason-table");
  if (!container || !data) {
    if (container)
      container.innerHTML = '<p class="text-muted">Failed to load data.</p>';
    return;
  }

  const totalReports = data.reduce((sum, d) => sum + d.reports, 0);

  const rows = data
    .map(
      (d) => `
    <tr>
      <td><strong>${capitalize(d.reason)}</strong></td>
      <td class="text-right">${formatNumber(
        d.reports
      )} <span class="text-muted">(${calcPercent(
        d.reports,
        totalReports
      ).toFixed(0)}%)</span></td>
      <td class="text-right">${formatPercent(d.precision_low)}</td>
      <td class="text-right">${formatPercent(d.precision_medium)}</td>
      <td class="text-right">${formatPercent(d.precision_high)}</td>
      <td class="text-right">${formatPercent(d.recall_low)}</td>
      <td class="text-right">${formatPercent(d.recall_medium)}</td>
      <td class="text-right">${formatPercent(d.recall_high)}</td>
    </tr>
  `
    )
    .join("");

  const html = `
    <table class="data-table">
      <thead>
        <tr>
          <th></th>
          <th></th>
          <th colspan="3" class="text-center">Precision</th>
          <th colspan="3" class="text-center">Recall</th>
        </tr>
        <tr>
          <th>Reason</th>
          <th class="text-right">Reports</th>
          <th class="text-right">Low</th>
          <th class="text-right">Med</th>
          <th class="text-right">High</th>
          <th class="text-right">Low</th>
          <th class="text-right">Med</th>
          <th class="text-right">High</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;

  container.innerHTML = html;
}

// ==========================================================================
// Confusion Matrix Component
// ==========================================================================

/**
 * Get color for confusion matrix cell based on value
 * Uses a viridis-inspired color scale
 */
function getMatrixCellColor(value, maxValue) {
  if (value === 0) {
    return { bg: "#0d0887", text: "#7c7c9c" };
  }

  const ratio = value / maxValue;

  // Viridis-inspired color stops
  const colors = [
    { pos: 0, r: 13, g: 8, b: 135 }, // Deep purple
    { pos: 0.25, r: 126, g: 3, b: 168 }, // Purple
    { pos: 0.5, r: 204, g: 71, b: 120 }, // Pink
    { pos: 0.75, r: 248, g: 149, b: 64 }, // Orange
    { pos: 1, r: 240, g: 249, b: 33 }, // Yellow
  ];

  // Find the two colors to interpolate between
  let lower = colors[0];
  let upper = colors[colors.length - 1];

  for (let i = 0; i < colors.length - 1; i++) {
    if (ratio >= colors[i].pos && ratio <= colors[i + 1].pos) {
      lower = colors[i];
      upper = colors[i + 1];
      break;
    }
  }

  // Interpolate
  const range = upper.pos - lower.pos;
  const t = range === 0 ? 0 : (ratio - lower.pos) / range;

  const r = Math.round(lower.r + (upper.r - lower.r) * t);
  const g = Math.round(lower.g + (upper.g - lower.g) * t);
  const b = Math.round(lower.b + (upper.b - lower.b) * t);

  // Determine text color based on luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const textColor = luminance > 0.5 ? "#1a1a2e" : "#e2e8f0";

  return { bg: `rgb(${r}, ${g}, ${b})`, text: textColor };
}

/**
 * Render the confusion matrix
 */
function renderConfusionMatrix(data) {
  const container = document.getElementById("confusion-matrix");
  if (!container || !data) {
    if (container)
      container.innerHTML = '<p class="text-muted">Failed to load data.</p>';
    return;
  }

  const { data: matrix, labels } = data;

  // Filter out the "unknown" row (index 3) since it's not a possible actual outcome
  const filteredMatrix = matrix.slice(0, 3);
  const rowLabels = labels.slice(0, 3);
  const colLabels = labels; // Keep all column labels including unknown

  // Find max value for color scaling
  const maxValue = Math.max(...filteredMatrix.flat());

  // Build rows
  const rows = filteredMatrix
    .map((row, rowIndex) => {
      const cells = row
        .map((value, colIndex) => {
          const colors = getMatrixCellColor(value, maxValue);
          return `<div class="confusion-matrix__cell" style="background-color: ${colors.bg}; color: ${colors.text};">${value}</div>`;
        })
        .join("");

      return `
      <div class="confusion-matrix__row">
        <div class="confusion-matrix__row-label">${capitalize(
          rowLabels[rowIndex]
        )}</div>
        <div class="confusion-matrix__cells">${cells}</div>
      </div>
    `;
    })
    .join("");

  // Build column labels
  const colLabelsHtml = colLabels
    .map(
      (label) =>
        `<div class="confusion-matrix__col-label">${capitalize(label)}</div>`
    )
    .join("");

  // Legend labels
  const legendMax = maxValue;
  const legendMid = Math.round(maxValue / 2);

  const html = `
    <div class="confusion-matrix">
      <div class="confusion-matrix__container">
        <div class="confusion-matrix__grid-wrapper">
          <div class="confusion-matrix__main">
            <div class="confusion-matrix__y-label">Actual Workload</div>
            <div class="confusion-matrix__grid-area">
              ${rows}
              <div class="confusion-matrix__col-labels">${colLabelsHtml}</div>
              <div class="confusion-matrix__x-label">Report Expectation</div>
            </div>
          </div>
        </div>
        <div class="confusion-matrix__legend">
          <div class="confusion-matrix__legend-bar"></div>
          <div class="confusion-matrix__legend-labels">
            <span>${legendMax}</span>
            <span>${legendMid}</span>
            <span>0</span>
          </div>
        </div>
      </div>
      <p class="confusion-matrix__caption">Classification of 2025 season fantasy news reports.</p>
    </div>
  `;

  container.innerHTML = html;
}

// ==========================================================================
// Report Card Component
// ==========================================================================

/**
 * Render a single report card
 */
function renderReportCard(data, container) {
  if (!data || !container) return;

  // Handle missing data with placeholders
  const rushingYards =
    data.rushing_yards !== undefined ? data.rushing_yards : "--";
  const receivingYards =
    data.receiving_yards !== undefined ? data.receiving_yards : "--";
  const receivingCatches =
    data.receiving_catches !== undefined ? data.receiving_catches : "--";

  // Calculate total TDs
  const totalTDs =
    (data.rushing_touchdowns || 0) + (data.receiving_touchdowns || 0);

  // Format PPR rank
  const pprRank = data.ppr_scoring_position_rank
    ? `#${data.ppr_scoring_position_rank}`
    : "--";

  const html = `
    <div class="report-card">
      <div class="report-card__header">
        <div class="report-card__team-badge">${data.team}</div>
        <div class="report-card__player-info">
          <div class="report-card__player-name">${data.player_name}</div>
          <div class="report-card__game-info">Week ${data.week} vs ${
    data.opp
  }</div>
        </div>
      </div>
      
      <div class="report-card__body">
        <h4 class="report-card__title">${data.title}</h4>
        <p class="report-card__description">${data.description}</p>
        <p class="report-card__source">Source: <a href="https://www.rotoballer.com" target="_blank" rel="noopener">RotoBaller</a></p>
      </div>
      
      <div class="report-card__comparison">
        <div class="report-card__prediction">
          <div class="report-card__section-label">Report Expectation</div>
          <div class="report-card__stat-row">
            <span class="report-card__stat-label">Workload</span>
            <span class="badge ${getBadgeClass(data.expect)}">${capitalize(
    data.expect
  )}</span>
          </div>
          <div class="report-card__stat-row">
            <span class="report-card__stat-label">Reason</span>
            <span class="report-card__stat-value">${capitalize(
              data.reason
            )}</span>
          </div>
        </div>
        
        <div class="report-card__outcome">
          <div class="report-card__section-label">Actual Outcome</div>
          <div class="report-card__stat-row">
            <span class="report-card__stat-label">Workload</span>
            <span class="badge ${getBadgeClass(data.actual)}">${capitalize(
    data.actual
  )}</span>
          </div>
          <div class="report-card__stat-row">
            <span class="report-card__stat-label">Touches</span>
            <span class="report-card__stat-value">${
              data.touches
            } <span class="text-muted">(${data.att} att, ${
    data.tgt
  } tgt)</span></span>
          </div>
          <div class="report-card__stat-row">
            <span class="report-card__stat-label">Rushing</span>
            <span class="report-card__stat-value">${rushingYards} yds <span class="text-muted">/ ${
    data.att
  } att</span></span>
          </div>
          <div class="report-card__stat-row">
            <span class="report-card__stat-label">Receiving</span>
            <span class="report-card__stat-value">${receivingYards} yds <span class="text-muted">/ ${receivingCatches} rec</span></span>
          </div>
          <div class="report-card__stat-row">
            <span class="report-card__stat-label">Touchdowns</span>
            <span class="report-card__stat-value">${totalTDs} <span class="text-muted">(${
    data.rushing_touchdowns
  } rush, ${data.receiving_touchdowns} rec)</span></span>
          </div>
          <div class="report-card__stat-row">
            <span class="report-card__stat-label">PPR Points</span>
            <span class="report-card__stat-value">${
              data.ppr_scoring_fantasy_points
            } pts <span class="text-muted">(${pprRank} RB)</span></span>
          </div>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

/**
 * Load and render all report cards on the page
 */
async function loadReportCards() {
  const containers = document.querySelectorAll(".report-card-container");

  const promises = Array.from(containers).map(async (container) => {
    const reportId = container.dataset.report;
    if (!reportId) return;

    const data = await fetchJSON(`reports/${reportId}.json`);
    if (data) {
      renderReportCard(data, container);
    } else {
      container.innerHTML = '<p class="text-muted">Failed to load report.</p>';
    }
  });

  await Promise.all(promises);
}

// ==========================================================================
// Initialization
// ==========================================================================

/**
 * Initialize the page
 */
async function init() {
  // Load data in parallel
  const [overallData, byReasonData, confusionMatrixData] = await Promise.all([
    fetchJSON("results/scores_overall.json"),
    fetchJSON("results/scores_by_reason.json"),
    fetchJSON("results/confusion_matrix_overall.json"),
    loadReportCards(), // This returns undefined, but runs in parallel
  ]);

  // Render components
  renderOverallResultsTable(overallData);
  renderByReasonTable(byReasonData);
  renderConfusionMatrix(confusionMatrixData);
}

// Run when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
