export const polarToCartesian = (angle, distance) => {
  const x = distance * Math.cos(angle);
  const y = distance * Math.sin(angle);
  return { x, y };
};
