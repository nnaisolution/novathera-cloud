import { useId, useState } from "react";
import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Line, Path, Stop } from "react-native-svg";

import { colors, radii, spacing, typography } from "../theme";

export type LineChartPoint = {
  /** Epoch milliseconds. */
  x: number;
  y: number;
};

type Props = {
  points: readonly LineChartPoint[];
  /** Required: a chart is meaningless to a screen reader without it. */
  accessibilityLabel: string;
  height?: number;
  color?: string;
  showGrid?: boolean;
  showValueLabels?: boolean;
  formatValue?: (value: number) => string;
  footerLeft?: string;
  footerRight?: string;
};

const GRID_LINES = 3;

type Bounds = { minY: number; maxY: number; minX: number; maxX: number };

function boundsOf(points: readonly LineChartPoint[]): Bounds {
  let minY = points[0]?.y ?? 0;
  let maxY = minY;
  let minX = points[0]?.x ?? 0;
  let maxX = minX;

  for (const point of points) {
    if (point.y < minY) minY = point.y;
    if (point.y > maxY) maxY = point.y;
    if (point.x < minX) minX = point.x;
    if (point.x > maxX) maxX = point.x;
  }

  // A flat series would collapse to a zero-height band and divide by zero, so
  // pad it into a readable strip centred on the value.
  if (maxY - minY < Number.EPSILON) {
    const pad = Math.abs(maxY) > Number.EPSILON ? Math.abs(maxY) * 0.1 : 1;
    minY -= pad;
    maxY += pad;
  }
  if (maxX - minX < Number.EPSILON) {
    minX -= 1;
    maxX += 1;
  }

  return { minY, maxY, minX, maxX };
}

/**
 * A small hand-rolled line chart. Deliberately not a charting library: the only
 * requirement is a value-over-time line, and pulling in a chart package for
 * that would add a dependency far larger than the feature.
 */
export function LineChart({
  points,
  accessibilityLabel,
  height = 160,
  color = colors.chartLine,
  showGrid = true,
  showValueLabels = true,
  formatValue = (value) => String(Math.round(value)),
  footerLeft,
  footerRight,
}: Props) {
  const [width, setWidth] = useState(0);
  // Gradient ids share a namespace, and two charts render side by side on the
  // dashboard. React's generated id contains colons, which are not valid in a
  // `url(#...)` reference.
  const gradientId = `line-fill-${useId().replace(/:/g, "")}`;

  function onLayout(event: LayoutChangeEvent) {
    setWidth(event.nativeEvent.layout.width);
  }

  const padTop = spacing.sm;
  const padBottom = spacing.sm;
  const padLeft = spacing.xs;
  // Last-point circle (r=7) plus room so axis labels don't sit on the stroke.
  const padRight = spacing.md + spacing.xs;
  const plotWidth = Math.max(width - padLeft - padRight, 1);
  const plotHeight = Math.max(height - padTop - padBottom, 1);

  const bounds = boundsOf(points);
  const spanY = bounds.maxY - bounds.minY;
  const spanX = bounds.maxX - bounds.minX;

  function toX(value: number): number {
    if (points.length === 1) return padLeft + plotWidth / 2;
    return padLeft + ((value - bounds.minX) / spanX) * plotWidth;
  }

  function toY(value: number): number {
    return padTop + plotHeight - ((value - bounds.minY) / spanY) * plotHeight;
  }

  const canRender = width > 0 && points.length > 0;
  const coords = canRender ? points.map((point) => ({ x: toX(point.x), y: toY(point.y) })) : [];

  const linePath = coords
    .map((coord, index) => `${index === 0 ? "M" : "L"}${coord.x.toFixed(2)} ${coord.y.toFixed(2)}`)
    .join(" ");

  const first = coords[0];
  const last = coords[coords.length - 1];
  const areaPath =
    first && last && coords.length > 1
      ? `${linePath} L${last.x.toFixed(2)} ${(padTop + plotHeight).toFixed(2)} L${first.x.toFixed(2)} ${(
          padTop + plotHeight
        ).toFixed(2)} Z`
      : null;

  return (
    <View accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel}>
      <View style={[styles.plot, { height }]} onLayout={onLayout}>
        {canRender ? (
          <Svg width={width} height={height}>
            <Defs>
              <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={color} stopOpacity="0.18" />
                <Stop offset="1" stopColor={color} stopOpacity="0.01" />
              </LinearGradient>
            </Defs>

            {showGrid
              ? Array.from({ length: GRID_LINES }, (_unused, index) => {
                  const y = padTop + (plotHeight / (GRID_LINES - 1)) * index;
                  return (
                    <Line
                      key={index}
                      x1={padLeft}
                      y1={y}
                      x2={padLeft + plotWidth}
                      y2={y}
                      stroke={colors.chartGrid}
                      strokeWidth={1}
                    />
                  );
                })
              : null}

            {areaPath ? <Path d={areaPath} fill={`url(#${gradientId})`} /> : null}

            {coords.length > 1 ? (
              <Path
                d={linePath}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}

            {last ? <Circle cx={last.x} cy={last.y} r={4} fill={color} /> : null}
            {last ? <Circle cx={last.x} cy={last.y} r={7} fill={color} fillOpacity={0.16} /> : null}
          </Svg>
        ) : null}

        {showValueLabels && canRender ? (
          <>
            <Text style={[styles.axisLabel, styles.axisTop]}>{formatValue(bounds.maxY)}</Text>
            <Text style={[styles.axisLabel, styles.axisBottom]}>{formatValue(bounds.minY)}</Text>
          </>
        ) : null}
      </View>

      {footerLeft || footerRight ? (
        <View style={styles.footer}>
          <Text style={styles.footerText}>{footerLeft ?? ""}</Text>
          <Text style={styles.footerText}>{footerRight ?? ""}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  plot: {
    width: "100%",
    borderRadius: radii.md,
    overflow: "hidden",
    backgroundColor: colors.surfaceMuted,
  },
  axisLabel: {
    ...typography.caption,
    position: "absolute",
    right: spacing.xs,
    color: colors.textMuted,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 4,
    borderRadius: 4,
    overflow: "hidden",
  },
  axisTop: { top: 4 },
  axisBottom: { bottom: 4 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  footerText: { ...typography.caption, color: colors.textMuted },
});
