import { useMemo, useRef, useEffect, useState } from 'react';
import type { Product, Settings, Scenario } from '../types';
import { CURRENCY_SYMBOLS } from '../types';
import { simulate, buildSankeyData, formatCurrency } from '../utils/calculations';

interface SankeyChartProps {
  products: Product[];
  settings: Settings;
  scenarios: Scenario[];
}

interface LayoutNode {
  name: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  value: number;
  column: number;
}

interface LayoutLink {
  source: number;
  target: number;
  value: number;
  color: string;
  sy: number;
  ty: number;
  sThickness: number;
  tThickness: number;
}

export function SankeyChart({ products, settings, scenarios }: SankeyChartProps) {
  const sym = CURRENCY_SYMBOLS[settings.currency] || settings.currency;
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 480 });

  const activeScenario = scenarios[0];
  const result = useMemo(() => simulate(products, settings, activeScenario), [products, settings, activeScenario]);
  const sankeyData = useMemo(() => buildSankeyData(result, products), [result, products]);

  useEffect(() => {
    const container = svgRef.current?.parentElement;
    if (container) {
      const obs = new ResizeObserver((entries) => {
        const { width } = entries[0].contentRect;
        setDimensions({ width: Math.max(400, width), height: 480 });
      });
      obs.observe(container);
      return () => obs.disconnect();
    }
  }, []);

  const { layoutNodes, layoutLinks } = useMemo(() => {
    const { nodes, links } = sankeyData;
    const W = dimensions.width;
    const H = dimensions.height;
    const padY = 30;
    const padX = 40;
    const nodeWidth = 10;
    const nodePadding = 14;

    // Assign columns:
    // 0 = products, 1 = Revenue, 2 = COGS + Gross Profit, 3 = Net Profit + Tax + Overhead
    const columns: number[][] = [[], [], [], []];
    nodes.forEach((n, i) => {
      if (i < products.length) {
        columns[0].push(i);
      } else if (n.name === 'Revenue') {
        columns[1].push(i);
      } else if (n.name === 'COGS' || n.name === 'Gross Profit') {
        columns[2].push(i);
      } else {
        columns[3].push(i);
      }
    });

    // Order column 2: COGS on top, Gross Profit below
    columns[2].sort((a, b) => {
      if (nodes[a].name === 'COGS') return -1;
      if (nodes[b].name === 'COGS') return 1;
      return 0;
    });

    // Order column 3: Net Profit first, then Tax, then overhead
    columns[3].sort((a, b) => {
      const order = (n: string) => {
        if (n === 'Net Profit') return 0;
        if (n === 'Tax') return 1;
        return 2;
      };
      return order(nodes[a].name) - order(nodes[b].name);
    });

    // Compute node values
    const nodeValues = nodes.map((_, i) => {
      const incoming = links.filter((l) => l.target === i).reduce((s, l) => s + l.value, 0);
      const outgoing = links.filter((l) => l.source === i).reduce((s, l) => s + l.value, 0);
      return Math.max(incoming, outgoing);
    });

    const colX = [
      padX,
      padX + (W - 2 * padX) * 0.25,
      padX + (W - 2 * padX) * 0.48,
      W - padX - nodeWidth,
    ];

    const availH = H - 2 * padY;

    const layoutNodes: LayoutNode[] = nodes.map(() => ({
      name: '', color: '', x: 0, y: 0, width: nodeWidth, height: 0, value: 0, column: 0,
    }));

    columns.forEach((col, ci) => {
      const totalValue = col.reduce((s, i) => s + nodeValues[i], 0);
      const totalGaps = Math.max(0, col.length - 1) * nodePadding;
      const scaleH = availH - totalGaps;

      let y = padY;
      col.forEach((nodeIdx) => {
        const h = totalValue > 0
          ? Math.max(3, (nodeValues[nodeIdx] / totalValue) * scaleH)
          : 20;
        layoutNodes[nodeIdx] = {
          name: nodes[nodeIdx].name,
          color: nodes[nodeIdx].color,
          x: colX[ci],
          y,
          width: nodeWidth,
          height: h,
          value: nodeValues[nodeIdx],
          column: ci,
        };
        y += h + nodePadding;
      });
    });

    // Position links
    const sourceOffsets = new Map<number, number>();
    const targetOffsets = new Map<number, number>();

    // Sort links by target y position for cleaner flow
    const sortedLinks = links
      .filter((l) => l.value > 0)
      .sort((a, b) => layoutNodes[a.target].y - layoutNodes[b.target].y);

    const layoutLinks: LayoutLink[] = sortedLinks.map((l) => {
      const sNode = layoutNodes[l.source];
      const tNode = layoutNodes[l.target];

      const sTotal = links.filter((ll) => ll.source === l.source).reduce((s, ll) => s + ll.value, 0);
      const sThickness = sTotal > 0 ? (l.value / sTotal) * sNode.height : sNode.height;

      const tTotal = links.filter((ll) => ll.target === l.target).reduce((s, ll) => s + ll.value, 0);
      const tThickness = tTotal > 0 ? (l.value / tTotal) * tNode.height : tNode.height;

      const sOff = sourceOffsets.get(l.source) ?? 0;
      const tOff = targetOffsets.get(l.target) ?? 0;

      sourceOffsets.set(l.source, sOff + sThickness);
      targetOffsets.set(l.target, tOff + tThickness);

      return {
        source: l.source,
        target: l.target,
        value: l.value,
        color: l.color,
        sy: sNode.y + sOff + sThickness / 2,
        ty: tNode.y + tOff + tThickness / 2,
        sThickness,
        tThickness,
      };
    });

    return { layoutNodes, layoutLinks };
  }, [sankeyData, dimensions, products.length]);

  if (products.length === 0) {
    return (
      <section className="section">
        <div className="page-shell">
          <div className="section-label">03</div>
          <div className="section-title">Revenue Flow</div>
          <div
            style={{
              background: 'var(--text-primary)',
              border: '1px solid var(--border)',
              padding: '48px 24px',
              textAlign: 'center',
              color: 'rgba(255,255,255,0.35)',
              fontSize: '0.8125rem',
              fontFamily: 'var(--font-body)',
            }}
          >
            Add products to see where your revenue flows.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="page-shell">
        <div className="section-label">03</div>
        <div className="section-title">Revenue Flow</div>
        <div className="section-desc">
          How revenue flows from product sales through costs to net profit.
        </div>

        <div
          style={{
            background: 'var(--text-primary)',
            border: '1px solid var(--border)',
            padding: 24,
            position: 'relative',
          }}
        >
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            style={{ display: 'block', width: '100%', height: dimensions.height }}
          >
            {/* Links as filled area shapes */}
            {layoutLinks.map((link, i) => {
              const sNode = layoutNodes[link.source];
              const tNode = layoutNodes[link.target];
              const sx = sNode.x + sNode.width;
              const tx = tNode.x;
              const midX = (sx + tx) / 2;

              const syTop = link.sy - link.sThickness / 2;
              const syBot = link.sy + link.sThickness / 2;
              const tyTop = link.ty - link.tThickness / 2;
              const tyBot = link.ty + link.tThickness / 2;

              const d = [
                `M${sx},${syTop}`,
                `C${midX},${syTop} ${midX},${tyTop} ${tx},${tyTop}`,
                `L${tx},${tyBot}`,
                `C${midX},${tyBot} ${midX},${syBot} ${sx},${syBot}`,
                'Z',
              ].join(' ');

              return (
                <path
                  key={i}
                  d={d}
                  fill={link.color}
                  fillOpacity={0.65}
                  stroke={link.color}
                  strokeWidth={0.5}
                  strokeOpacity={0.2}
                  onMouseEnter={(e) => setTooltip({ x: e.clientX, y: e.clientY, text: formatCurrency(link.value, sym) })}
                  onMouseLeave={() => setTooltip(null)}
                  style={{ cursor: 'pointer', transition: 'fill-opacity 0.15s' }}
                  onMouseOver={(e) => { e.currentTarget.style.fillOpacity = '0.85'; }}
                  onMouseOut={(e) => { e.currentTarget.style.fillOpacity = '0.65'; }}
                />
              );
            })}

            {/* Nodes */}
            {layoutNodes.map((node, i) => (
              node.height > 0 && (
                <g key={i}>
                  <rect
                    x={node.x}
                    y={node.y}
                    width={node.width}
                    height={node.height}
                    fill={node.color}
                    onMouseEnter={(e) => {
                      const label = node.name === 'COGS' ? 'COGS (Cost of Goods Sold)' : node.name;
                      setTooltip({ x: e.clientX, y: e.clientY, text: `${label}: ${formatCurrency(node.value, sym)}` });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    style={{ cursor: 'pointer' }}
                  />
                  {/* Label: right side for columns 0-1, left side for columns 2-3 */}
                  <text
                    x={node.column <= 1 ? node.x + node.width + 8 : node.x - 8}
                    y={node.y + Math.min(node.height / 2, 16)}
                    dy="0.35em"
                    textAnchor={node.column <= 1 ? 'start' : 'end'}
                    fill="rgba(255,255,255,0.85)"
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', letterSpacing: '0.04em', fontWeight: 500 }}
                  >
                    {node.name}
                  </text>
                  <text
                    x={node.column <= 1 ? node.x + node.width + 8 : node.x - 8}
                    y={node.y + Math.min(node.height / 2, 16) + 13}
                    dy="0.35em"
                    textAnchor={node.column <= 1 ? 'start' : 'end'}
                    fill="rgba(255,255,255,0.45)"
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', letterSpacing: '0.04em' }}
                  >
                    {formatCurrency(node.value, sym)}
                  </text>
                </g>
              )
            ))}
          </svg>

          {tooltip && (
            <div
              style={{
                position: 'fixed',
                left: tooltip.x + 12,
                top: tooltip.y - 10,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                padding: '6px 10px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                color: 'var(--text-primary)',
                pointerEvents: 'none',
                zIndex: 50,
              }}
            >
              {tooltip.text}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
