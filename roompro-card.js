import { LitElement, html, css } from "lit";

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

  _valueChanged(ev, path) {
    if (!this._config) return;
    const newConfig = JSON.parse(JSON.stringify(this._config));
    const value = ev.target.value;
    
    if (path === 'name' || path === 'background_image' || path === 'thumbnail' || path === 'status_entity') {
      newConfig[path] = value;
    }

    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    if (!this._config) return html``;
    return html`
      <div class="form">
        <ha-textfield 
          label="Room Name" 
          .value=${this._config.name || ''} 
          @input=${(e) => this._valueChanged(e, 'name')}>
        </ha-textfield>
        
        <ha-textfield 
          label="Background Image URL (e.g., /local/room.jpg)" 
          .value=${this._config.background_image || ''} 
          @input=${(e) => this._valueChanged(e, 'background_image')}>
        </ha-textfield>

        <ha-textfield 
          label="Thumbnail Image URL" 
          .value=${this._config.thumbnail || ''} 
          @input=${(e) => this._valueChanged(e, 'thumbnail')}>
        </ha-textfield>

        <ha-textfield 
          label="Status Entity (Motion Sensor)" 
          .value=${this._config.status_entity || ''} 
          @input=${(e) => this._valueChanged(e, 'status_entity')}>
        </ha-textfield>
        
        <div class="hint">
          Note: For advanced arrays like 'sensors' and 'entities', please use YAML mode.
        </div>
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
      .hint {
        font-size: 0.8rem;
        color: var(--secondary-text-color);
        margin-top: 8px;
      }
    `;
  }
}
customElements.define('roompro-card-editor', RoomProCardEditor);

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
        { type: "light", entity: "light.living_room_main", name: "Main Light" },
        { type: "audio", entity: "media_player.living_room_speaker", name: "Speaker" },
        { type: "scene", name: "Scenes", icon: "mdi:palette", scenes: [{ entity: "scene.movie_mode", name: "Movie" }] },
        { type: "power", name: "All Off", icon: "mdi:power", entity: "script.turn_off_living_room" }
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

  _handleClick(entityId, domain, action = 'toggle') {
    if (!entityId || !this._hass) return;
    this._hass.callService(domain, action, { entity_id: entityId });
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

    if (ent.type === 'light' || ent.type === 'switch') {
      isActive = stateObj && stateObj.state === 'on';
      icon = isActive ? 'mdi:lightbulb-on' : (ent.icon || 'mdi:lightbulb-outline');
      action = () => this._handleClick(ent.entity, ent.type);
    } else if (ent.type === 'audio') {
      isActive = stateObj && stateObj.state === 'playing';
      icon = 'mdi:speaker';
      action = () => this._togglePopup('audio');
    } else if (ent.type === 'scene') {
      icon = 'mdi:palette';
      action = () => this._togglePopup('scene');
    } else if (ent.type === 'power') {
      icon = 'mdi:power';
      action = () => this._handleClick(ent.entity, 'script', 'turn_on');
      return html`
        <div class="btn power-btn" @click=${action}>
          <ha-icon icon=${icon}></ha-icon>
          <span class="btn-label">${label}</span>
        </div>
      `;
    }

    return html`
      <div class="btn ${isActive ? 'active' : ''} ${ent.type}" @click=${action}>
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
      title = audioEnt.name || 'Audio Control';
      content = html`
        <div class="popup-row">
          <div class="popup-btn" @click=${() => this._handleClick(audioEnt.entity, 'media_player', 'volume_down')}>
            <ha-icon icon="mdi:volume-minus"></ha-icon>
          </div>
          <div class="popup-btn" @click=${() => this._handleClick(audioEnt.entity, 'media_player', 'volume_up')}>
            <ha-icon icon="mdi:volume-plus"></ha-icon>
          </div>
          <div class="popup-btn" @click=${() => this._handleClick(audioEnt.entity, 'media_player', 'mute')}>
            <ha-icon icon="mdi:volume-mute"></ha-icon>
          </div>
        </div>
      `;
    } else if (this._activePopup === 'scene') {
      const sceneEnt = this._config.entities.find(e => e.type === 'scene');
      title = 'Scenes';
      content = html`
        <div class="popup-scene-list">
          ${sceneEnt.scenes.map(s => html`
            <div class="popup-scene-item" @click=${() => { this._handleClick(s.entity, 'scene', 'turn_on'); this._togglePopup('scene'); }}>
              <ha-icon icon=${s.icon || 'mdi:palette'}></ha-icon>
              <span>${s.name}</span>
            </div>
          `)}
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
        width: 80%;
        background: rgba(40, 40, 40, 0.9);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 20px;
        padding: 20px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      }

      .popup-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 700;
        margin-bottom: 20px;
        font-size: 1.1rem;
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

      .popup-scene-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .popup-scene-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: rgba(255,255,255,0.05);
        border-radius: 12px;
        cursor: pointer;
      }
      .popup-scene-item:hover { background: rgba(255,255,255,0.1); }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `;
  }
}

customElements.define('roompro-card', RoomProCard);
