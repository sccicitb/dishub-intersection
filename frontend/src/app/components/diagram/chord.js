import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const ChordDiagram = ({ matrix, categories }) => {
  const ref = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    const size = 460;
    const innerRadius = size / 2 - 80;
    const outerRadius = innerRadius + 13;

    d3.select(ref.current).selectAll("*").remove();

    const svg = d3
      .select(ref.current)
      .append("svg")
      .attr("width", size)
      .attr("height", size)
      .append("g")
      .attr("transform", `translate(${size / 2},${size / 2})`);

    const chord = d3
      .chordDirected()
      .padAngle(0.03)
      .sortSubgroups(d3.descending);

    const chords = chord(matrix);
    const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);
    const ribbon = d3
      .ribbonArrow()
      .radius(innerRadius - 2)
      .padAngle(1 / innerRadius);

    // Colors matching ClassificationChart theme
    const color = d3.scaleOrdinal([
      "#232f61", // deep navy (brand blue)
      "#4ADE80", // green (masuk)
      "#BF3D3D", // red (keluar)
      "#f59e0b", // amber accent
      "#6366f1", // indigo
      "#0ea5e9", // sky blue
    ]);

    // Arcs — with hover tooltip
    const tooltip = d3.select(tooltipRef.current);

    svg
      .append("g")
      .selectAll("path")
      .data(chords.groups)
      .join("path")
      .attr("d", arc)
      .attr("fill", (d) => color(d.index))
      .attr("stroke", (d) => d3.rgb(color(d.index)).darker(0.5))
      .attr("stroke-width", 0.5)
      .style("cursor", "pointer")
      .on("mousemove", (event, d) => {
        const name = categories[d.index];
        const total = d.value;
        tooltip
          .style("display", "block")
          .style("left", `${event.offsetX + 14}px`)
          .style("top", `${event.offsetY - 28}px`)
          .html(`<span style="font-weight:700">${name}</span><br/>Total: <span style="font-weight:700">${Number(total).toLocaleString('id-ID')}</span> kendaraan`);
      })
      .on("mouseleave", () => tooltip.style("display", "none"));

    // Labels — rotated along the arc so they never collide
    svg
      .append("g")
      .selectAll("text")
      .data(chords.groups)
      .join("text")
      .each((d) => (d.angle = (d.startAngle + d.endAngle) / 2))
      .attr("dy", "0.35em")
      .attr("font-size", "14px")
      .attr("font-weight", "800")
      .attr("font-family", "'Inter', sans-serif")
      .attr("fill", (d) => d3.rgb(color(d.index)).darker(0.8))
      .attr("transform", (d) =>
        `rotate(${(d.angle * 180) / Math.PI - 90})` +
        `translate(${outerRadius + 18},0)` +
        (d.angle > Math.PI ? "rotate(180)" : "")
      )
      .attr("text-anchor", (d) => (d.angle > Math.PI ? "end" : "start"))
      .text((d) => categories[d.index]);

    // Ribbons
    svg
      .append("g")
      .attr("fill-opacity", 0.4)
      .selectAll("path")
      .data(chords)
      .join("path")
      .attr("d", ribbon)
      .attr("fill", (d) => color(d.source.index))
      .attr("stroke", (d) => d3.rgb(color(d.source.index)).darker(0.3))
      .attr("stroke-width", 0.5)
      .append("title")
      .text((d) => {
        const from = categories[d.source.index];
        const to = categories[d.target.index];
        const value = d.source.value;
        return `${from} → ${to}: ${Number(value).toLocaleString('id-ID')}`;
      });

    // Value labels on the arc band
    svg
      .append("g")
      .selectAll("text")
      .data(chords.groups)
      .join("text")
      .each((d) => (d.angle = (d.startAngle + d.endAngle) / 2))
      .attr("dy", "0.35em")
      .attr("font-size", "10px")
      .attr("font-weight", "700")
      .attr("font-family", "'Inter', sans-serif")
      .attr("fill", (d) => d3.rgb(color(d.index)).darker(1.8))
      .attr("transform", (d) =>
        `rotate(${(d.angle * 180) / Math.PI - 90})` +
        `translate(${(innerRadius + outerRadius) / 2},0)` +
        (d.angle > Math.PI ? "rotate(180)" : "")
      )
      .attr("text-anchor", "middle")
      .text((d) => {
        const total = d.value;
        return total > 0 ? Number(total).toLocaleString('id-ID') : "";
      });

  }, [matrix, categories]);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <div ref={ref} />
      <div
        ref={tooltipRef}
        style={{
          display: "none",
          position: "absolute",
          pointerEvents: "none",
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "7px 12px",
          fontSize: "12px",
          color: "#1e293b",
          boxShadow: "0 4px 12px rgba(0,0,0,0.10)",
          whiteSpace: "nowrap",
          zIndex: 10,
          lineHeight: "1.6",
        }}
      />
    </div>
  );
};

export default ChordDiagram;

