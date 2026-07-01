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

  _topSet(key, value) {
    if (!this._config) return;
    const cfg = JSON.parse(JSON.stringify(this._config));
    cfg[key] = value;
    this._emit(cfg);
  }

  // Native text input (renders reliably across HA versions, unlike ha-textfield).
  _text(label, value, onInput) {
    return html`
      <label class="tf">
        <span>${label}</span>
        <input type="text" .value=${value || ''} @input=${(e) => onInput(e.target.value)} />
      </label>
    `;
  }

  _buttonChanged(index, key, value) {
    const cfg = JSON.parse(JSON.stringify(this._config));
    cfg.entities = cfg.entities ? [...cfg.entities] : [];
    const updated = { ...cfg.entities[index], [key]: value };
    // When the action type changes, drop config that belonged to other types
    // so a button can't carry e.g. a leftover scenes list or service call.
    if (key === 'type') {
      if (value !== 'scene') delete updated.scenes;
      if (value !== 'select') delete updated.options;
      if (value !== 'audio') delete updated.channels;
      if (value !== 'navigate') delete updated.navigation_path;
      if (value !== 'popup') delete updated.card;
      if (value !== 'custom') {
        delete updated.service;
        delete updated.service_data;
      }
    }
    cfg.entities[index] = updated;
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
      border_color: '#808080',
      border_radius: 16,
    });
    this._emit(cfg);
  }

  _removeButton(index) {
    const cfg = JSON.parse(JSON.stringify(this._config));
    cfg.entities = (cfg.entities || []).filter((_, i) => i !== index);
    this._emit(cfg);
  }

  _subChanged(index, key, value) {
    const cfg = JSON.parse(JSON.stringify(this._config));
    cfg.sub_buttons = cfg.sub_buttons ? [...cfg.sub_buttons] : [];
    const updated = { ...cfg.sub_buttons[index], [key]: value };
    if (key === 'type' && value !== 'custom') {
      delete updated.service;
      delete updated.service_data;
    }
    cfg.sub_buttons[index] = updated;
    this._emit(cfg);
  }

  _addSub() {
    const cfg = JSON.parse(JSON.stringify(this._config));
    cfg.sub_buttons = cfg.sub_buttons ? [...cfg.sub_buttons] : [];
    cfg.sub_buttons.push({ type: 'switch', name: '', icon: 'mdi:toggle-switch', glow_color: '#22c55e' });
    this._emit(cfg);
  }

  _removeSub(index) {
    const cfg = JSON.parse(JSON.stringify(this._config));
    cfg.sub_buttons = (cfg.sub_buttons || []).filter((_, i) => i !== index);
    this._emit(cfg);
  }

  _channelChanged(btnIndex, chIndex, key, value) {
    const cfg = JSON.parse(JSON.stringify(this._config));
    const btn = cfg.entities[btnIndex];
    btn.channels = btn.channels ? [...btn.channels] : [];
    btn.channels[chIndex] = { ...btn.channels[chIndex], [key]: value };
    this._emit(cfg);
  }

  _addChannel(btnIndex) {
    const cfg = JSON.parse(JSON.stringify(this._config));
    const btn = cfg.entities[btnIndex];
    btn.channels = btn.channels ? [...btn.channels] : [];
    btn.channels.push({ name: '', logo: '', service: '' });
    this._emit(cfg);
  }

  _removeChannel(btnIndex, chIndex) {
    const cfg = JSON.parse(JSON.stringify(this._config));
    const btn = cfg.entities[btnIndex];
    btn.channels = (btn.channels || []).filter((_, i) => i !== chIndex);
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

  _optionChanged(btnIndex, optIndex, key, value) {
    const cfg = JSON.parse(JSON.stringify(this._config));
    const btn = cfg.entities[btnIndex];
    btn.options = btn.options ? [...btn.options] : [];
    btn.options[optIndex] = { ...btn.options[optIndex], [key]: value };
    this._emit(cfg);
  }

  _addOption(btnIndex) {
    const cfg = JSON.parse(JSON.stringify(this._config));
    const btn = cfg.entities[btnIndex];
    btn.options = btn.options ? [...btn.options] : [];
    btn.options.push({ option: '', name: '', icon: '' });
    this._emit(cfg);
  }

  _removeOption(btnIndex, optIndex) {
    const cfg = JSON.parse(JSON.stringify(this._config));
    const btn = cfg.entities[btnIndex];
    btn.options = (btn.options || []).filter((_, i) => i !== optIndex);
    this._emit(cfg);
  }

  _sensorChanged(index, key, value) {
    const cfg = JSON.parse(JSON.stringify(this._config));
    cfg.sensors = cfg.sensors ? [...cfg.sensors] : [];
    cfg.sensors[index] = { ...cfg.sensors[index], [key]: value };
    this._emit(cfg);
  }

  _addSensor() {
    const cfg = JSON.parse(JSON.stringify(this._config));
    cfg.sensors = cfg.sensors ? [...cfg.sensors] : [];
    cfg.sensors.push({ entity: '', prefix: '', unit: '' });
    this._emit(cfg);
  }

  _removeSensor(index) {
    const cfg = JSON.parse(JSON.stringify(this._config));
    cfg.sensors = (cfg.sensors || []).filter((_, i) => i !== index);
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
        <ha-expansion-panel outlined .expanded=${true} header="General">
          <div class="panel-body">
            ${this._text('Banner Name', this._config.name, (v) => this._topSet('name', v))}

            <div class="slider-row">
              <label>Banner name font size: <strong>${this._config.header_font_size ?? 18}px</strong></label>
              <ha-slider
                min="12" max="42" step="1"
                .value=${this._config.header_font_size ?? 18}
                @change=${(e) => this._topValue('header_font_size', parseInt(e.target.value, 10))}>
              </ha-slider>
            </div>

            <div class="slider-row">
              <label>Sensor text font size: <strong>${this._config.sensor_font_size ?? 15}px</strong></label>
              <ha-slider
                min="10" max="28" step="1"
                .value=${this._config.sensor_font_size ?? 15}
                @change=${(e) => this._topValue('sensor_font_size', parseInt(e.target.value, 10))}>
              </ha-slider>
            </div>

            <div class="slider-row">
              <label>Popup option font size: <strong>${this._config.popup_font_size ?? 12}px</strong></label>
              <ha-slider
                min="10" max="26" step="1"
                .value=${this._config.popup_font_size ?? 12}
                @change=${(e) => this._topValue('popup_font_size', parseInt(e.target.value, 10))}>
              </ha-slider>
            </div>

            <div class="slider-row">
              <label>Channel name font size: <strong>${this._config.channel_font_size ?? 11}px</strong></label>
              <ha-slider
                min="0" max="22" step="1"
                .value=${this._config.channel_font_size ?? 11}
                @change=${(e) => this._topValue('channel_font_size', parseInt(e.target.value, 10))}>
              </ha-slider>
            </div>
          </div>
        </ha-expansion-panel>

        <ha-expansion-panel outlined header="Images">
          <div class="panel-body">
            ${this._imageField('background_image', 'Background Image')}
            ${this._imageField('thumbnail', 'Thumbnail Image')}

            <div class="field-label">Header icon (replaces the thumbnail image when set)</div>
            <ha-icon-picker
              .value=${this._config.header_icon || ''}
              label="Header icon"
              @value-changed=${(e) => this._topValue('header_icon', e.detail.value)}>
            </ha-icon-picker>
          </div>
        </ha-expansion-panel>

        <ha-expansion-panel outlined header="Sensors (header strip)">
          <div class="panel-body">
            ${this._renderSensorsEditor()}
            <mwc-button raised class="add-btn" @click=${this._addSensor}>
              <ha-icon icon="mdi:plus"></ha-icon>&nbsp;Add Sensor
            </mwc-button>
          </div>
        </ha-expansion-panel>

        <ha-expansion-panel outlined header="Status / motion entities">
          <div class="panel-body">
            ${this._renderStatusEditor()}
            <mwc-button raised class="add-btn" @click=${this._addStatus}>
              <ha-icon icon="mdi:plus"></ha-icon>&nbsp;Add Status Entity
            </mwc-button>
          </div>
        </ha-expansion-panel>

        <ha-expansion-panel outlined header="Sub-buttons (small row above)">
          <div class="panel-body">
            ${(this._config.sub_buttons || []).map((ent, i) => this._renderSubButtonEditor(ent, i))}
            <mwc-button raised class="add-btn" @click=${this._addSub}>
              <ha-icon icon="mdi:plus"></ha-icon>&nbsp;Add Sub-button
            </mwc-button>
          </div>
        </ha-expansion-panel>

        <ha-expansion-panel outlined .expanded=${true} header="Buttons">
          <div class="panel-body">
            ${entities.map((ent, i) => this._renderButtonEditor(ent, i))}
            <mwc-button raised class="add-btn" @click=${this._addButton}>
              <ha-icon icon="mdi:plus"></ha-icon>&nbsp;Add Button
            </mwc-button>
          </div>
        </ha-expansion-panel>
      </div>
    `;
  }

  _renderSubButtonEditor(ent, i) {
    const actions = [
      { value: 'switch', label: 'Switch (toggle)' },
      { value: 'light', label: 'Light (toggle)' },
      { value: 'cover', label: 'Cover / blind (popup)' },
      { value: 'lock', label: 'Lock / door (popup)' },
      { value: 'power', label: 'Power (run script)' },
      { value: 'custom', label: 'Custom service call' },
      { value: 'info', label: 'Info (display only)' },
    ];
    return html`
      <ha-expansion-panel outlined class="item-panel"
        .header=${`Sub ${i + 1}${ent.name ? ' · ' + ent.name : ''}`}>
        <ha-icon-button slot="icons" label="Remove"
          @click=${(e) => { e.stopPropagation(); this._removeSub(i); }}>
          <ha-icon icon="mdi:delete"></ha-icon>
        </ha-icon-button>
        <div class="panel-body">
          <ha-entity-picker
            .hass=${this.hass}
            .value=${ent.entity || ''}
            label="Entity"
            allow-custom-entity
            @value-changed=${(e) => this._subChanged(i, 'entity', e.detail.value)}>
          </ha-entity-picker>
          <label class="tf">
            <span>Action</span>
            <select .value=${ent.type || 'switch'} @change=${(e) => this._subChanged(i, 'type', e.target.value)}>
              ${actions.map((a) => html`<option value=${a.value} ?selected=${(ent.type || 'switch') === a.value}>${a.label}</option>`)}
            </select>
          </label>
          ${this._text('Label (optional)', ent.name, (v) => this._subChanged(i, 'name', v))}
          <ha-icon-picker
            .value=${ent.icon || ''}
            label="Icon"
            @value-changed=${(e) => this._subChanged(i, 'icon', e.detail.value)}>
          </ha-icon-picker>
          <label class="noglow" style="font-size:0.8rem;">
            <input type="checkbox" .checked=${!!ent.show_state}
              @change=${(e) => this._subChanged(i, 'show_state', e.target.checked)} />
            Show entity state as the label
          </label>
          <div class="color-grid">
            ${this._glowField('Glow when ON', ent.glow_color, '#22c55e', (v) => this._subChanged(i, 'glow_color', v))}
            ${this._glowField('Glow when OFF', ent.glow_color_off, '#ef4444', (v) => this._subChanged(i, 'glow_color_off', v))}
          </div>
          ${ent.type === 'custom' ? html`
            ${this._text('Service (domain.service)', ent.service, (v) => this._subChanged(i, 'service', v))}
            <label class="tf">
              <span>Service data (YAML/JSON — optional)</span>
              <textarea rows="2" .value=${ent.service_data || ''}
                @input=${(e) => this._subChanged(i, 'service_data', e.target.value)}></textarea>
            </label>
          ` : ''}
        </div>
      </ha-expansion-panel>
    `;
  }

  _imageField(key, label) {
    const val = this._config[key] || '';
    return html`
      <div class="field-label">${label}</div>
      ${this._text('Image URL or /local path (e.g. /local/room.jpg)', val, (v) => this._topValue(key, v))}
      ${val
        ? html`
            <div class="img-current">Current: <code>${val}</code></div>
            <img class="img-preview" src=${val} alt="" @error=${(e) => { e.target.style.display = 'none'; }} />
          `
        : html`<div class="img-current">No image set. Type a URL above, or put a file in
            <code>config/www/</code> and reference it as <code>/local/&lt;file&gt;</code>.</div>`}
    `;
  }

  _renderStatusEditor() {
    const list = this._statusList();
    return html`
      ${list.map((eid, i) => html`
        <div class="scene-row">
          <div class="scene-row-header">
            <span>Status ${i + 1}</span>
            <ha-icon class="del" icon="mdi:delete" @click=${() => this._removeStatus(i)}></ha-icon>
          </div>
          <ha-entity-picker
            .hass=${this.hass}
            .value=${eid || ''}
            label="Status entity (any domain)"
            allow-custom-entity
            @value-changed=${(e) => this._statusChanged(i, e.detail.value)}>
          </ha-entity-picker>
        </div>
      `)}
    `;
  }

  // Normalise legacy single status_entity into the status_entities array.
  _statusList() {
    if (Array.isArray(this._config.status_entities)) return this._config.status_entities;
    if (this._config.status_entity) return [this._config.status_entity];
    return [];
  }

  _writeStatus(list) {
    const cfg = JSON.parse(JSON.stringify(this._config));
    delete cfg.status_entity;
    if (list.length) cfg.status_entities = list;
    else delete cfg.status_entities;
    this._emit(cfg);
  }

  _statusChanged(index, value) {
    const list = [...this._statusList()];
    list[index] = value;
    this._writeStatus(list.filter((v) => v));
  }

  _addStatus() {
    this._writeStatus([...this._statusList(), '']);
  }

  _removeStatus(index) {
    this._writeStatus(this._statusList().filter((_, i) => i !== index));
  }

  _renderSensorsEditor() {
    const sensors = this._config.sensors || [];
    return html`
      ${sensors.map((s, si) => html`
        <div class="scene-row">
          <div class="scene-row-header">
            <span>Sensor ${si + 1}</span>
            <ha-icon class="del" icon="mdi:delete" @click=${() => this._removeSensor(si)}></ha-icon>
          </div>
          <ha-entity-picker
            .hass=${this.hass}
            .value=${s.entity || ''}
            label="Entity (any domain — sensor, input_select, scene tracker, …)"
            allow-custom-entity
            @value-changed=${(e) => this._sensorChanged(si, 'entity', e.detail.value)}>
          </ha-entity-picker>
          ${this._text('Prefix (e.g. Temp:)', s.prefix, (v) => this._sensorChanged(si, 'prefix', v))}
          ${this._text("Unit (blank = use entity's)", s.unit, (v) => this._sensorChanged(si, 'unit', v))}
        </div>
      `)}
    `;
  }

  _renderButtonEditor(ent, i) {
    const actions = [
      { value: 'light', label: 'Light (toggle)' },
      { value: 'switch', label: 'Switch (toggle)' },
      { value: 'cover', label: 'Cover / blind (open/close/stop)' },
      { value: 'lock', label: 'Lock / door (lock/unlock popup)' },
      { value: 'select', label: 'Input select / select (options popup)' },
      { value: 'custom', label: 'Custom service call (YAML / advanced)' },
      { value: 'navigate', label: 'Navigate (open a dashboard / view)' },
      { value: 'popup', label: 'Card popup (show any Lovelace card)' },
      { value: 'audio', label: 'Media player (on/off + volume)' },
      { value: 'scene', label: 'Scene (picker popup)' },
      { value: 'power', label: 'Power (run script)' },
    ];
    return html`
      <ha-expansion-panel outlined class="item-panel"
        .header=${`Button ${i + 1}${ent.name ? ' · ' + ent.name : ''}`}>
        <ha-icon-button slot="icons" label="Remove button"
          @click=${(e) => { e.stopPropagation(); this._removeButton(i); }}>
          <ha-icon icon="mdi:delete"></ha-icon>
        </ha-icon-button>
        <div class="panel-body">

        <ha-entity-picker
          .hass=${this.hass}
          .value=${ent.entity || ''}
          label="Entity"
          allow-custom-entity
          @value-changed=${(e) => this._buttonChanged(i, 'entity', e.detail.value)}>
        </ha-entity-picker>

        <label class="tf">
          <span>Action</span>
          <select
            .value=${ent.type || 'light'}
            @change=${(e) => this._buttonChanged(i, 'type', e.target.value)}>
            ${actions.map((a) => html`
              <option value=${a.value} ?selected=${(ent.type || 'light') === a.value}>${a.label}</option>
            `)}
          </select>
        </label>

        ${this._text('Name', ent.name, (v) => this._buttonChanged(i, 'name', v))}

        <ha-icon-picker
          .value=${ent.icon || ''}
          label="Icon"
          @value-changed=${(e) => this._buttonChanged(i, 'icon', e.detail.value)}>
        </ha-icon-picker>

        <div class="slider-row">
          <label>Name font size: <strong>${ent.font_size ?? 11}px</strong></label>
          <ha-slider
            min="8" max="20" step="1"
            .value=${ent.font_size ?? 11}
            @change=${(e) => this._buttonChanged(i, 'font_size', parseInt(e.target.value, 10))}>
          </ha-slider>
        </div>

        <div class="color-grid">
          ${this._colorField('Background', ent.background_color, '#1e1e1e', (v) => this._buttonChanged(i, 'background_color', v))}
          ${this._colorField('Edge color', ent.border_color, '#808080', (v) => this._buttonChanged(i, 'border_color', v))}
          ${this._glowField('Glow when ON', ent.glow_color, '#22c55e', (v) => this._buttonChanged(i, 'glow_color', v))}
          ${this._glowField('Glow when OFF', ent.glow_color_off, '#ef4444', (v) => this._buttonChanged(i, 'glow_color_off', v))}
        </div>
        <div class="hint">
          Leave a glow colour matching the edge colour to effectively disable
          that state's glow. Glow reflects the entity's on/off state.
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
        ${ent.type === 'select' ? this._renderOptionsEditor(ent, i) : ''}
        ${ent.type === 'custom' ? this._renderCustomEditor(ent, i) : ''}
        ${ent.type === 'navigate' ? this._text('Navigation path (e.g. /dashboard-dash2/utilities)', ent.navigation_path, (v) => this._buttonChanged(i, 'navigation_path', v)) : ''}
        ${ent.type === 'popup' ? html`
          <div class="hint">
            Opens a full-screen popup containing any Lovelace card. Define the
            content under a <code>card:</code> key on this button in
            <strong>YAML mode</strong> (Show code editor) — e.g. a
            <code>vertical-stack</code> with markdown, mushroom, gauges, etc.
            ${ent.card ? html`<br />✅ A <code>card:</code> config is set.` : html`<br />⚠ No <code>card:</code> set yet.`}
          </div>
        ` : ''}
        ${ent.type === 'audio' ? this._renderChannelsEditor(ent, i) : ''}
        </div>
      </ha-expansion-panel>
    `;
  }

  _renderChannelsEditor(ent, btnIndex) {
    const channels = ent.channels || [];
    return html`
      <div class="scenes-editor">
        <div class="be-subtitle">Channel shortcuts (shown in the media popup)</div>
        ${channels.map((c, ci) => html`
          <div class="scene-row">
            <div class="scene-row-header">
              <span>Channel ${ci + 1}</span>
              <ha-icon class="del" icon="mdi:delete" @click=${() => this._removeChannel(btnIndex, ci)}></ha-icon>
            </div>
            ${this._text('Name', c.name, (v) => this._channelChanged(btnIndex, ci, 'name', v))}
            ${this._text('Logo image URL / path (e.g. /local/logos/dstv.png)', c.logo, (v) => this._channelChanged(btnIndex, ci, 'logo', v))}
            ${c.logo ? html`<img class="img-preview" src=${c.logo} alt="" @error=${(e) => { e.target.style.display = 'none'; }} />` : ''}
            ${this._text('Service to run (e.g. script.tv_switch_to_atv)', c.service, (v) => this._channelChanged(btnIndex, ci, 'service', v))}
            <ha-entity-picker
              .hass=${this.hass}
              .value=${c.entity || ''}
              label="Target entity (optional — sent as entity_id)"
              allow-custom-entity
              @value-changed=${(e) => this._channelChanged(btnIndex, ci, 'entity', e.detail.value)}>
            </ha-entity-picker>
            <label class="tf">
              <span>Extra service data (YAML/JSON — optional)</span>
              <textarea rows="2" placeholder="source: HDMI 1"
                .value=${c.service_data || ''}
                @input=${(e) => this._channelChanged(btnIndex, ci, 'service_data', e.target.value)}></textarea>
            </label>
            <div class="hint">
              Simplest: set <strong>Service</strong> to the script itself
              (<code>script.tv_switch_to_atv</code>) and leave the rest blank.
              Or use <code>script.turn_on</code> + pick the script as the target entity.
            </div>
          </div>
        `)}
        <mwc-button outlined class="add-scene" @click=${() => this._addChannel(btnIndex)}>
          <ha-icon icon="mdi:plus"></ha-icon>&nbsp;Add Channel
        </mwc-button>
      </div>
    `;
  }

  _renderCustomEditor(ent, btnIndex) {
    const svc = ent.service || '';
    const badService = svc.length > 0 && svc.indexOf('.') < 1;
    return html`
      <div class="scenes-editor">
        <div class="be-subtitle">Custom service call (runs on tap)</div>
        <div class="hint">
          Set the <strong>Entity</strong> field above to the thing you want to
          control — it is sent as <code>entity_id</code> and drives the on/off
          colour. Then give a full <code>domain.service</code> below.
        </div>
        ${this._text('Service — must be domain.service (e.g. switch.toggle, irrigation_unlimited.toggle)', ent.service, (v) => this._buttonChanged(btnIndex, 'service', v))}
        ${badService ? html`<div class="warn">⚠ "${svc}" is missing the domain. Use something like <code>switch.toggle</code>.</div>` : ''}
        <label class="tf">
          <span>Extra service data (YAML or JSON — optional; leave blank to just target the entity)</span>
          <textarea
            rows="3"
            placeholder="brightness: 200&#10;color_name: red"
            .value=${ent.service_data || ''}
            @input=${(e) => this._buttonChanged(btnIndex, 'service_data', e.target.value)}></textarea>
        </label>
      </div>
    `;
  }

  _renderOptionsEditor(ent, btnIndex) {
    const options = ent.options || [];
    return html`
      <div class="scenes-editor">
        <div class="be-subtitle">
          Options (leave empty to auto-use the entity's own options)
        </div>
        ${options.map((o, oi) => html`
          <div class="scene-row">
            <div class="scene-row-header">
              <span>Option ${oi + 1}</span>
              <ha-icon class="del" icon="mdi:delete" @click=${() => this._removeOption(btnIndex, oi)}></ha-icon>
            </div>
            ${this._text('Option value (must match the helper)', o.option, (v) => this._optionChanged(btnIndex, oi, 'option', v))}
            ${this._text('Label (blank = use value)', o.name, (v) => this._optionChanged(btnIndex, oi, 'name', v))}
            <ha-icon-picker
              .value=${o.icon || ''}
              label="Icon"
              @value-changed=${(e) => this._optionChanged(btnIndex, oi, 'icon', e.detail.value)}>
            </ha-icon-picker>
          </div>
        `)}
        <mwc-button outlined class="add-scene" @click=${() => this._addOption(btnIndex)}>
          <ha-icon icon="mdi:plus"></ha-icon>&nbsp;Add Option
        </mwc-button>
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
            ${this._text('Label', s.name, (v) => this._sceneChanged(btnIndex, si, 'name', v))}
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

  // Like a colour field, but with a "No glow" checkbox (empty value = no glow).
  _glowField(label, value, fallback, onChange) {
    const none = !value;
    return html`
      <div class="color-field">
        <label>${label}</label>
        <input type="color" .value=${value || fallback} ?disabled=${none}
          @input=${(e) => onChange(e.target.value)} />
        <label class="noglow">
          <input type="checkbox" .checked=${none}
            @change=${(e) => onChange(e.target.checked ? '' : fallback)} />
          No glow
        </label>
      </div>
    `;
  }

  static get styles() {
    return css`
      .form {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 16px;
      }
      ha-expansion-panel {
        --expansion-panel-content-padding: 0;
        border-radius: 8px;
        --ha-card-border-radius: 8px;
      }
      ha-expansion-panel[outlined] {
        margin-bottom: 0;
      }
      .panel-body {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 12px;
      }
      .item-panel {
        margin-top: 4px;
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
        grid-template-columns: repeat(2, 1fr);
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
      .color-field input[type="color"]:disabled {
        opacity: 0.35;
        cursor: not-allowed;
      }
      .noglow {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.72rem;
        color: var(--secondary-text-color);
        cursor: pointer;
      }
      .noglow input {
        width: auto;
        margin: 0;
        cursor: pointer;
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
      .tf {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .tf > span {
        font-size: 0.8rem;
        color: var(--secondary-text-color);
      }
      .tf input,
      .tf select,
      .tf textarea {
        width: 100%;
        box-sizing: border-box;
        padding: 10px 12px;
        background: var(--secondary-background-color, rgba(127, 127, 127, 0.1));
        color: var(--primary-text-color);
        border: 1px solid var(--divider-color, #555);
        border-radius: 6px;
        font-size: 0.95rem;
      }
      .tf textarea {
        font-family: var(--code-font-family, monospace);
        resize: vertical;
      }
      .tf select {
        appearance: auto;
        cursor: pointer;
      }
      .tf input:focus,
      .tf select:focus,
      .tf textarea:focus {
        outline: none;
        border-color: var(--primary-color, #3b82f6);
      }
      .field-label {
        font-size: 0.85rem;
        color: var(--secondary-text-color);
        margin-bottom: -8px;
      }
      .img-current {
        font-size: 0.75rem;
        color: var(--secondary-text-color);
        word-break: break-all;
      }
      .img-current code {
        color: var(--primary-text-color);
      }
      .img-preview {
        width: 100%;
        max-height: 120px;
        object-fit: cover;
        border-radius: 8px;
        border: 1px solid var(--divider-color, #444);
      }
      .add-btn {
        margin-top: 4px;
      }
      .hint {
        font-size: 0.8rem;
        color: var(--secondary-text-color);
        margin-top: 8px;
      }
      .warn {
        font-size: 0.8rem;
        color: var(--error-color, #f87171);
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
    if (this._modalCard) this._modalCard.hass = hass;
  }

  disconnectedCallback() {
    if (super.disconnectedCallback) super.disconnectedCallback();
    this._closeCardPopup();
  }

  // Full-screen modal that renders any Lovelace card config (ent.card) using
  // HA's own card helpers. Portaled to <body> so complex stacks aren't clipped
  // by the card, and needs no browser_mod / card-mod for the popup itself.
  async _openCardPopup(ent) {
    if (!ent.card || !this._hass) return;
    this._closeCardPopup();

    const helpers = await window.loadCardHelpers();
    const card = helpers.createCardElement(ent.card);
    card.hass = this._hass;

    const overlay = document.createElement('div');
    overlay.style.cssText =
      'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;' +
      'background:rgba(0,0,0,0.65);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);';

    const box = document.createElement('div');
    box.style.cssText =
      'width:min(720px,94vw);max-height:90vh;overflow:auto;position:relative;' +
      'background:var(--ha-card-background,var(--card-background-color,#1c1c1c));' +
      'border-radius:18px;padding:16px;box-shadow:0 12px 48px rgba(0,0,0,0.6);';

    if (ent.name) {
      const title = document.createElement('div');
      title.textContent = ent.name;
      title.style.cssText = 'font-weight:700;font-size:1.1rem;margin:0 40px 12px 4px;color:var(--primary-text-color);';
      box.appendChild(title);
    }

    const close = document.createElement('button');
    close.innerHTML = '&times;';
    close.setAttribute('aria-label', 'Close');
    close.style.cssText =
      'position:absolute;top:10px;right:12px;width:32px;height:32px;border:none;border-radius:50%;' +
      'background:rgba(127,127,127,0.25);color:var(--primary-text-color);font-size:20px;line-height:1;cursor:pointer;';
    close.addEventListener('click', () => this._closeCardPopup());

    box.appendChild(card);
    box.appendChild(close);
    overlay.appendChild(box);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) this._closeCardPopup(); });

    this._modalKeyHandler = (e) => { if (e.key === 'Escape') this._closeCardPopup(); };
    window.addEventListener('keydown', this._modalKeyHandler);

    document.body.appendChild(overlay);
    this._modalOverlay = overlay;
    this._modalCard = card;
  }

  _closeCardPopup() {
    if (this._modalKeyHandler) {
      window.removeEventListener('keydown', this._modalKeyHandler);
      this._modalKeyHandler = null;
    }
    if (this._modalOverlay) {
      this._modalOverlay.remove();
      this._modalOverlay = null;
      this._modalCard = null;
    }
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
      status_entities: ["binary_sensor.living_room_motion"],
      sensors: [
        { entity: "sensor.living_room_co2", prefix: "CO2:", unit: "ppm" },
        { entity: "sensor.living_room_humidity", prefix: "Hum:", unit: "%" }
      ],
      entities: [
        { type: "light", entity: "light.living_room_main", name: "Main Light", icon: "mdi:lightbulb", background_color: "#1e1e1e", glow_color: "#facc15", border_color: "#808080", border_radius: 16 },
        { type: "audio", entity: "media_player.living_room_speaker", name: "Speaker", icon: "mdi:speaker", background_color: "#1e1e1e", glow_color: "#22d3ee", border_color: "#808080", border_radius: 16 },
        { type: "scene", name: "Scenes", icon: "mdi:palette", background_color: "#1e1e1e", glow_color: "#a855f7", border_color: "#808080", border_radius: 16, scenes: [{ entity: "scene.movie_mode", name: "Movie" }] },
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

  // Custom button: call any service with optional YAML/JSON data.
  _runCustom(ent) {
    if (!ent.service || !this._hass) return;
    const dot = ent.service.indexOf('.');
    if (dot < 1) return;
    const domain = ent.service.slice(0, dot);
    const service = ent.service.slice(dot + 1);
    const data = this._parseData(ent.service_data);
    const payload = { ...data };
    if (ent.entity && payload.entity_id === undefined && payload.target === undefined) {
      payload.entity_id = ent.entity;
    }
    this._hass.callService(domain, service, payload);
  }

  // Channel tile in the media popup: runs its service (e.g. a script).
  _runChannel(c) {
    if (!c || !c.service || !this._hass) return;
    const dot = c.service.indexOf('.');
    if (dot < 1) return;
    const domain = c.service.slice(0, dot);
    const service = c.service.slice(dot + 1);
    const payload = { ...this._parseData(c.service_data) };
    if (c.entity && payload.entity_id === undefined && payload.target === undefined) {
      payload.entity_id = c.entity;
    }
    this._hass.callService(domain, service, payload);
  }

  // Native Home Assistant navigation (no browser_mod / card-mod needed).
  _navigate(path) {
    if (!path) return;
    history.pushState(null, '', path);
    window.dispatchEvent(new Event('location-changed'));
  }

  // Parse JSON, or a simple flat "key: value" YAML, into an object.
  _parseData(text) {
    const t = (text || '').trim();
    if (!t) return {};
    try { return JSON.parse(t); } catch (e) { /* fall through to YAML */ }
    const obj = {};
    t.split('\n').forEach((line) => {
      const idx = line.indexOf(':');
      if (idx === -1) return;
      const k = line.slice(0, idx).trim();
      let v = line.slice(idx + 1).trim();
      if (!k) return;
      if (v === 'true') v = true;
      else if (v === 'false') v = false;
      else if (v !== '' && !isNaN(Number(v))) v = Number(v);
      else v = v.replace(/^["']|["']$/g, '');
      obj[k] = v;
    });
    return obj;
  }

  // Per-button inline styling from the visual editor (background, edge, glow).
  _buttonStyle(ent, isActive) {
    // Single source of truth for button colours so nothing in CSS overrides
    // a user's chosen background/edge/glow.
    const bg = ent.background_color || 'rgba(0,0,0,0.5)';
    // Two-state glow: glow_color when active/on, glow_color_off when inactive.
    const glow = isActive ? ent.glow_color : ent.glow_color_off;
    const edge = glow || ent.border_color || '#808080';
    const parts = [`background:${bg}`, `border-color:${edge}`];
    if (ent.border_radius !== undefined && ent.border_radius !== null && ent.border_radius !== '') {
      parts.push(`border-radius:${ent.border_radius}px`);
    }
    parts.push(glow ? `box-shadow:0 0 15px ${glow}` : 'box-shadow:none');
    if (ent.font_size) parts.push(`--btn-label-size:${ent.font_size}px`);
    return parts.join(';');
  }

  _togglePopup(kind, ent) {
    const cur = this._activePopup;
    if (cur && cur.kind === kind && cur.ent === ent) {
      this._activePopup = null;
    } else {
      this._activePopup = { kind, ent };
    }
  }

  _renderStatusIcons() {
    const statusList = Array.isArray(this._config.status_entities)
      ? this._config.status_entities
      : (this._config.status_entity ? [this._config.status_entity] : []);

    const INACTIVE = ['off', 'closed', 'idle', 'standby', 'paused', 'unavailable', 'unknown', 'none', 'not_home', 'locked', 'disarmed', '0', ''];
    const DOMAIN_ICONS = {
      binary_sensor: 'mdi:motion-sensor',
      media_player: 'mdi:cast',
      light: 'mdi:lightbulb',
      switch: 'mdi:toggle-switch',
      cover: 'mdi:window-shutter',
      lock: 'mdi:lock',
      fan: 'mdi:fan',
      climate: 'mdi:thermostat',
      person: 'mdi:account',
      device_tracker: 'mdi:account',
      sensor: 'mdi:eye',
    };

    return statusList
      .filter((eid) => eid)
      .map((eid) => {
        const s = this._hass.states[eid];
        const active = s && !INACTIVE.includes(String(s.state).toLowerCase());
        const domain = eid.split('.')[0];
        const icon = (s && s.attributes && s.attributes.icon) || DOMAIN_ICONS[domain] || 'mdi:circle-outline';
        return html`
          <div class="status-icon ${active ? 'active' : ''}" title=${eid}>
            <ha-icon icon=${icon}></ha-icon>
          </div>
        `;
      });
  }

  render() {
    if (!this._config || !this._hass) return html``;

    const { name, background_image, thumbnail, header_icon, entities, header_font_size } = this._config;

    const entityCount = entities.length;
    const gridClass = entityCount > 5 ? 'grid-double-row' : 'grid-single-row';

    const styleVars = [];
    if (header_font_size) styleVars.push(`--room-title-font-size:${header_font_size}px`);
    if (this._config.sensor_font_size) styleVars.push(`--sensor-font-size:${this._config.sensor_font_size}px`);
    if (this._config.popup_font_size) styleVars.push(`--popup-font-size:${this._config.popup_font_size}px`);
    if (this._config.channel_font_size) styleVars.push(`--channel-font-size:${this._config.channel_font_size}px`);
    const containerStyle = styleVars.join(';');

    return html`
      <div class="card-container" style=${containerStyle}>
        <div class="bg-image" style="background-image: url('${background_image}');"></div>
        
        <div class="header">
          ${header_icon
            ? html`<div class="thumb thumb-icon"><ha-icon icon=${header_icon}></ha-icon></div>`
            : html`<div class="thumb" style="background-image: url('${thumbnail || background_image}');"></div>`}
          <div class="header-text">
            <div class="title">${name}</div>
            <div class="subtitle">${this._getSensorString()}</div>
          </div>
          <div class="status-icons">
            ${this._renderStatusIcons()}
          </div>
        </div>

        ${(this._config.sub_buttons && this._config.sub_buttons.length)
          ? html`<div class="sub-grid">${this._config.sub_buttons.map(b => this._renderSubButton(b))}</div>`
          : ''}

        <div class="controls-grid ${gridClass}">
          ${entities.map(ent => this._renderButton(ent))}
        </div>

        ${this._renderPopup()}
      </div>
    `;
  }

  // Resolve a button config into { icon, label, isActive, action }.
  _resolveButton(ent) {
    const stateObj = ent.entity ? this._hass.states[ent.entity] : null;
    let isActive = false;
    let icon = ent.icon || 'mdi:help-circle';
    const label = ent.name || (stateObj ? stateObj.attributes.friendly_name : 'Unknown');
    let action = () => {};
    const onStates = ['on', 'open', 'active', 'running', 'cleaning', 'playing', 'home', 'heat', 'cool', 'unlocked'];

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
      action = () => this._togglePopup('audio', ent);
    } else if (ent.type === 'custom') {
      isActive = stateObj && onStates.includes(String(stateObj.state).toLowerCase());
      icon = ent.icon || 'mdi:gesture-tap-button';
      action = () => this._runCustom(ent);
    } else if (ent.type === 'cover') {
      isActive = stateObj && (stateObj.state === 'open' || stateObj.state === 'opening' ||
        (stateObj.attributes && stateObj.attributes.current_position > 0));
      icon = ent.icon || 'mdi:window-shutter';
      action = () => this._togglePopup('cover', ent);
    } else if (ent.type === 'lock') {
      isActive = stateObj && stateObj.state === 'unlocked';
      icon = ent.icon || (isActive ? 'mdi:lock-open-variant' : 'mdi:lock');
      action = () => this._togglePopup('lock', ent);
    } else if (ent.type === 'select') {
      icon = ent.icon || 'mdi:format-list-bulleted';
      action = () => this._togglePopup('select', ent);
    } else if (ent.type === 'scene') {
      icon = ent.icon || 'mdi:palette';
      action = () => this._togglePopup('scene', ent);
    } else if (ent.type === 'power') {
      icon = ent.icon || 'mdi:power';
      action = () => this._handleClick(ent.entity, 'script', 'turn_on');
    } else if (ent.type === 'info') {
      isActive = stateObj && onStates.includes(String(stateObj.state).toLowerCase());
      icon = ent.icon || 'mdi:information-outline';
      action = () => {};
    } else if (ent.type === 'navigate') {
      isActive = stateObj && onStates.includes(String(stateObj.state).toLowerCase());
      icon = ent.icon || 'mdi:open-in-app';
      action = () => this._navigate(ent.navigation_path);
    } else if (ent.type === 'popup') {
      isActive = stateObj && onStates.includes(String(stateObj.state).toLowerCase());
      icon = ent.icon || 'mdi:card-text-outline';
      action = () => this._openCardPopup(ent);
    }

    // Also honour a standard tap_action: navigate (works on any button type).
    if (ent.tap_action && ent.tap_action.action === 'navigate' && ent.tap_action.navigation_path) {
      action = () => this._navigate(ent.tap_action.navigation_path);
    }

    return { icon, label, isActive, action, isPower: ent.type === 'power' };
  }

  _renderButton(ent) {
    const { icon, label, isActive, action, isPower } = this._resolveButton(ent);
    const cls = isPower ? 'btn power-btn' : `btn ${isActive ? 'active' : ''} ${ent.type}`;
    return html`
      <div class="${cls}" style=${this._buttonStyle(ent, isPower ? false : isActive)} @click=${action}>
        <ha-icon icon=${icon}></ha-icon>
        <span class="btn-label">${label}</span>
      </div>
    `;
  }

  // Small pill button for the optional row above the main buttons.
  _renderSubButton(ent) {
    const { icon, isActive, action } = this._resolveButton(ent);
    const stateObj = ent.entity ? this._hass.states[ent.entity] : null;
    let label = ent.name || '';
    if (ent.show_state && stateObj) {
      const unit = stateObj.attributes.unit_of_measurement || '';
      label = `${stateObj.state}${unit ? ' ' + unit : ''}`;
    }
    return html`
      <div class="sub-btn ${isActive ? 'active' : ''}" style=${this._subButtonStyle(ent, isActive)} @click=${action}>
        <ha-icon icon=${icon}></ha-icon>
        ${label ? html`<span>${label}</span>` : ''}
      </div>
    `;
  }

  _subButtonStyle(ent, isActive) {
    const glow = isActive ? ent.glow_color : ent.glow_color_off;
    const parts = [];
    if (ent.background_color) parts.push(`background:${ent.background_color}`);
    if (glow) {
      parts.push(`border-color:${glow}`);
      parts.push(`box-shadow:0 0 8px ${glow}`);
      parts.push(`color:${glow}`);
    }
    return parts.join(';');
  }

  _renderPopup() {
    if (!this._activePopup) return html``;

    const { kind, ent } = this._activePopup;
    let content = html``;
    let title = (ent && ent.name) || '';

    if (kind === 'audio') {
      const st = ent ? this._hass.states[ent.entity] : null;
      const isMuted = st && st.attributes.is_volume_muted;
      const isOn = st && !['off', 'standby', 'unavailable', 'unknown'].includes(String(st.state).toLowerCase());
      const vol = (st && st.attributes.volume_level != null) ? Math.round(st.attributes.volume_level * 100) + '%' : '';
      title = (ent && ent.name) || 'Media Control';
      content = html`
        <div class="popup-status">${st ? st.state : 'unavailable'}${vol ? ' · ' + vol : ''}</div>
        <div class="popup-row">
          <div class="popup-btn ${isOn ? 'on' : ''}"
               @click=${() => this._handleClick(ent.entity, 'media_player', 'toggle')}>
            <ha-icon icon="mdi:power"></ha-icon>
          </div>
          <div class="popup-btn" @click=${() => this._handleClick(ent.entity, 'media_player', 'volume_down')}>
            <ha-icon icon="mdi:volume-minus"></ha-icon>
          </div>
          <div class="popup-btn" @click=${() => this._handleClick(ent.entity, 'media_player', 'volume_up')}>
            <ha-icon icon="mdi:volume-plus"></ha-icon>
          </div>
          <div class="popup-btn ${isMuted ? 'active' : ''}"
               @click=${() => this._handleClick(ent.entity, 'media_player', 'volume_mute', { is_volume_muted: !isMuted })}>
            <ha-icon icon="${isMuted ? 'mdi:volume-off' : 'mdi:volume-mute'}"></ha-icon>
          </div>
        </div>
        ${(ent.channels && ent.channels.length) ? html`
          <div class="popup-channels">
            ${ent.channels.map(c => html`
              <div class="popup-channel" @click=${() => this._runChannel(c)} title=${c.name || ''}>
                ${c.logo
                  ? html`<img src=${c.logo} alt=${c.name || ''} @error=${(e) => { e.target.style.display = 'none'; }} />`
                  : html`<ha-icon icon=${c.icon || 'mdi:television'}></ha-icon>`}
                ${c.name ? html`<span>${c.name}</span>` : ''}
              </div>
            `)}
          </div>
        ` : ''}
      `;
    } else if (kind === 'cover') {
      title = (ent && ent.name) || 'Cover';
      content = html`
        <div class="popup-row">
          <div class="popup-btn" @click=${() => this._handleClick(ent.entity, 'cover', 'open_cover')}>
            <ha-icon icon="mdi:arrow-up"></ha-icon>
          </div>
          <div class="popup-btn" @click=${() => this._handleClick(ent.entity, 'cover', 'stop_cover')}>
            <ha-icon icon="mdi:stop"></ha-icon>
          </div>
          <div class="popup-btn" @click=${() => this._handleClick(ent.entity, 'cover', 'close_cover')}>
            <ha-icon icon="mdi:arrow-down"></ha-icon>
          </div>
        </div>
      `;
    } else if (kind === 'lock') {
      const st = ent ? this._hass.states[ent.entity] : null;
      const state = st ? String(st.state).toLowerCase() : '';
      title = (ent && ent.name) || 'Lock';
      content = html`
        <div class="popup-status">${st ? st.state : 'unavailable'}</div>
        <div class="popup-row">
          <div class="popup-btn ${state === 'locked' ? 'on' : ''}"
               @click=${() => this._handleClick(ent.entity, 'lock', 'lock')}>
            <ha-icon icon="mdi:lock"></ha-icon>
          </div>
          <div class="popup-btn ${state === 'unlocked' ? 'active' : ''}"
               @click=${() => this._handleClick(ent.entity, 'lock', 'unlock')}>
            <ha-icon icon="mdi:lock-open-variant"></ha-icon>
          </div>
        </div>
      `;
    } else if (kind === 'select') {
      const st = ent ? this._hass.states[ent.entity] : null;
      const current = st ? st.state : null;
      const domain = (ent.entity || '').split('.')[0] || 'input_select';
      // Use the configured options if any, else the entity's own options.
      const opts = (ent.options && ent.options.length)
        ? ent.options
        : (((st && st.attributes && st.attributes.options) || []).map(o => ({ option: o })));
      title = (ent && ent.name) || 'Select';
      content = html`
        <div class="popup-scene-list">
          ${opts.map(o => {
            const val = o.option;
            const lbl = o.name || o.option;
            return html`
              <div class="popup-scene-item ${current === val ? 'current' : ''}"
                   @click=${() => { this._handleClick(ent.entity, domain, 'select_option', { option: val }); this._activePopup = null; }}>
                ${o.icon ? html`<ha-icon icon=${o.icon}></ha-icon>` : ''}
                <span>${lbl}</span>
              </div>
            `;
          })}
        </div>
      `;
    } else if (kind === 'scene') {
      title = (ent && ent.name) || 'Scenes';
      content = html`
        <div class="popup-scene-list">
          ${(ent && ent.scenes ? ent.scenes : []).map(s => {
            const domain = (s.entity || '').split('.')[0] || 'scene';
            return html`
              <div class="popup-scene-item"
                   @click=${() => { this._handleClick(s.entity, domain, 'turn_on'); this._activePopup = null; }}>
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
      .thumb-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.12);
      }
      .thumb-icon ha-icon {
        --mdc-icon-size: 26px;
        color: #fff;
      }

      .header-text {
        flex: 1;
        min-width: 0;
        /* Banner name and sensor data sit on one row, sensors a fixed
           distance to the right of the name (regardless of name font size). */
        display: flex;
        align-items: baseline;
        column-gap: 18px;
        row-gap: 2px;
        flex-wrap: wrap;
      }

      .title {
        font-size: var(--room-title-font-size, 1.1rem);
        font-weight: 700;
        letter-spacing: -0.2px;
        text-shadow: 0 1px 3px rgba(0,0,0,0.5);
        flex-shrink: 0;
      }

      .subtitle {
        font-size: var(--sensor-font-size, 0.95rem);
        font-weight: 600;
        opacity: 0.9;
        white-space: normal;
        overflow-wrap: anywhere;
        line-height: 1.3;
        text-shadow: 0 1px 3px rgba(0,0,0,0.5);
      }

      .status-icons {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
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

      /* Optional thin row of small buttons above the main grid. */
      .sub-grid {
        position: relative;
        z-index: 1;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
        padding: 8px 16px 0;
      }
      .sub-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        height: 30px;
        padding: 0 11px;
        background: rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.18);
        border-radius: 15px;
        backdrop-filter: blur(4px);
        cursor: pointer;
        color: rgba(255, 255, 255, 0.9);
        font-size: 0.6rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.4px;
        white-space: nowrap;
        transition: transform 0.15s ease, box-shadow 0.2s ease, border-color 0.2s ease;
      }
      .sub-btn ha-icon { --mdc-icon-size: 16px; }
      .sub-btn:active { transform: scale(0.94); }

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
        font-size: var(--btn-label-size, 0.7rem);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        opacity: 0.8;
      }

      /* Button colours (background / edge / glow) are driven entirely by the
         per-button inline style from _buttonStyle, so there are no class-based
         colour rules here that could override the user's choices. */

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

      .popup-status {
        text-align: center;
        font-size: 0.8rem;
        opacity: 0.8;
        margin-bottom: 14px;
        text-transform: capitalize;
      }

      .popup-channels {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
        margin-top: 16px;
      }
      .popup-channel {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        width: 96px;
        height: 64px;
        padding: 6px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 10px;
        cursor: pointer;
        overflow: hidden;
        transition: background 0.15s ease, transform 0.15s ease;
      }
      .popup-channel:hover { background: rgba(255, 255, 255, 0.16); }
      .popup-channel:active { transform: scale(0.95); }
      /* Logo fills the whole tile (minus the optional name caption). */
      .popup-channel img {
        width: 100%;
        flex: 1 1 auto;
        min-height: 0;
        object-fit: contain;
      }
      .popup-channel ha-icon {
        flex: 1 1 auto;
        --mdc-icon-size: 34px;
        display: flex;
        align-items: center;
      }
      .popup-channel span {
        flex: 0 0 auto;
        font-size: var(--channel-font-size, 0.68rem);
        line-height: 1.1;
        text-align: center;
        max-width: 100%;
        overflow-wrap: anywhere;
      }

      .popup-row {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
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
      .popup-btn.on {
        background: rgba(74, 222, 128, 0.22);
        color: #4ade80;
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
        min-width: 68px;
        max-width: 150px;
        min-height: 64px;
        padding: 8px 10px;
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 12px;
        cursor: pointer;
        transition: background 0.15s ease, transform 0.15s ease;
      }
      .popup-scene-item:hover { background: rgba(255,255,255,0.16); }
      .popup-scene-item:active { transform: scale(0.95); }
      .popup-scene-item.current {
        background: rgba(74, 222, 128, 0.22);
        border-color: #4ade80;
        color: #4ade80;
      }
      .popup-scene-item ha-icon { --mdc-icon-size: 22px; }
      .popup-scene-item span {
        font-size: var(--popup-font-size, 0.7rem);
        line-height: 1.15;
        text-align: center;
        max-width: 100%;
        overflow-wrap: anywhere;
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
