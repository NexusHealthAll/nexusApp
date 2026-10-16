interface GridLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** Top edge of the plot area (CartesianGrid's own `y`). */
  y?: number;
  stroke?: string;
}

/**
 * `<CartesianGrid horizontal={renderGridLineSkipTop} />` — draws every
 * horizontal gridline except the topmost one, so the chart has no top border.
 */
export function renderGridLineSkipTop({ x1, y1, x2, y2, y, stroke }: GridLineProps) {
  if (y !== undefined && y1 <= y + 0.5) return <g />;
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} />;
}
