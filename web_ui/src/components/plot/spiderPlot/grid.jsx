import * as d3 from "d3";
import { polarToCartesian } from "./polarToCartesian.js";

export const INNER_RADIUS = 40;
const GRID_NUMBER = 5;
const GRID_COLOR = "lightGrey";

export const SpiderGrid = ({ outerRadius, xScale, axisConfig }) => {
  const lineGenerator = d3.lineRadial();

  const allAxes = axisConfig.map((axis, i) => {
    const angle = xScale(axis.name);

    if (angle === undefined) return null;

    const path = lineGenerator([
      [angle, INNER_RADIUS],
      [angle, outerRadius],
    ]);

    const labelPosition = polarToCartesian(
      angle - Math.PI / 2,
      outerRadius + 10
    );

    return (
      <g key={i}>
        <path d={path} stroke={GRID_COLOR} strokeWidth={0.5} rx={1} />
        <text
          x={labelPosition.x}
          y={labelPosition.y}
          fontSize={12}
          fill={GRID_COLOR}
          textAnchor={labelPosition.x > 0 ? "start" : "end"}
          dominantBaseline="middle"
        >
          {axis.name}
        </text>
      </g>
    );
  });

  // Compute grid = concentric circles
  const allCircles = [...Array(GRID_NUMBER).keys()].map((position, i) => {
    const radius =
      INNER_RADIUS +
      (position * (outerRadius - INNER_RADIUS)) / (GRID_NUMBER - 1);
    return (
      <g key={i}>
        <circle cx={0} cy={0} r={radius} stroke={GRID_COLOR} fill="none" />
        <text
          x={0}
          y={-radius - 6}
          fontSize={10}
          fill={GRID_COLOR}
          textAnchor="end"
          dominantBaseline="middle"
        >
          {((axisConfig[0].max / (GRID_NUMBER - 1)) * position).toFixed(0)}
        </text>
      </g>
    );
  });

  return (
    <g>
      {allAxes}
      {allCircles}
    </g>
  );
};
