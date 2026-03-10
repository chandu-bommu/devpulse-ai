import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('devpulse-status-badge')
export class DevpulseStatusBadge extends LitElement {
  @property({ type: String }) status: 'success' | 'failure' | 'running' | 'cancelled' = 'success';
  @property({ type: String }) label = '';

  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 12px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    :host([status="success"]) {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.2);
    }
    :host([status="failure"]) {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }
    :host([status="running"]) {
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
      border: 1px solid rgba(59, 130, 246, 0.2);
    }
    :host([status="cancelled"]) {
      background: rgba(148, 163, 184, 0.1);
      color: #94a3b8;
      border: 1px solid rgba(148, 163, 184, 0.2);
    }
    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }
    :host([status="running"]) .dot {
      animation: pulse 1.5s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
  `;

  render() {
    return html`
      <span class="dot"></span>
      <span>${this.label || this.status}</span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'devpulse-status-badge': DevpulseStatusBadge;
  }
}
