/* ============================================================
   NOTES.JS — Notes Module
   ============================================================ */

const Notes = (() => {
  let _notes = [], _activeId = null, _search = '', _filterCat = 'All';
  let _autoSaveTimer = null;
  const CATS = ['All','Meeting','Strategy','Personal','Client','Technical','Finance'];

  function renderPage() {
    _notes = Storage.getAll('notes');
    Utils.renderPage(`
      ${UI.buildBreadcrumb([{label:'Dashboard',href:'#dashboard',page:'dashboard'},{label:'Notes'}])}
      <div class="page-header">
        <div class="page-header-left"><h1 class="page-title">Notes</h1>
          <p class="page-subtitle">${_notes.length} notes • ${_notes.filter(n=>n.isPinned).length} pinned</p></div>
        <div class="page-header-right">
          <button class="btn btn-primary" onclick="Notes.createNote()">+ New Note</button></div>
      </div>
      <div class="notes-layout">
        <div class="notes-sidebar" id="notesSidebar"></div>
        <div class="note-editor" id="noteEditor">
          <div style="display:flex;align-items:center;justify-content:center;height:100%;flex-direction:column;gap:16px;color:var(--text-muted);">
            <div style="font-size:3rem;">📝</div>
            <p>Select a note or create a new one</p>
            <button class="btn btn-primary" onclick="Notes.createNote()">+ New Note</button>
          </div>
        </div>
      </div>
    `);
    renderSidebar();
  }

  function renderSidebar() {
    const sidebar = document.getElementById('notesSidebar');
    if (!sidebar) return;
    let filtered = [..._notes];
    if (_filterCat !== 'All') filtered = filtered.filter(n => n.category === _filterCat);
    if (_search) filtered = Utils.searchFilter(filtered, _search, ['title','content','tags']);
    const pinned = filtered.filter(n => n.isPinned);
    const regular = filtered.filter(n => !n.isPinned);
    const all = [...pinned, ...regular];

    sidebar.innerHTML = `
      <div style="margin-bottom:12px;">
        <div style="position:relative;">
          <span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--text-muted);font-size:0.8rem;">🔍</span>
          <input type="text" id="noteSearch" class="form-input form-input-sm" style="padding-left:2rem;width:100%;" placeholder="Search notes..." value="${_search}" />
        </div>
      </div>
      <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:12px;">
        ${CATS.map(c => `<button class="chip ${_filterCat===c?'active':''}" onclick="Notes.filterCat('${c}')" style="padding:3px 10px;font-size:11px;">${c}</button>`).join('')}
      </div>
      ${!all.length ? `<div style="text-align:center;padding:2rem;color:var(--text-muted);font-size:var(--text-sm);">No notes found</div>` :
        all.map(n => `
          <div class="note-list-item ${_activeId===n.id?'active':''}" onclick="Notes.openNote('${n.id}')">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
              <div class="note-list-title">${n.isPinned?'📌 ':''}${Utils.truncate(n.title||'Untitled',28)}</div>
              <span style="font-size:9px;color:var(--text-muted);text-transform:uppercase;">${n.category||''}</span>
            </div>
            <div class="note-list-preview">${Utils.truncate(n.content||'',60)}</div>
            <div class="note-list-date">${Utils.formatRelativeTime(n.updatedAt)}</div>
          </div>
        `).join('')
      }
    `;
    document.getElementById('noteSearch')?.addEventListener('input', Utils.debounce(e => { _search = e.target.value; renderSidebar(); }, 300));
  }

  function openNote(id) {
    _activeId = id;
    renderSidebar();
    const note = Storage.getById('notes', id);
    if (!note) return;
    const editor = document.getElementById('noteEditor');
    if (!editor) return;
    editor.innerHTML = `
      <div class="note-editor-header">
        <input type="text" id="noteTitle" class="note-editor-title" value="${note.title||''}" placeholder="Note title..." />
        <div style="display:flex;align-items:center;gap:8px;">
          <select id="noteCat" class="form-select" style="height:30px;width:auto;font-size:var(--text-xs);">
            ${CATS.filter(c=>c!=='All').map(c=>`<option value="${c}" ${note.category===c?'selected':''}>${c}</option>`).join('')}
          </select>
          <button class="btn btn-ghost btn-icon btn-sm" onclick="Notes.togglePin('${id}')" title="${note.isPinned?'Unpin':'Pin'}">${note.isPinned?'📌':'📍'}</button>
          <button class="btn btn-ghost btn-icon btn-sm" onclick="Notes.deleteNote('${id}')" style="color:var(--status-error);">🗑</button>
        </div>
      </div>
      <div style="padding:4px 20px 4px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:12px;">
        <span style="font-size:var(--text-xs);color:var(--text-muted);">Last edited: ${Utils.formatRelativeTime(note.updatedAt)}</span>
        <span id="autoSaveStatus" style="font-size:var(--text-xs);color:var(--accent-primary);opacity:0;transition:opacity 0.3s;">✓ Saved</span>
      </div>
      <div class="note-editor-body">
        <textarea id="noteContent" class="note-editor-textarea" placeholder="Start writing your note...">${note.content||''}</textarea>
      </div>
    `;
    document.getElementById('noteTitle')?.addEventListener('input', scheduleAutoSave);
    document.getElementById('noteContent')?.addEventListener('input', scheduleAutoSave);
    document.getElementById('noteCat')?.addEventListener('change', scheduleAutoSave);
  }

  function scheduleAutoSave() {
    clearTimeout(_autoSaveTimer);
    _autoSaveTimer = setTimeout(() => {
      if (!_activeId) return;
      const title = document.getElementById('noteTitle')?.value || 'Untitled';
      const content = document.getElementById('noteContent')?.value || '';
      const category = document.getElementById('noteCat')?.value || 'Personal';
      Storage.update('notes', _activeId, { title, content, category });
      _notes = Storage.getAll('notes');
      const status = document.getElementById('autoSaveStatus');
      if (status) { status.style.opacity = '1'; setTimeout(() => status.style.opacity = '0', 1500); }
      renderSidebar();
    }, 800);
  }

  function createNote() {
    const note = Storage.create('notes', {
      title: 'New Note', content: '', category: 'Personal',
      isPinned: false, tags: [], color: ''
    });
    _notes = Storage.getAll('notes');
    _activeId = note.id;
    renderSidebar();
    openNote(note.id);
    setTimeout(() => document.getElementById('noteTitle')?.focus(), 100);
    UI.toast('New note created.', 'success');
  }

  function togglePin(id) {
    const note = Storage.getById('notes', id);
    if (!note) return;
    Storage.update('notes', id, { isPinned: !note.isPinned });
    _notes = Storage.getAll('notes');
    renderSidebar();
    openNote(id);
    UI.toast(note.isPinned ? 'Note unpinned.' : 'Note pinned! 📌', 'info');
  }

  function deleteNote(id) {
    UI.confirm('Delete this note? This cannot be undone.', 'Delete Note', () => {
      Storage.del('notes', id);
      _notes = Storage.getAll('notes');
      _activeId = null;
      renderPage();
      UI.toast('Note deleted.', 'success');
    });
  }

  function filterCat(cat) {
    _filterCat = cat;
    renderSidebar();
  }

  return { renderPage, openNote, createNote, togglePin, deleteNote, filterCat };
})();
