import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('inferops-metric-card')
export class InferopsMetricCard extends LitElement {
  @property({ type: String }) label = 'Metric';
  @property({ type: String }) value = '--';
  @property({ type: String }) unit = '';
  @property({ type: String }) trend = '';
  @property({ type: String, attribute: 'trend-direction' }) trendDirection: 'up' | 'down' | 'neutral' = 'neutral';
  @property({ type: String }) rating: 'elite' | 'high' | 'medium' | 'low' = 'medium';

  static styles = css`
    :host {
      display: block;
      font-family: 'Inter', system-ui, sans-serif;
      background: rgba(15, 23, 42, 0.5);
      border: 1px solid rgba(30, 41, 59, 1);
      border-radius: 12px;
      padding: 16px;
      transition: border-color 0.2s;
    }
    :host(:hover) {
      border-color: rgba(51, 65, 85, 1);
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .label {
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #94a3b8;
    }
    .badge {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .badge[data-rating="elite"] { background: rgba(16,185,129,0.1); color: #10b981; }
    .badge[data-rating="high"] { background: rgba(59,130,246,0.1); color: #3b82f6; }
    .badge[data-rating="medium"] { background: rgba(234,179,8,0.1); color: #eab308; }
    .badge[data-rating="low"] { background: rgba(239,68,68,0.1); color: #ef4444; }
    .value {
      font-size: 24px;
      font-weight: 700;
      color: #f1f5f9;
      letter-spacing: -0.02em;
    }
    .unit {
      font-size: 12px;
      color: #64748b;
      margin-left: 4px;
    }
    .trend {
      font-size: 11px;
      font-weight: 500;
    }
    .trend[data-direction="up"] { color: #10b981; }
    .trend[data-direction="down"] { color: #ef4444; }
    .trend[data-direction="neutral"] { color: #64748b; }
    .footer {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-top: 4px;
    }
  `;

  render() {
    return html`
      <div class="header">
        <span class="label">${this.label}</span>
        <span class="badge" data-rating=${this.rating}>${this.rating}</span>
      </div>
      <div class="footer">
        <span class="value">${this.value}<span class="unit">${this.unit}</span></span>
        ${this.trend ? html`<span class="trend" data-direction=${this.trendDirection}>${this.trend}</span>` : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'inferops-metric-card': InferopsMetricCard;
  }
}
