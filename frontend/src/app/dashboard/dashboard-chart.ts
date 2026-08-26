export const CHART_WIDTH = 700;
export const CHART_HEIGHT = 185;
export const CHART_TOP_PADDING = 24;
export const BAR_MIN_HEIGHT_PERCENT = 18;
export const BAR_MAX_HEIGHT_PERCENT = 100;
export const Y_AXIS_TICK_COUNT = 3;

export function buildLinePath(values: number[], max: number): string {
  if (values.length === 0) {
    return '';
  }

  return values
    .map((value, index) => {
      const x = values.length === 1 ? CHART_WIDTH / 2 : (index / (values.length - 1)) * CHART_WIDTH;
      const y = CHART_HEIGHT - (value / max) * (CHART_HEIGHT - CHART_TOP_PADDING);
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
}

export function buildAreaPath(values: number[], max: number): string {
  if (values.length === 0) {
    return '';
  }

  const line = buildLinePath(values, max);
  return `${line} L ${CHART_WIDTH},${CHART_HEIGHT} L 0,${CHART_HEIGHT} Z`;
}

export function toBarHeights(values: number[]): number[] {
  const max = Math.max(1, ...values);
  return values.map((value) =>
    Math.max(BAR_MIN_HEIGHT_PERCENT, Math.round((value / max) * BAR_MAX_HEIGHT_PERCENT)),
  );
}

export function buildYAxisTicks(max: number): number[] {
  return [max, Math.ceil((max * 2) / Y_AXIS_TICK_COUNT), Math.ceil(max / Y_AXIS_TICK_COUNT), 0];
}
