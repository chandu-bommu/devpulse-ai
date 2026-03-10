import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('inferops-risk-gauge')
export class InferopsRiskGauge extends LitElement {
  @property({ type: Number }) score = 0;
  @property({ type: String }) level: 'low' | 'medium' | 'high' | 'critical' = 'low';

  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-family: 'Inter', system-ui, sans-serif;
    }
    .gauge-container {
      position: relative;
      width: 96px;
      height: 96px;
    }
    svg {
      transform: rotate(-90deg);
    }
    .bg-ring {
      fill: none;
      stroke: #1e293b;
      stroke-width: 8;
    }
    .fg-ring {
      fill: none;
      stroke-width: 8;
      stroke-linecap: round;
      transition: stroke-dasharray 0.5s ease;
    }
    .fg-ring[data-level="low"] { stroke: #22c55e; }
    .fg-ring[data-level="medium"] { stroke: #eab308; }
    .fg-ring[data-level="high"] { stroke: #f97316; }
    .fg-ring[data-level="critical"] { stroke: #ef4444; }
    .score-label {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .score-value {
      font-size: 24px;
      font-weight: 700;
      color: #f1f5f9;
    }
    .score-level {
      font-size: 9px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-top: -2px;
    }
    .score-level[data-level="low"] { color: #22c55e; }
    .score-level[data-level="medium"] { color: #eab308; }
    .score-level[data-level="high"] { color: #f97316; }
    .score-level[data-level="critical"] { color: #ef4444; }
  `;

  render() {
    const dashArray = `${this.score * 2.51} 251`;
    return html`
      <div class="gauge-container">
        <svg viewBox="0 0 100 100" width="96" height="96">
          <circle class="bg-ring" cx="50" cy="50" r="40" />
          <circle class="fg-ring" data-level=${this.level} cx="50" cy="50" r="40"
            stroke-dasharray=${dashArray} />
        </svg>
        <div class="score-label">
          <span class="score-value">${this.score}</span>
          <span class="score-level" data-level=${this.level}>${this.level}</span>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'inferops-risk-gauge': InferopsRiskGauge;
  }
}
