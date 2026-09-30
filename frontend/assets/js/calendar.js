/* ============================================================
   CALENDAR.JS — Calendar Module
   ============================================================ */

const Calendar = (() => {
  let _year = new Date().getFullYear();
  let _month = new Date().getMonth();
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const TYPE_COLORS = { meeting:'cal-event-meeting', deadline:'cal-event-deadline', payment:'cal-event-payment', renewal:'cal-event-renewal', event:'cal-event-event' };
  const TYPE_ICONS  = { meeting:'🤝', deadline:'⏰', payment:'💰', renewal:'🔄', event:'📅' };

  function renderPage() {
    Utils.renderPage(`
      ${UI.buildBreadcrumb([{label:'Dashboard',href:'#dashboard',page:'dashboard'},{label:'Calendar'}])}
      <div class="page-header">
        <div class="page-header-left"><h1 class="page-title">Calendar</h1>
          <p class="page-subtitle">Schedule and track your business events</p></div>
        <div class="page-header-right">
          <button class="btn btn-secondary btn-sm" onclick="Calendar.goToday()">Today</button>
          <button class="btn btn-primary" onclick="Calendar.openCreateModal()">+ New Event</button>
        </div>
      </div>
      <div class="calendar-layout">
        <div class="calendar-main" id="calendarMain"></div>
        <div>
          <div class="calendar-sidebar-widget" id="upcomingWidget">
            <div class="widget-header"><div class="widget-title"><span class="widget-title-icon">📅</span>Upcoming Events</div></div>
            <div class="widget-body" id="upcomingEvents"></div>
          </div>
          <div class="calendar-sidebar-widget" style="margin-top:16px;">
            <div class="widget-header"><div class="widget-title"><span class="widget-title-icon">🎨</span>Event Types</div></div>
            <div class="widget-body">
              ${Object.entries(TYPE_ICONS).map(([type,icon]) => `
                <div style="display:flex;align-items:center;gap:10px;padding:6px 0;font-size:var(--text-sm);color:var(--text-secondary);">
                  <span>${icon}</span>
                  <span class="calendar-event ${TYPE_COLORS[type]}" style="padding:2px 8px;">${Utils.titleCase(type)}</span>
                </div>`).join('')}
            </div>
          </div>
        </div>
      </div>
    `);
    renderCalendar();
    renderUpcoming();
  }

  function renderCalendar() {
    const container = document.getElementById('calendarMain');
    if (!container) return;
    const events = Storage.getAll('events');
    const firstDay = new Date(_year, _month, 1).getDay();
    const daysInMonth = new Date(_year, _month + 1, 0).getDate();
    const today = new Date(); const todayStr = Utils.todayISO();

    let cells = '';
    // Leading empty cells
    for (let i = 0; i < firstDay; i++) cells += `<div class="calendar-cell other-month"></div>`;
    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${_year}-${String(_month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const dayEvents = events.filter(e => e.date === dateStr);
      const isToday = dateStr === todayStr;
      cells += `
        <div class="calendar-cell ${isToday?'today':''}" onclick="Calendar.openCreateModal('${dateStr}')">
          <div class="calendar-date">${d}</div>
          ${dayEvents.slice(0,3).map(e => `
            <div class="calendar-event ${TYPE_COLORS[e.type]||'cal-event-event'}" onclick="event.stopPropagation();Calendar.openEventDrawer('${e.id}')" title="${e.title}">
              ${TYPE_ICONS[e.type]||'📅'} ${Utils.truncate(e.title,14)}
            </div>`).join('')}
          ${dayEvents.length > 3 ? `<div style="font-size:9px;color:var(--text-muted);padding:2px 4px;">+${dayEvents.length-3} more</div>` : ''}
        </div>`;
    }
    // Trailing cells
    const totalCells = firstDay + daysInMonth;
    const trailing = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 0; i < trailing; i++) cells += `<div class="calendar-cell other-month"></div>`;

    container.innerHTML = `
      <div class="calendar-header">
        <div style="display:flex;align-items:center;gap:8px;">
          <button class="calendar-nav-btn" onclick="Calendar.prevMonth()">‹</button>
          <h2 class="calendar-month">${MONTHS[_month]} ${_year}</h2>
          <button class="calendar-nav-btn" onclick="Calendar.nextMonth()">›</button>
        </div>
        <div style="display:flex;gap:8px;">
          ${['month'].map(v => `<button class="btn btn-ghost btn-sm">${Utils.titleCase(v)}</button>`).join('')}
        </div>
      </div>
      <div class="calendar-grid">
        ${DAYS.map(d => `<div class="calendar-day-header">${d}</div>`).join('')}
        ${cells}
      </div>
    `;
  }

  function renderUpcoming() {
    const container = document.getElementById('upcomingEvents');
    if (!container) return;
    const today = Utils.todayISO();
    const events = Storage.getAll('events')
      .filter(e => e.date >= today)
      .sort((a,b) => a.date.localeCompare(b.date))
      .slice(0, 8);

    if (!events.length) { container.innerHTML = `<div style="padding:1rem;color:var(--text-muted);font-size:var(--text-sm);text-align:center;">No upcoming events</div>`; return; }

    container.innerHTML = events.map(e => {
      const d = new Date(e.date);
      const daysLeft = Utils.daysUntil(e.date);
      const urgent = daysLeft !== null && daysLeft <= 3;
      return `
        <div class="upcoming-item ${urgent?'upcoming-urgent':''}" onclick="Calendar.openEventDrawer('${e.id}')">
          <div class="upcoming-date-block">
            <div class="upcoming-date-day">${d.getDate()}</div>
            <div class="upcoming-date-mon">${MONTHS[d.getMonth()].slice(0,3)}</div>
          </div>
          <div class="upcoming-content">
            <div class="upcoming-title">${e.title}</div>
            <div class="upcoming-meta">${TYPE_ICONS[e.type]||'📅'} ${Utils.titleCase(e.type)} ${e.time ? '• '+e.time : ''}</div>
          </div>
          ${daysLeft !== null ? `<span style="font-size:10px;color:${urgent?'var(--status-error)':'var(--text-muted)'};">${daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : daysLeft+'d'}</span>` : ''}
        </div>`;
    }).join('');
  }

  function openCreateModal(dateStr = '') {
    const clients = Storage.getAll('clients');
    Modal.open({
      title: 'New Event', icon: '📅',
      body: `
        <div class="form-group"><label class="form-label">Event Title <span class="required">*</span></label>
          <input type="text" name="title" class="form-input" placeholder="Client Meeting" required /></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Type</label>
            <select name="type" class="form-select">
              ${Object.keys(TYPE_ICONS).map(t=>`<option value="${t}">${TYPE_ICONS[t]} ${Utils.titleCase(t)}</option>`).join('')}</select></div>
          <div class="form-group"><label class="form-label">Date <span class="required">*</span></label>
            <input type="date" name="date" class="form-input" value="${dateStr||Utils.todayISO()}" required /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Time</label>
            <input type="time" name="time" class="form-input" value="10:00" /></div>
          <div class="form-group"><label class="form-label">Duration (mins)</label>
            <input type="number" name="duration" class="form-input" value="60" /></div>
        </div>
        <div class="form-group"><label class="form-label">Client</label>
          <select name="clientId" class="form-select"><option value="">No Client</option>
            ${clients.map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label">Description</label>
          <textarea name="description" class="form-textarea" rows="2" placeholder="Event details..."></textarea></div>`,
      onSave: () => {
        if (!Modal.validateRequired([{name:'title',label:'Title'},{name:'date',label:'Date'}])) return false;
        const data = Modal.getFormData();
        data.duration = parseInt(data.duration)||60;
        Storage.create('events', data);
        UI.toast('Event created!', 'success');
        renderCalendar(); renderUpcoming(); return true;
      }
    });
  }

  function openEventDrawer(id) {
    const e = Storage.getById('events', id);
    if (!e) return;
    const client = e.clientId ? Storage.getById('clients', e.clientId) : null;
    Drawer.open({
      title: e.title,
      subtitle: `${Utils.titleCase(e.type)} • ${Utils.formatDate(e.date)}`,
      record: e, type: 'event',
      tabs: [{
        id: 'overview', label: 'Details', icon: '📋',
        content: Drawer.buildDetailRows([
          { label: 'Type', value: `${TYPE_ICONS[e.type]||'📅'} ${Utils.titleCase(e.type)}` },
          { label: 'Date', value: Utils.formatDate(e.date), highlight: true },
          { label: 'Time', value: e.time || '—' },
          { label: 'Duration', value: e.duration ? `${e.duration} minutes` : '—' },
          { label: 'Client', value: client ? client.name : '—' },
          { label: 'Description', value: e.description || '—' },
        ])
      }],
      onEdit: () => { Drawer.close(); openEditModal(id); },
      onDelete: () => { Drawer.close(); deleteEvent(id); },
    });
  }

  function openEditModal(id) {
    const e = Storage.getById('events', id);
    if (!e) return;
    const clients = Storage.getAll('clients');
    Modal.open({
      title: 'Edit Event', icon: '✏️',
      body: `
        <div class="form-group"><label class="form-label">Title</label>
          <input type="text" name="title" class="form-input" value="${e.title}" /></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Type</label>
            <select name="type" class="form-select">${Object.keys(TYPE_ICONS).map(t=>`<option value="${t}" ${e.type===t?'selected':''}>${Utils.titleCase(t)}</option>`).join('')}</select></div>
          <div class="form-group"><label class="form-label">Date</label>
            <input type="date" name="date" class="form-input" value="${e.date}" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Time</label>
            <input type="time" name="time" class="form-input" value="${e.time||''}" /></div>
          <div class="form-group"><label class="form-label">Client</label>
            <select name="clientId" class="form-select"><option value="">No Client</option>
              ${clients.map(c=>`<option value="${c.id}" ${e.clientId===c.id?'selected':''}>${c.name}</option>`).join('')}</select></div>
        </div>
        <div class="form-group"><label class="form-label">Description</label>
          <textarea name="description" class="form-textarea" rows="2">${e.description||''}</textarea></div>`,
      saveLabel: 'Update Event',
      onSave: () => { Storage.update('events',id,Modal.getFormData()); UI.toast('Event updated.','success'); renderCalendar(); renderUpcoming(); return true; }
    });
  }

  function deleteEvent(id) {
    const e = Storage.getById('events', id);
    UI.confirm(`Delete event "<strong>${e?.title}</strong>"?`, 'Delete Event', () => {
      Storage.del('events', id); UI.toast('Event deleted.','success'); renderCalendar(); renderUpcoming();
    });
  }

  function prevMonth() { _month--; if (_month < 0) { _month = 11; _year--; } renderCalendar(); renderUpcoming(); }
  function nextMonth() { _month++; if (_month > 11) { _month = 0; _year++; } renderCalendar(); renderUpcoming(); }
  function goToday() { _year = new Date().getFullYear(); _month = new Date().getMonth(); renderCalendar(); renderUpcoming(); }

  return { renderPage, prevMonth, nextMonth, goToday, openCreateModal, openEventDrawer, openEditModal, deleteEvent };
})();
