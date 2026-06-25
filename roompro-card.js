import { LitElement, html, css } from "https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js";

class RoomProCardEditor extends LitElement {
  static get properties() {
    return {
      _config: { state: true },
      hass: { state: false },
    };
  }

  setConfig(config) {
    this._config = config;
  }

  _topChanged(ev, key) {
    if (!this._config) return;
    const cfg = JSON.parse(JSON.stringify(this._config));
    cfg[key] = ev.target.value;
    this._emit(cfg);
  }

  // For widgets that emit value via the value-changed event detail (ha-selector).
  _topValue(key, value) {
    if (!this._config) return;
    const cfg = JSON.parse(JSON.stringify(this._config));
    if (value === undefined || value === null || value === '') {
      delete cfg[key];
    } else {
      cfg[key] = value;
    }
    this._emit(cfg);
  }

  _buttonChanged(index, key, value) {
    const cfg = JSON.parse(JSON.stringify(this._config));
    cfg.entities = cfg.entities ? [...cfg.entities] : [];
    cfg.entities[index] = { ...cfg.entities[index], [key]: value };
    this._emit(cfg);
  }

  _addButton() {
    const cfg = JSON.parse(JSON.stringify(this._config));
    cfg.entities = cfg.entities ? [...cfg.entities] : [];
    cfg.entities.push({
      type: 'light',
      name: 'New Button',
      icon: 'mdi:lightbulb',
      background_color: '#1e1e1e',
      glow_color: '#3b82f6',
      border_color: '#3b82f6',
      border_radius: 16,
    });
    this._emit(cfg);
  }

  _removeButton(index) {
    const cfg = JSON.parse(JSON.stringify(this._config));
    cfg.entities = (cfg.entities || []).filter((_, i) => i !== index);
    this._emit(cfg);
  }

  _sceneChanged(btnIndex, sceneIndex, key, value) {
    const cfg = JSON.parse(JSON.stringify(this._config));
    const btn = cfg.entities[btnIndex];
    btn.scenes = btn.scenes ? [...btn.scenes] : [];
    btn.scenes[sceneIndex] = { ...btn.scenes[sceneIndex], [key]: value };
    this._emit(cfg);
  }

  _addScene(btnIndex) {
    const cfg = JSON.parse(JSON.stringify(this._config));
    const btn = cfg.entities[btnIndex];
    btn.scenes = btn.scenes ? [...btn.scenes] : [];
    btn.scenes.push({ entity: '', name: 'New Scene', icon: 'mdi:palette' });
    this._emit(cfg);
  }

  _removeScene(btnIndex, sceneIndex) {
    const cfg = JSON.parse(JSON.stringify(this._config));
    const btn = cfg.entities[btnIndex];
    btn.scenes = (btn.scenes || []).filter((_, i) => i !== sceneIndex);
    this._emit(cfg);
  }

  _emit(cfg) {
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: cfg },
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    if (!this._config) return html``;
    const entities = this._config.entities || [];
    return html`
      <div class="form">
        <ha-textfield
          label="Room Name"
          .value=${this._config.name || ''}
          @input=${(e) => this._topChanged(e, 'name')}>
        </ha-textfield>

        <div class="field-label">Background Image</div>
        <ha-selector
          .hass=${this.hass}
          .selector=${{ image: {} }}
          .value=${this._config.background_image || ''}
          @value-changed=${(e) => this._topValue('background_image', e.detail.value)}>
        </ha-selector>

        <div class="field-label">Thumbnail Image</div>
        <ha-selector
          .hass=${this.hass}
          .selector=${{ image: {} }}
          .value=${this._config.thumbnail || ''}
          @value-changed=${(e) => this._topValue('thumbnail', e.detail.value)}>
        </ha-selector>

        <ha-textfield
          label="Status Entity (Motion Sensor)"
          .value=${this._config.status_entity || ''}
          @input=${(e) => this._topChanged(e, 'status_entity')}>
        </ha-textfield>

        <div class="section-title">Buttons</div>
        ${entities.map((ent, i) => this._renderButtonEditor(ent, i))}

        <mwc-button raised class="add-btn" @click=${this._addButton}>
          <ha-icon icon="mdi:plus"></ha-icon>&nbsp;Add Button
        </mwc-button>

        <div class="hint">
          Scene buttons keep their <code>scenes:</code> list and read-only
          <code>sensors:</code> are still edited in YAML mode. Everything else is editable here.
        </div>
      </div>
    `;
  }

  _renderButtonEditor(ent, i) {
    const actions = [
      { value: 'light', label: 'Light (toggle)' },
      { value: 'switch', label: 'Switch (toggle)' },
      { value: 'audio', label: 'Audio (volume popup)' },
      { value: 'scene', label: 'Scene (picker popup)' },
      { value: 'power', label: 'Power (run script)' },
    ];
    return html`
      <div class="button-editor">
        <div class="be-header">
          <span>Button ${i + 1}</span>
          <ha-icon class="del" icon="mdi:delete" @click=${() => this._removeButton(i)}></ha-icon>
        </div>

        <ha-entity-picker
          .hass=${this.hass}
          .value=${ent.entity || ''}
          label="Entity"
          allow-custom-entity
          @value-changed=${(e) => this._buttonChanged(i, 'entity', e.detail.value)}>
        </ha-entity-picker>

        <ha-select
          label="Action"
          .value=${ent.type || 'light'}
          @selected=${(e) => this._buttonChanged(i, 'type', e.target.value)}
          @closed=${(e) => e.stopPropagation()}>
          ${actions.map((a) => html`<mwc-list-item .value=${a.value}>${a.label}</mwc-list-item>`)}
        </ha-select>

        <ha-textfield
          label="Name"
          .value=${ent.name || ''}
          @input=${(e) => this._buttonChanged(i, 'name', e.target.value)}>
        </ha-textfield>

        <ha-icon-picker
          .value=${ent.icon || ''}
          label="Icon"
          @value-changed=${(e) => this._buttonChanged(i, 'icon', e.detail.value)}>
        </ha-icon-picker>

        <div class="color-grid">
          ${this._colorField('Background', ent.background_color, '#1e1e1e', (v) => this._buttonChanged(i, 'background_color', v))}
          ${this._colorField('Edge color', ent.border_color, '#3b82f6', (v) => this._buttonChanged(i, 'border_color', v))}
          ${this._colorField('Glow (on)', ent.glow_color, '#3b82f6', (v) => this._buttonChanged(i, 'glow_color', v))}
        </div>

        <div class="slider-row">
          <label>Edge radius: <strong>${ent.border_radius ?? 16}px</strong></label>
          <ha-slider
            min="0" max="30" step="1"
            .value=${ent.border_radius ?? 16}
            @change=${(e) => this._buttonChanged(i, 'border_radius', parseInt(e.target.value, 10))}>
          </ha-slider>
        </div>

        ${ent.type === 'scene' ? this._renderScenesEditor(ent, i) : ''}
      </div>
    `;
  }

  _renderScenesEditor(ent, btnIndex) {
    const scenes = ent.scenes || [];
    return html`
      <div class="scenes-editor">
        <div class="be-subtitle">Scenes (shown as buttons in the popup)</div>
        ${scenes.map((s, si) => html`
          <div class="scene-row">
            <div class="scene-row-header">
              <span>Scene ${si + 1}</span>
              <ha-icon class="del" icon="mdi:delete" @click=${() => this._removeScene(btnIndex, si)}></ha-icon>
            </div>
            <ha-entity-picker
              .hass=${this.hass}
              .value=${s.entity || ''}
              .includeDomains=${['scene', 'script']}
              label="Scene / Script"
              allow-custom-entity
              @value-changed=${(e) => this._sceneChanged(btnIndex, si, 'entity', e.detail.value)}>
            </ha-entity-picker>
            <ha-textfield
              label="Label"
              .value=${s.name || ''}
              @input=${(e) => this._sceneChanged(btnIndex, si, 'name', e.target.value)}>
            </ha-textfield>
            <ha-icon-picker
              .value=${s.icon || ''}
              label="Icon"
              @value-changed=${(e) => this._sceneChanged(btnIndex, si, 'icon', e.detail.value)}>
            </ha-icon-picker>
          </div>
        `)}
        <mwc-button outlined class="add-scene" @click=${() => this._addScene(btnIndex)}>
          <ha-icon icon="mdi:plus"></ha-icon>&nbsp;Add Scene
        </mwc-button>
      </div>
    `;
  }

  _colorField(label, value, fallback, onChange) {
    return html`
      <div class="color-field">
        <label>${label}</label>
        <input type="color" .value=${value || fallback} @input=${(e) => onChange(e.target.value)} />
      </div>
    `;
  }

  static get styles() {
    return css`
      .form {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 16px;
      }
      .section-title {
        font-weight: 700;
        font-size: 1rem;
        margin-top: 8px;
      }
      .button-editor {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 12px;
        border-radius: 12px;
        border: 1px solid var(--divider-color, #444);
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.05));
      }
      .be-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 600;
      }
      .be-header .del {
        cursor: pointer;
        color: var(--error-color, #f87171);
      }
      .color-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
      }
      .color-field {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .color-field label {
        font-size: 0.75rem;
        color: var(--secondary-text-color);
      }
      .color-field input[type="color"] {
        width: 100%;
        height: 36px;
        border: none;
        border-radius: 8px;
        background: none;
        cursor: pointer;
        padding: 0;
      }
      .slider-row {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .slider-row label {
        font-size: 0.85rem;
      }
      .scenes-editor {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 10px;
        border-radius: 10px;
        border: 1px dashed var(--divider-color, #555);
      }
      .be-subtitle {
        font-weight: 600;
        font-size: 0.85rem;
      }
      .scene-row {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 8px;
        border-radius: 8px;
        background: rgba(127, 127, 127, 0.1);
      }
      .scene-row-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.8rem;
      }
      .scene-row-header .del {
        cursor: pointer;
        color: var(--error-color, #f87171);
      }
      ha-textfield,
      ha-select,
      ha-entity-picker,
      ha-icon-picker,
      ha-selector {
        width: 100%;
        display: block;
      }
      .field-label {
        font-size: 0.85rem;
        color: var(--secondary-text-color);
        margin-bottom: -8px;
      }
      .add-btn {
        margin-top: 4px;
      }
      .hint {
        font-size: 0.8rem;
        color: var(--secondary-text-color);
        margin-top: 8px;
      }
    `;
  }
}
if (!customElements.get('roompro-card-editor')) {
  customElements.define('roompro-card-editor', RoomProCardEditor);
}

class RoomProCard extends LitElement {
  static get properties() {
    return {
      _hass: { state: false },
      _config: { state: true },
      _activePopup: { state: true },
    };
  }

  setConfig(config) {
    if (!config.name || !config.entities) {
      throw new Error("RoomPro Card requires 'name' and 'entities'.");
    }
    this._config = config;
    this._activePopup = null;
  }

  set hass(hass) {
    this._hass = hass;
  }

  static getConfigElement() {
    return document.createElement('roompro-card-editor');
  }

  // Rough height in 50px rows for HA's masonry layout.
  getCardSize() {
    return this._config && this._config.entities && this._config.entities.length > 5 ? 4 : 3;
  }

  static getStubConfig() {
    return {
      name: "Living Room",
      background_image: "/local/living_room.jpg",
      thumbnail: "/local/living_room_thumb.jpg",
      status_entity: "binary_sensor.living_room_motion",
      sensors: [
        { entity: "sensor.living_room_co2", prefix: "CO2:", unit: "ppm" },
        { entity: "sensor.living_room_humidity", prefix: "Hum:", unit: "%" }
      ],
      entities: [
        { type: "light", entity: "light.living_room_main", name: "Main Light", icon: "mdi:lightbulb", background_color: "#1e1e1e", glow_color: "#facc15", border_color: "#3b82f6", border_radius: 16 },
        { type: "audio", entity: "media_player.living_room_speaker", name: "Speaker", icon: "mdi:speaker", background_color: "#1e1e1e", glow_color: "#22d3ee", border_color: "#3b82f6", border_radius: 16 },
        { type: "scene", name: "Scenes", icon: "mdi:palette", background_color: "#1e1e1e", glow_color: "#a855f7", border_color: "#3b82f6", border_radius: 16, scenes: [{ entity: "scene.movie_mode", name: "Movie" }] },
        { type: "power", name: "All Off", icon: "mdi:power", entity: "script.turn_off_living_room", background_color: "#3b0d0d", glow_color: "#ef4444", border_color: "#ef4444", border_radius: 16 }
      ]
    };
  }

  _getSensorString() {
    if (!this._config.sensors || !this._hass) return '';
    return this._config.sensors.map(s => {
      const state = this._hass.states[s.entity];
      if (!state) return '';
      return `${s.prefix || ''} ${state.state} ${s.unit || state.attributes.unit_of_measurement || ''}`.trim();
    }).filter(Boolean).join(' | ');
  }

  _handleClick(entityId, domain, action = 'toggle', data = {}) {
    if (!entityId || !this._hass) return;
    this._hass.callService(domain, action, { entity_id: entityId, ...data });
  }

  // Per-button inline styling from the visual editor (background, edge, glow-on).
  _buttonStyle(ent, isActive) {
    const parts = [];
    if (ent.background_color) parts.push(`background:${ent.background_color}`);
    if (ent.border_color) parts.push(`border-color:${ent.border_color}`);
    if (ent.border_radius !== undefined && ent.border_radius !== null && ent.border_radius !== '') {
      parts.push(`border-radius:${ent.border_radius}px`);
    }
    if (isActive && ent.glow_color) {
      parts.push(`border-color:${ent.glow_color}`);
      parts.push(`box-shadow:0 0 15px ${ent.glow_color}`);
    }
    return parts.join(';');
  }

  _togglePopup(type) {
    this._activePopup = this._activePopup === type ? null : type;
  }

  render() {
    if (!this._config || !this._hass) return html``;

    const { name, background_image, thumbnail, status_entity, entities } = this._config;
    const statusState = status_entity ? this._hass.states[status_entity] : null;
    const isMotion = statusState && statusState.state === 'on';

    const entityCount = entities.length;
    const gridClass = entityCount > 5 ? 'grid-double-row' : 'grid-single-row';

    return html`
      <div class="card-container">
        <div class="bg-image" style="background-image: url('${background_image}');"></div>
        
        <div class="header">
          <div class="thumb" style="background-image: url('${thumbnail || background_image}');"></div>
          <div class="header-text">
            <div class="title">${name}</div>
            <div class="subtitle">${this._getSensorString()}</div>
          </div>
          <div class="status-icon ${isMotion ? 'active' : ''}">
            <ha-icon icon="mdi:motion-sensor"></ha-icon>
          </div>
        </div>

        <div class="controls-grid ${gridClass}">
          ${entities.map(ent => this._renderButton(ent))}
        </div>

        ${this._renderPopup()}
      </div>
    `;
  }

  _renderButton(ent) {
    const stateObj = ent.entity ? this._hass.states[ent.entity] : null;
    let isActive = false;
    let icon = ent.icon || 'mdi:help-circle';
    let label = ent.name || (stateObj ? stateObj.attributes.friendly_name : 'Unknown');
    let action = () => {};

    if (ent.type === 'light') {
      isActive = stateObj && stateObj.state === 'on';
      icon = isActive ? 'mdi:lightbulb-on' : (ent.icon || 'mdi:lightbulb-outline');
      action = () => this._handleClick(ent.entity, ent.type);
    } else if (ent.type === 'switch') {
      isActive = stateObj && stateObj.state === 'on';
      icon = ent.icon || (isActive ? 'mdi:toggle-switch' : 'mdi:toggle-switch-off');
      action = () => this._handleClick(ent.entity, ent.type);
    } else if (ent.type === 'audio') {
      isActive = stateObj && (stateObj.state === 'playing' || stateObj.state === 'on');
      icon = ent.icon || 'mdi:speaker';
      action = () => this._togglePopup('audio');
    } else if (ent.type === 'scene') {
      icon = ent.icon || 'mdi:palette';
      action = () => this._togglePopup('scene');
    } else if (ent.type === 'power') {
      icon = ent.icon || 'mdi:power';
      action = () => this._handleClick(ent.entity, 'script', 'turn_on');
      return html`
        <div class="btn power-btn" style=${this._buttonStyle(ent, false)} @click=${action}>
          <ha-icon icon=${icon}></ha-icon>
          <span class="btn-label">${label}</span>
        </div>
      `;
    }

    return html`
      <div class="btn ${isActive ? 'active' : ''} ${ent.type}" style=${this._buttonStyle(ent, isActive)} @click=${action}>
        <ha-icon icon=${icon}></ha-icon>
        <span class="btn-label">${label}</span>
      </div>
    `;
  }

  _renderPopup() {
    if (!this._activePopup) return html``;
    
    let content = html``;
    let title = '';

    if (this._activePopup === 'audio') {
      const audioEnt = this._config.entities.find(e => e.type === 'audio');
      const audioState = audioEnt ? this._hass.states[audioEnt.entity] : null;
      const isMuted = audioState && audioState.attributes.is_volume_muted;
      title = (audioEnt && audioEnt.name) || 'Audio Control';
      content = html`
        <div class="popup-row">
          <div class="popup-btn" @click=${() => this._handleClick(audioEnt.entity, 'media_player', 'volume_down')}>
            <ha-icon icon="mdi:volume-minus"></ha-icon>
          </div>
          <div class="popup-btn" @click=${() => this._handleClick(audioEnt.entity, 'media_player', 'volume_up')}>
            <ha-icon icon="mdi:volume-plus"></ha-icon>
          </div>
          <div class="popup-btn ${isMuted ? 'active' : ''}"
               @click=${() => this._handleClick(audioEnt.entity, 'media_player', 'volume_mute', { is_volume_muted: !isMuted })}>
            <ha-icon icon="${isMuted ? 'mdi:volume-off' : 'mdi:volume-mute'}"></ha-icon>
          </div>
        </div>
      `;
    } else if (this._activePopup === 'scene') {
      const sceneEnt = this._config.entities.find(e => e.type === 'scene');
      title = (sceneEnt && sceneEnt.name) || 'Scenes';
      content = html`
        <div class="popup-scene-list">
          ${(sceneEnt && sceneEnt.scenes ? sceneEnt.scenes : []).map(s => {
            const domain = (s.entity || '').split('.')[0] || 'scene';
            return html`
              <div class="popup-scene-item"
                   @click=${() => { this._handleClick(s.entity, domain, 'turn_on'); this._togglePopup('scene'); }}>
                <ha-icon icon=${s.icon || 'mdi:palette'}></ha-icon>
                <span>${s.name}</span>
              </div>
            `;
          })}
        </div>
      `;
    }

    return html`
      <div class="popup-overlay" @click=${() => this._activePopup = null}>
        <div class="popup-card" @click=${(e) => e.stopPropagation()}>
          <div class="popup-header">
            <span>${title}</span>
            <ha-icon icon="mdi:close" @click=${() => this._activePopup = null}></ha-icon>
          </div>
          <div class="popup-body">
            ${content}
          </div>
        </div>
      </div>
    `;
  }

  static get styles() {
    return css`
      :host {
        display: block;
        container-type: inline-size;
      }

      .card-container {
        position: relative;
        height: 260px; 
        border-radius: 24px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: flex-end; 
        color: #fff;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      }

      .bg-image {
        position: absolute;
        inset: 0;
        background-size: cover;
        background-position: center;
        z-index: 0;
      }

      .header {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        z-index: 2;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        box-sizing: border-box;
        border-bottom: 1px solid rgba(255,255,255,0.1);
      }

      .thumb {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        background-size: cover;
        background-position: center;
        flex-shrink: 0;
        border: 1px solid rgba(255,255,255,0.2);
      }

      .header-text {
        flex: 1;
        min-width: 0;
      }

      .title {
        font-size: 1.1rem;
        font-weight: 700;
        letter-spacing: -0.2px;
        text-shadow: 0 1px 3px rgba(0,0,0,0.5);
      }

      .subtitle {
        font-size: 0.75rem;
        opacity: 0.85;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-top: 2px;
      }

      .status-icon {
        opacity: 0.4;
        transition: all 0.3s ease;
      }
      .status-icon.active {
        opacity: 1;
        color: #4ade80; 
        text-shadow: 0 0 10px #4ade80;
      }

      .controls-grid {
        position: relative;
        z-index: 1;
        padding: 16px;
        display: grid;
        gap: 12px;
        background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%);
      }

      .btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 10px 4px;
        background: rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 16px;
        backdrop-filter: blur(5px);
        cursor: pointer;
        transition: all 0.2s ease;
        min-height: 70px; 
      }

      .btn:active {
        transform: scale(0.95);
      }

      .btn ha-icon {
        --mdc-icon-size: 24px;
        color: rgba(255, 255, 255, 0.9);
      }

      .btn-label {
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        opacity: 0.8;
      }

      .btn.active {
        background: rgba(59, 130, 246, 0.2); 
        border-color: #3b82f6;
        box-shadow: 0 0 15px rgba(59, 130, 246, 0.4);
      }
      .btn.active ha-icon { color: #60a5fa; }

      .btn.power-btn {
        background: rgba(239, 68, 68, 0.2); 
        border-color: #ef4444;
        box-shadow: 0 0 15px rgba(239, 68, 68, 0.3);
      }
      .btn.power-btn ha-icon { color: #f87171; }

      .controls-grid {
        grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
      }

      @container (min-width: 600px) {
        .controls-grid {
          grid-template-rows: 1fr; 
          grid-auto-flow: column;
        }
        
        .controls-grid.grid-double-row {
          grid-template-rows: 1fr 1fr;
          grid-auto-flow: column;
        }
      }

      .popup-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(8px);
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.2s ease;
      }

      .popup-card {
        /* The card is wide but short, so the popup is wide and height-capped. */
        width: 92%;
        max-width: 560px;
        max-height: calc(100% - 16px);
        overflow-y: auto;
        background: rgba(40, 40, 40, 0.9);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 18px;
        padding: 14px 16px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        box-sizing: border-box;
      }

      .popup-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 700;
        margin-bottom: 12px;
        font-size: 1rem;
      }
      .popup-header ha-icon { cursor: pointer; opacity: 0.7; }

      .popup-row {
        display: flex;
        justify-content: space-around;
        gap: 10px;
      }

      .popup-btn {
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255,255,255,0.1);
        border-radius: 50%;
        cursor: pointer;
      }
      .popup-btn:active { background: rgba(255,255,255,0.2); }
      .popup-btn.active {
        background: rgba(239, 68, 68, 0.25);
        color: #f87171;
      }

      /* Compact buttons laid out side by side to suit the wide/short card. */
      .popup-scene-list {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
      }
      .popup-scene-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        width: 68px;
        min-height: 64px;
        padding: 6px 4px;
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 12px;
        cursor: pointer;
        transition: background 0.15s ease, transform 0.15s ease;
      }
      .popup-scene-item:hover { background: rgba(255,255,255,0.16); }
      .popup-scene-item:active { transform: scale(0.95); }
      .popup-scene-item ha-icon { --mdc-icon-size: 22px; }
      .popup-scene-item span {
        font-size: 0.62rem;
        line-height: 1.1;
        text-align: center;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `;
  }
}

if (!customElements.get('roompro-card')) {
  customElements.define('roompro-card', RoomProCard);
}

// Register so the card appears in HA's visual "Add Card" picker.
window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === 'roompro-card')) {
  window.customCards.push({
    type: 'roompro-card',
    name: 'RoomPro Card',
    description: 'A premium room control card with glassmorphism, responsive grids, and internal popups.',
    preview: true,
    documentationURL: 'https://github.com/paulbalinnel/roomcardpro',
  });
}
