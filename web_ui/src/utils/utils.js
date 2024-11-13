export const DEFAULT_MARGIN = { top: 30, right: 40, bottom: 50, left: 50 };

export const DEFAULT_COLOR = "#3c82f6";

export const boundsCalculator = (width, height, margin) => {
  const boundsWidth = width - margin.left - margin.right;
  const boundsHeight = height - margin.top - margin.bottom;
  return { boundsWidth, boundsHeight };
};
