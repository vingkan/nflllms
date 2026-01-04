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
  const percent = (value / total) * 100;
  // Always round down to the nearest integer to prevent
  // subtotals that add up to more than 100%.
  const flooredPercent = Math.floor(percent);
  return flooredPercent;
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
// Week Chart Component
// ==========================================================================

/**
 * Render the week-by-week precision/recall chart
 */
/**
 * Helper function to generate a single line chart SVG
 */
function generateChartSVG(data, metrics, title, chartId) {
  const chartHeight = 240;
  const chartWidth = 500;
  const padding = { top: 30, right: 20, bottom: 70, left: 50 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Create vertical gridlines (one per week)
  const verticalGridlines = data
    .map((d, i) => {
      const x = padding.left + (i / (data.length - 1)) * innerWidth;
      return `<line x1="${x}" y1="${padding.top}" x2="${x}" y2="${
        padding.top + innerHeight
      }" stroke="var(--color-border)" opacity="0.2"/>`;
    })
    .join("");

  // Create major horizontal gridlines (at y-axis labels)
  const majorHorizontalGridlines = [0, 0.25, 0.5, 0.75, 1]
    .map((v) => {
      const y = padding.top + (1 - v) * innerHeight;
      return `<line x1="${padding.left}" y1="${y}" x2="${
        padding.left + innerWidth
      }" y2="${y}" stroke="var(--color-border)" opacity="0.3"/>`;
    })
    .join("");

  // Create minor horizontal gridlines (between major ones)
  const minorHorizontalGridlines = [0.125, 0.375, 0.625, 0.875]
    .map((v) => {
      const y = padding.top + (1 - v) * innerHeight;
      return `<line x1="${padding.left}" y1="${y}" x2="${
        padding.left + innerWidth
      }" y2="${y}" stroke="var(--color-border)" stroke-dasharray="2,2" opacity="0.15"/>`;
    })
    .join("");

  // Create SVG paths for each metric
  const paths = metrics
    .map((metric) => {
      const points = data
        .map((d, i) => {
          const x = padding.left + (i / (data.length - 1)) * innerWidth;
          const y = padding.top + (1 - d[metric.key]) * innerHeight;
          return `${x},${y}`;
        })
        .join(" L ");

      return `<path d="M ${points}" fill="none" stroke="${metric.color}" stroke-width="2" class="chart__line" data-metric="${metric.key}"/>`;
    })
    .join("");

  // Create data point circles (hidden by default, shown on hover)
  const dataPoints = metrics
    .flatMap((metric) =>
      data.map((d, i) => {
        const x = padding.left + (i / (data.length - 1)) * innerWidth;
        const y = padding.top + (1 - d[metric.key]) * innerHeight;
        return `<circle class="chart__point" data-index="${i}" cx="${x}" cy="${y}" r="5" fill="${metric.color}" stroke="var(--color-bg-card)" stroke-width="2" opacity="0"/>`;
      })
    )
    .join("");

  // Create vertical guide line (hidden by default)
  const guideLine = `<line class="chart__guide" x1="${padding.left}" y1="${
    padding.top
  }" x2="${padding.left}" y2="${
    padding.top + innerHeight
  }" stroke="var(--color-text-secondary)" stroke-width="1" stroke-dasharray="4,4" opacity="0"/>`;

  // Create invisible hover zones for each week
  const zoneWidth = innerWidth / Math.max(data.length - 1, 1);
  const hoverZones = data
    .map((d, i) => {
      const x = padding.left + (i / (data.length - 1)) * innerWidth;
      const zoneX = i === 0 ? padding.left : x - zoneWidth / 2;
      const actualWidth =
        i === 0 || i === data.length - 1 ? zoneWidth / 2 : zoneWidth;
      return `<rect class="chart__hover-zone" data-index="${i}" x="${zoneX}" y="${padding.top}" width="${actualWidth}" height="${innerHeight}" fill="transparent"/>`;
    })
    .join("");

  // Create x-axis labels - one tick per week
  const xAxisY = padding.top + innerHeight + 15;
  const xLabels = data
    .map((d, i) => {
      const x = padding.left + (i / (data.length - 1)) * innerWidth;
      return `<text x="${x}" y="${xAxisY}" text-anchor="middle" class="chart__label">${d.week}</text>`;
    })
    .join("");

  // Create y-axis labels
  const yLabels = [0, 0.25, 0.5, 0.75, 1]
    .map((v) => {
      const y = padding.top + (1 - v) * innerHeight;
      return `<text x="${padding.left - 10}" y="${
        y + 4
      }" text-anchor="end" class="chart__label">${Math.round(v * 100)}%</text>`;
    })
    .join("");

  // Create axis lines
  const axisLines = `
    <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${
    padding.top + innerHeight
  }" stroke="var(--color-border)" opacity="0.5"/>
    <line x1="${padding.left}" y1="${padding.top + innerHeight}" x2="${
    padding.left + innerWidth
  }" y2="${
    padding.top + innerHeight
  }" stroke="var(--color-border)" opacity="0.5"/>
  `;

  // Create horizontal legend at bottom
  const legendY = chartHeight - 15;
  const legendItemWidth = 130;
  const legendStartX =
    padding.left + (innerWidth - metrics.length * legendItemWidth) / 2;
  const legend = metrics
    .map((metric, i) => {
      const x = legendStartX + i * legendItemWidth;
      return `<g transform="translate(${x}, ${legendY})">
        <line x1="0" y1="0" x2="20" y2="0" stroke="${metric.color}" stroke-width="2"/>
        <text x="25" y="4" class="chart__legend-label">${metric.label}</text>
      </g>`;
    })
    .join("");

  // Create title
  const titleElement = `<text x="${
    padding.left + innerWidth / 2
  }" y="16" text-anchor="middle" class="chart__title">${title}</text>`;

  // X-axis title with more space
  const xAxisTitle = `<text x="${padding.left + innerWidth / 2}" y="${
    xAxisY + 20
  }" text-anchor="middle" class="chart__axis-label">Week</text>`;

  return `
    <svg viewBox="0 0 ${chartWidth} ${chartHeight}" class="chart__svg" data-chart-id="${chartId}">
      ${titleElement}
      ${majorHorizontalGridlines}
      ${minorHorizontalGridlines}
      ${verticalGridlines}
      ${axisLines}
      ${yLabels}
      ${paths}
      ${dataPoints}
      ${guideLine}
      ${xLabels}
      ${xAxisTitle}
      ${legend}
      ${hoverZones}
    </svg>
  `;
}

function renderWeekChart(data) {
  const container = document.getElementById("week-chart");
  if (!container || !data) {
    if (container)
      container.innerHTML = '<p class="text-muted">Failed to load data.</p>';
    return;
  }

  // Consistent colors for workload levels
  const colors = {
    low: "#f43f5e", // red (matches --color-low)
    medium: "#f59e0b", // amber (matches --color-medium)
    high: "#10b981", // green (matches --color-high)
  };

  // Precision metrics - order: High, Medium, Low for legend
  const precisionMetrics = [
    { key: "precision_high", label: "High workload", color: colors.high },
    { key: "precision_medium", label: "Medium workload", color: colors.medium },
    { key: "precision_low", label: "Low workload", color: colors.low },
  ];

  // Recall metrics - order: High, Medium, Low for legend
  const recallMetrics = [
    { key: "recall_high", label: "High workload", color: colors.high },
    { key: "recall_medium", label: "Medium workload", color: colors.medium },
    { key: "recall_low", label: "Low workload", color: colors.low },
  ];

  const precisionChart = generateChartSVG(
    data,
    precisionMetrics,
    "Precision by Week",
    "precision"
  );
  const recallChart = generateChartSVG(
    data,
    recallMetrics,
    "Recall by Week",
    "recall"
  );

  const html = `
    <div class="week-charts">
      <div class="chart-container">
        <div class="chart chart--interactive" data-chart-type="precision">
          ${precisionChart}
          <div class="chart__tooltip" id="tooltip-precision"></div>
        </div>
      </div>
      <div class="chart-container">
        <div class="chart chart--interactive" data-chart-type="recall">
          ${recallChart}
          <div class="chart__tooltip" id="tooltip-recall"></div>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;

  // Store data for tooltip access
  window.__weekChartData = data;

  // Add event listeners for each chart
  setupChartHoverEvents("precision", precisionMetrics, data);
  setupChartHoverEvents("recall", recallMetrics, data);
}

/**
 * Setup hover event listeners for a chart
 */
function setupChartHoverEvents(chartType, metrics, data) {
  const chartContainer = document.querySelector(
    `.chart[data-chart-type="${chartType}"]`
  );
  const svg = chartContainer?.querySelector("svg");
  const tooltip = document.getElementById(`tooltip-${chartType}`);

  if (!svg || !tooltip) return;

  const chartWidth = 500;
  const padding = { top: 30, right: 20, bottom: 70, left: 50 };
  const innerWidth = chartWidth - padding.left - padding.right;

  // Handle mouse move over chart
  svg.addEventListener("mousemove", (e) => {
    const rect = svg.getBoundingClientRect();
    const scaleX = chartWidth / rect.width;
    const mouseX = (e.clientX - rect.left) * scaleX;

    // Find closest data point
    const relativeX = mouseX - padding.left;
    const dataIndex = Math.round((relativeX / innerWidth) * (data.length - 1));

    if (dataIndex < 0 || dataIndex >= data.length) {
      hideChartHover(svg, tooltip);
      return;
    }

    const weekData = data[dataIndex];
    const x = padding.left + (dataIndex / (data.length - 1)) * innerWidth;

    // Update guide line position
    const guideLine = svg.querySelector(".chart__guide");
    if (guideLine) {
      guideLine.setAttribute("x1", x);
      guideLine.setAttribute("x2", x);
      guideLine.setAttribute("opacity", "1");
    }

    // Highlight data points for this week
    svg.querySelectorAll(".chart__point").forEach((point) => {
      const pointIndex = parseInt(point.getAttribute("data-index"), 10);
      point.setAttribute("opacity", pointIndex === dataIndex ? "1" : "0");
    });

    // Get the metric values based on chart type
    const metricPrefix = chartType === "precision" ? "precision" : "recall";
    const highValue = weekData[`${metricPrefix}_high`];
    const medValue = weekData[`${metricPrefix}_medium`];
    const lowValue = weekData[`${metricPrefix}_low`];

    // Update tooltip content
    tooltip.innerHTML = `
      <div class="chart__tooltip-header">Week ${weekData.week}</div>
      <div class="chart__tooltip-row">
        <span class="chart__tooltip-label">Reports:</span>
        <span class="chart__tooltip-value">${weekData.reports}</span>
      </div>
      <div class="chart__tooltip-divider"></div>
      <div class="chart__tooltip-row">
        <span class="chart__tooltip-dot" style="background: #10b981"></span>
        <span class="chart__tooltip-label">High:</span>
        <span class="chart__tooltip-value">${(highValue * 100).toFixed(
          1
        )}%</span>
      </div>
      <div class="chart__tooltip-row">
        <span class="chart__tooltip-dot" style="background: #f59e0b"></span>
        <span class="chart__tooltip-label">Medium:</span>
        <span class="chart__tooltip-value">${(medValue * 100).toFixed(
          1
        )}%</span>
      </div>
      <div class="chart__tooltip-row">
        <span class="chart__tooltip-dot" style="background: #f43f5e"></span>
        <span class="chart__tooltip-label">Low:</span>
        <span class="chart__tooltip-value">${(lowValue * 100).toFixed(
          1
        )}%</span>
      </div>
    `;

    // Position tooltip
    const tooltipX = (x / chartWidth) * rect.width;
    const tooltipY = 40;

    // Adjust if tooltip would go off right edge
    const tooltipWidth = 140;
    const adjustedX =
      tooltipX + tooltipWidth > rect.width
        ? tooltipX - tooltipWidth - 10
        : tooltipX + 10;

    tooltip.style.left = `${adjustedX}px`;
    tooltip.style.top = `${tooltipY}px`;
    tooltip.classList.add("chart__tooltip--visible");
  });

  // Handle mouse leave
  svg.addEventListener("mouseleave", () => {
    hideChartHover(svg, tooltip);
  });
}

/**
 * Hide chart hover elements
 */
function hideChartHover(svg, tooltip) {
  const guideLine = svg.querySelector(".chart__guide");
  if (guideLine) {
    guideLine.setAttribute("opacity", "0");
  }

  svg.querySelectorAll(".chart__point").forEach((point) => {
    point.setAttribute("opacity", "0");
  });

  tooltip.classList.remove("chart__tooltip--visible");
}

// ==========================================================================
// Game Day Table Component
// ==========================================================================

/**
 * Render the game day vs week before comparison table
 */
function renderGameDayTable(data) {
  const container = document.getElementById("game-day-table");
  if (!container || !data) {
    if (container)
      container.innerHTML = '<p class="text-muted">Failed to load data.</p>';
    return;
  }

  const totalReports = data.reduce((sum, d) => sum + d.reports, 0);

  const getLabel = (published_same_day) =>
    published_same_day ? "Game Day" : "Week Before";

  const rows = data
    .map(
      (d) => `
    <tr>
      <td><strong>${getLabel(d.published_same_day)}</strong></td>
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
          <th>Report Date</th>
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
// All Reports Explorer
// ==========================================================================

// State for the reports explorer
const explorerState = {
  data: [],
  filteredData: [],
  sortColumn: "touches",
  sortDirection: "desc",
  currentPage: 1,
  rowsPerPage: 10,
  searchQuery: "",
};

// Workload level sort order
const workloadOrder = { high: 3, medium: 2, low: 1, unknown: 0 };

/**
 * Sort data based on current sort state
 */
function sortExplorerData() {
  const { sortColumn, sortDirection } = explorerState;

  explorerState.filteredData.sort((a, b) => {
    let aVal = a[sortColumn];
    let bVal = b[sortColumn];

    // Handle workload level columns
    if (sortColumn === "actual" || sortColumn === "expect") {
      aVal = workloadOrder[aVal] || 0;
      bVal = workloadOrder[bVal] || 0;
    }

    // Handle string columns
    if (typeof aVal === "string" && typeof bVal === "string") {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    // Handle null/undefined
    if (aVal == null) aVal = sortDirection === "asc" ? Infinity : -Infinity;
    if (bVal == null) bVal = sortDirection === "asc" ? Infinity : -Infinity;

    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });
}

/**
 * Filter data based on search query
 */
// NFL team codes for exact team filtering
const NFL_TEAM_CODES = [
  "ARI",
  "ATL",
  "BAL",
  "BUF",
  "CAR",
  "CHI",
  "CIN",
  "CLE",
  "DAL",
  "DEN",
  "DET",
  "GB",
  "HOU",
  "IND",
  "JAX",
  "KC",
  "LAC",
  "LAR",
  "LV",
  "MIA",
  "MIN",
  "NE",
  "NO",
  "NYG",
  "NYJ",
  "PHI",
  "PIT",
  "SEA",
  "SF",
  "TB",
  "TEN",
  "WAS",
];

function filterExplorerData() {
  const query = explorerState.searchQuery.trim();

  if (!query) {
    explorerState.filteredData = [...explorerState.data];
  } else {
    const upperQuery = query.toUpperCase();

    // Check if the search is an exact NFL team code
    if (NFL_TEAM_CODES.includes(upperQuery)) {
      // Filter only on team column
      explorerState.filteredData = explorerState.data.filter(
        (d) => d.team === upperQuery
      );
    } else {
      // Search by player name, team, opponent, and week
      const lowerQuery = query.toLowerCase();
      explorerState.filteredData = explorerState.data.filter((d) => {
        const searchFields = [
          d.player_name,
          d.team,
          d.opp,
          d.week !== null ? String(d.week) : "",
        ].map((f) => (f || "").toLowerCase());

        return searchFields.some((field) => field.includes(lowerQuery));
      });
    }
  }

  explorerState.currentPage = 1;
  sortExplorerData();
}

/**
 * Handle column header click for sorting
 */
function handleSort(column) {
  const { sortColumn, sortDirection } = explorerState;

  if (sortColumn === column) {
    // Cycle through: default -> opposite -> reset
    if (sortDirection === getDefaultDirection(column)) {
      explorerState.sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      // Reset to default
      explorerState.sortColumn = "touches";
      explorerState.sortDirection = "desc";
    }
  } else {
    explorerState.sortColumn = column;
    explorerState.sortDirection = getDefaultDirection(column);
  }

  sortExplorerData();
  renderReportsTable();
}

/**
 * Get default sort direction for a column
 */
function getDefaultDirection(column) {
  // Numeric and workload columns default to descending
  const descColumns = [
    "week",
    "att",
    "tgt",
    "touches",
    "ppr_scoring_fantasy_points",
    "actual",
    "expect",
  ];
  return descColumns.includes(column) ? "desc" : "asc";
}

/**
 * Render the reports explorer table
 */
function renderReportsTable() {
  const container = document.getElementById("reports-table");
  if (!container) return;

  const { filteredData, currentPage, rowsPerPage, sortColumn, sortDirection } =
    explorerState;

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const pageData = filteredData.slice(startIndex, endIndex);

  const getSortIcon = (column) => {
    if (sortColumn !== column) return '<span class="sort-icon">⇅</span>';
    return sortDirection === "asc"
      ? '<span class="sort-icon sort-icon--active">↑</span>'
      : '<span class="sort-icon sort-icon--active">↓</span>';
  };

  const columns = [
    { key: "player_name", label: "Player", align: "left" },
    { key: "team", label: "Team", align: "left" },
    { key: "opp", label: "Opp", align: "left" },
    { key: "week", label: "Week", align: "right" },
    { key: "att", label: "Att", align: "right" },
    { key: "tgt", label: "Tgt", align: "right" },
    { key: "touches", label: "Touches", align: "right" },
    { key: "ppr_scoring_fantasy_points", label: "PPR", align: "right" },
    { key: "actual", label: "Actual", align: "left" },
    { key: "expect", label: "Expected", align: "left" },
    { key: "reason", label: "Reason", align: "left" },
  ];

  const headerCells = columns
    .map(
      (col) =>
        `<th class="text-${col.align} sortable" data-column="${col.key}">${
          col.label
        } ${getSortIcon(col.key)}</th>`
    )
    .join("");

  const rows = pageData
    .map((d) => {
      return `
    <tr>
      <td class="text-left">${d.player_name || "--"}</td>
      <td class="text-left">${d.team || "--"}</td>
      <td class="text-left">${d.opp || "--"}</td>
      <td class="text-right">${d.week || "--"}</td>
      <td class="text-right">${d.att ?? "--"}</td>
      <td class="text-right">${d.tgt ?? "--"}</td>
      <td class="text-right">${d.touches ?? "--"}</td>
      <td class="text-right">${d.ppr_scoring_fantasy_points ?? "--"}</td>
      <td class="text-left"><span class="badge badge--sm ${getBadgeClass(
        d.actual
      )}">${capitalize(d.actual)}</span></td>
      <td class="text-left"><span class="badge badge--sm ${getBadgeClass(
        d.expect
      )}">${capitalize(d.expect)}</span></td>
      <td class="text-left">${capitalize(d.reason) || "--"}</td>
      <td class="text-left"><button class="btn btn--sm btn--ghost view-report-btn" data-report-id="${d.report_id}">View</button></td>
    </tr>
  `;
    })
    .join("");

  const html = `
    <table class="data-table data-table--explorer">
      <thead>
        <tr>
          ${headerCells}
          <th class="text-left">Report</th>
        </tr>
      </thead>
      <tbody>
        ${
          rows ||
          '<tr><td colspan="12" class="text-center text-muted">No reports found</td></tr>'
        }
      </tbody>
    </table>
  `;

  container.innerHTML = html;

  // Add sort listeners
  container.querySelectorAll(".sortable").forEach((th) => {
    th.addEventListener("click", () => handleSort(th.dataset.column));
  });

  // Add view report listeners
  container.querySelectorAll(".view-report-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const reportId = btn.dataset.reportId;
      openReportModal(reportId);
    });
  });

  // Render pagination
  renderPagination();
}

/**
 * Render pagination controls
 */
function renderPagination() {
  const container = document.getElementById("reports-pagination");
  if (!container) return;

  const { filteredData, currentPage, rowsPerPage } = explorerState;
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  if (totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  const startItem = (currentPage - 1) * rowsPerPage + 1;
  const endItem = Math.min(currentPage * rowsPerPage, filteredData.length);

  // Generate page options for dropdown
  const pageOptions = [];
  for (let i = 1; i <= totalPages; i++) {
    const selected = i === currentPage ? "selected" : "";
    pageOptions.push(
      `<option value="${i}" ${selected}>Page ${i} of ${totalPages}</option>`
    );
  }

  const html = `
    <div class="pagination__info">
      Showing ${startItem}-${endItem} of ${filteredData.length.toLocaleString()} reports
    </div>
    <div class="pagination__controls">
      <button class="pagination__btn pagination__btn--nav" id="pagination-prev" ${
        currentPage === 1 ? "disabled" : ""
      }>‹ Prev</button>
      <select class="pagination__select" id="pagination-select">
        ${pageOptions.join("")}
      </select>
      <button class="pagination__btn pagination__btn--nav" id="pagination-next" ${
        currentPage === totalPages ? "disabled" : ""
      }>Next ›</button>
    </div>
  `;

  container.innerHTML = html;

  // Add page change listeners
  const prevBtn = document.getElementById("pagination-prev");
  const nextBtn = document.getElementById("pagination-next");
  const selectEl = document.getElementById("pagination-select");

  prevBtn?.addEventListener("click", () => {
    if (currentPage > 1) {
      explorerState.currentPage = currentPage - 1;
      renderReportsTable();
    }
  });

  nextBtn?.addEventListener("click", () => {
    if (currentPage < totalPages) {
      explorerState.currentPage = currentPage + 1;
      renderReportsTable();
    }
  });

  selectEl?.addEventListener("change", (e) => {
    const page = parseInt(e.target.value, 10);
    if (page >= 1 && page <= totalPages) {
      explorerState.currentPage = page;
      renderReportsTable();
    }
  });
}

/**
 * Initialize the reports explorer
 */
async function initReportsExplorer() {
  const data = await fetchJSON("reports/all_reports.json");
  if (!data) {
    const container = document.getElementById("reports-table");
    if (container)
      container.innerHTML =
        '<p class="text-muted">Failed to load reports data.</p>';
    return;
  }

  explorerState.data = data;
  // Apply initial filter to exclude entries without game data
  filterExplorerData();
  renderReportsTable();

  // Set up search with debouncing
  const searchInput = document.getElementById("reports-search");
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        explorerState.searchQuery = e.target.value;
        filterExplorerData();
        renderReportsTable();
      }, 300);
    });
  }
}

// ==========================================================================
// Modal Component
// ==========================================================================

/**
 * Open the report modal with given data
 */
async function openReportModal(reportId) {
  const modal = document.getElementById("report-modal");
  const modalBody = document.getElementById("modal-report-card");

  if (!modal || !modalBody) return;

  // Show loading state
  modalBody.innerHTML = '<p class="text-muted">Loading report...</p>';
  modal.hidden = false;
  document.body.style.overflow = "hidden";

  // Fetch full report data on demand
  const reportData = await fetchJSON(`reports/${reportId}.json`);
  if (reportData) {
    renderReportCard(reportData, modalBody);
  } else {
    modalBody.innerHTML = '<p class="text-muted">Failed to load report.</p>';
  }
}

/**
 * Close the report modal
 */
function closeReportModal() {
  const modal = document.getElementById("report-modal");
  if (!modal) return;

  modal.hidden = true;
  document.body.style.overflow = "";
}

/**
 * Initialize modal event listeners
 */
function initModal() {
  const modal = document.getElementById("report-modal");
  if (!modal) return;

  // Close on backdrop click
  const backdrop = modal.querySelector(".modal__backdrop");
  if (backdrop) {
    backdrop.addEventListener("click", closeReportModal);
  }

  // Close on close button click
  const closeBtn = modal.querySelector(".modal__close");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeReportModal);
  }

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) {
      closeReportModal();
    }
  });
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
// Table of Contents
// ==========================================================================

/**
 * Initialize the table of contents sidebar with scroll spy
 */
function initTableOfContents() {
  const toc = document.getElementById("toc-list");
  const article = document.querySelector("article");

  if (!toc || !article) return;

  // Only include headings with data-toc-id attribute
  const headings = article.querySelectorAll("h2[data-toc-id], h3[data-toc-id]");
  if (headings.length === 0) return;

  // Build TOC items
  const tocItems = [];
  headings.forEach((heading) => {
    // Use the data-toc-id as the heading's ID
    const tocId = heading.dataset.tocId;
    heading.id = tocId;

    const li = document.createElement("li");
    li.className = `toc__item toc__item--${heading.tagName.toLowerCase()}`;
    li.dataset.targetId = tocId;

    const a = document.createElement("a");
    a.href = `#${tocId}`;
    a.textContent = heading.textContent;

    // Smooth scroll on click
    a.addEventListener("click", (e) => {
      e.preventDefault();
      heading.scrollIntoView({ behavior: "smooth", block: "start" });
      // Update URL hash without jumping
      history.pushState(null, "", `#${tocId}`);
    });

    li.appendChild(a);
    toc.appendChild(li);
    tocItems.push({ li, heading });
  });

  // Scroll spy with IntersectionObserver
  let currentActive = null;

  const observer = new IntersectionObserver(
    (entries) => {
      // Find the first heading that is intersecting
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const targetId = entry.target.id;
          const tocItem = tocItems.find((item) => item.heading.id === targetId);

          if (tocItem && currentActive !== tocItem.li) {
            // Remove active from previous
            if (currentActive) {
              currentActive.classList.remove("toc__item--active");
            }
            // Add active to current
            tocItem.li.classList.add("toc__item--active");
            currentActive = tocItem.li;
          }
        }
      });
    },
    {
      // Trigger when heading crosses into top 20% of viewport
      rootMargin: "-10% 0px -80% 0px",
      threshold: 0,
    }
  );

  headings.forEach((h) => observer.observe(h));

  // Set initial active state (first heading)
  if (tocItems.length > 0) {
    tocItems[0].li.classList.add("toc__item--active");
    currentActive = tocItems[0].li;
  }
}

// ==========================================================================
// Initialization
// ==========================================================================

/**
 * Initialize the page
 */
async function init() {
  // Initialize table of contents sidebar
  initTableOfContents();

  // Initialize modal event listeners
  initModal();

  // Load data in parallel
  const [
    overallData,
    byReasonData,
    confusionMatrixData,
    weekData,
    gameDayData,
  ] = await Promise.all([
    fetchJSON("results/scores_overall.json"),
    fetchJSON("results/scores_by_reason.json"),
    fetchJSON("results/confusion_matrix_overall.json"),
    fetchJSON("results/scores_by_week.json"),
    fetchJSON("results/scores_by_published_day.json"),
    loadReportCards(), // This returns undefined, but runs in parallel
  ]);

  // Render components
  renderOverallResultsTable(overallData);
  renderByReasonTable(byReasonData);
  renderConfusionMatrix(confusionMatrixData);
  renderWeekChart(weekData);
  renderGameDayTable(gameDayData);

  // Initialize the reports explorer (loads its own data)
  initReportsExplorer();
}

// Run when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
