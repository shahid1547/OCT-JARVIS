import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { GraphData, GraphNode, GraphLink } from '../types';

interface MemoryGraphProps {
  data: GraphData;
  theme: 'light' | 'dark';
}

const MemoryGraph: React.FC<MemoryGraphProps> = ({ data, theme }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.nodes.length === 0) return;

    const width = 300;
    const height = 300;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous

    const simulation = d3.forceSimulation(data.nodes as d3.SimulationNodeDatum[])
      .force("link", d3.forceLink(data.links).id((d: any) => d.id).distance(60))
      .force("charge", d3.forceManyBody().strength(-100))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const linkColor = theme === 'dark' ? "#475569" : "#cbd5e1";
    const labelColor = theme === 'dark' ? "#cbd5e1" : "#334155";
    const nodeStroke = theme === 'dark' ? "#fff" : "#fff";

    const link = svg.append("g")
      .attr("stroke", linkColor)
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("stroke-width", (d) => Math.sqrt(d.value));

    const node = svg.append("g")
      .attr("stroke", nodeStroke)
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(data.nodes)
      .join("circle")
      .attr("r", 5)
      .attr("fill", (d) => d.group === 1 ? "#22d3ee" : "#a5b4fc")
      .call((d3.drag() as any)
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

    const labels = svg.append("g")
        .selectAll("text")
        .data(data.nodes)
        .enter()
        .append("text")
        .text(d => d.id)
        .attr("font-size", "10px")
        .attr("fill", labelColor)
        .attr("dx", 8)
        .attr("dy", 3);

    node.append("title")
      .text((d) => d.id);

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);

      labels
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

  }, [data, theme]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col items-center shadow-sm">
      <h3 className="text-cyan-600 dark:text-cyan-400 text-sm font-bold mb-2 uppercase tracking-wider">Concept Graph</h3>
      <svg ref={svgRef} width={300} height={300} viewBox="0 0 300 300" className="overflow-visible" />
    </div>
  );
};

export default MemoryGraph;