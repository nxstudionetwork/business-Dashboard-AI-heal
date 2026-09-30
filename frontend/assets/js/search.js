/* ============================================================
   SEARCH.JS — Universal Search + Command Palette (Ctrl+K)
   ============================================================ */

const Search = (() => {

  let _results = [];
  let _selectedIdx = 0;
  let _recentSearches = [];

  // ── Command items ──
  const COMMANDS = [
    { type: 'nav', icon: '📊', label: 'Go to Dashboard', action: () => Router.navigate('dashboard') },
    { type: 'nav', icon: '👥', label: 'Go to Clients', action: () => Router.navigate('clients') },
    { type: 'nav', icon: '🎯', label: 'Go to Leads', action: () => Router.navigate('leads') },
    { type: 'nav', icon: '🚀', label: 'Go to Projects', action: () => Router.navigate('projects') },
    { type: 'nav', icon: '📋', label: 'Go to Quotations', action: () => Router.navigate('quotations') },
    { type: 'nav', icon: '💰', label: 'Go to Finance', action: () => Router.navigate('invoices') },
    { type: 'nav', icon: '📄', label: 'Go to Invoices', action: () => Router.navigate('invoices') },
    { type: 'nav', icon: '✓', label: 'Go to Payments', action: () => Router.navigate('payments') },
    { type: 'nav', icon: '💸', label: 'Go to Expenses', action: () => Router.navigate('expenses') },
    { type: 'nav', icon: '📁', label: 'Go to Documents', action: () => Router.navigate('documents') },
    { type: 'nav', icon: '📅', label: 'Go to Calendar', action: () => Router.navigate('calendar') },
    { type: 'nav', icon: '📝', label: 'Go to Notes', action: () => Router.navigate('notes') },
    { type: 'nav', icon: '📈', label: 'Go to Reports', action: () => Router.navigate('reports') },
    { type: 'nav', icon: '⚙️', label: 'Go to Settings', action: () => Router.navigate('settings') },
    { type: 'action', icon: '➕', label: 'Create New Client', action: () => { closeCommandPalette(); Clients.openCreateModal(); } },
    { type: 'action', icon: '➕', label: 'Create New Lead', action: () => { closeCommandPalette(); Router.navigate('leads'); setTimeout(() => Leads.openCreateModal(), 300); } },
    { type: 'action', icon: '➕', label: 'Create New Project', action: () => { closeCommandPalette(); Projects.openCreateModal(); } },
    { type: 'action', icon: '➕', label: 'Create New Invoice', action: () => { closeCommandPalette(); Invoices.openCreateModal(); } },
    { type: 'action', icon: '➕', label: 'Create New Note', action: () => { closeCommandPalette(); Router.navigate('notes'); } },
  ];

  function init() {
    // Global search input
    const globalSearch = document.getElementById('globalSearch');
    if (globalSearch) {
      globalSearch.addEventListener('input', Utils.debounce(handleGlobalSearch, 300));
      globalSearch.addEventListener('click', () => openCommandPalette());
    }

    // Ctrl+K
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openCommandPalette();
      }
      if (e.key === 'Escape') {
        closeCommandPalette();
      }
    });

    // Command palette input
    const cmdInput = document.getElementById('commandInput');
    if (cmdInput) {
      cmdInput.addEventListener('input', Utils.debounce(handleCommandSearch, 200));
      cmdInput.addEventListener('keydown', handleCommandKeyNav);
    }

    // Close on overlay click
    const overlay = document.getElementById('commandOverlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeCommandPalette();
      });
    }

    // Load recent searches
    _recentSearches = Storage.get('recentSearches') || [];
  }

  function openCommandPalette() {
    const overlay = document.getElementById('commandOverlay');
    const input   = document.getElementById('commandInput');
    if (!overlay) return;

    overlay.classList.add('open');
    if (input) {
      input.value = '';
      input.focus();
    }
    renderCommandResults('');
  }

  function closeCommandPalette() {
    const overlay = document.getElementById('commandOverlay');
    if (overlay) overlay.classList.remove('open');
    _selectedIdx = 0;
  }

  function handleCommandSearch(e) {
    const query = e.target.value.trim();
    renderCommandResults(query);
  }

  function renderCommandResults(query) {
    const container = document.getElementById('commandResults');
    if (!container) return;

    let items = [];

    if (!query) {
      // Show navigation commands + recent
      const recent = _recentSearches.slice(0, 3);
      if (recent.length) {
        items.push({ type: 'section', label: 'Recent Searches' });
        recent.forEach(r => items.push({ type: 'recent', icon: '🕐', label: r, action: () => { doSearch(r); } }));
      }
      items.push({ type: 'section', label: 'Navigation' });
      COMMANDS.filter(c => c.type === 'nav').forEach(c => items.push(c));
      items.push({ type: 'section', label: 'Actions' });
      COMMANDS.filter(c => c.type === 'action').forEach(c => items.push(c));
    } else {
      // Search records
      const q = query.toLowerCase();

      // Clients
      const clients = Storage.getAll('clients').filter(c => c.name.toLowerCase().includes(q) || c.company?.toLowerCase().includes(q)).slice(0, 4);
      if (clients.length) {
        items.push({ type: 'section', label: 'Clients' });
        clients.forEach(c => items.push({
          type: 'record',
          icon: UI.buildAvatar(c.name, 'xs'),
          label: c.name,
          sub: c.company,
          action: () => { closeCommandPalette(); Router.navigate('clients'); setTimeout(() => Clients.openDrawer(c.id), 300); },
        }));
      }

      // Projects
      const projects = Storage.getAll('projects').filter(p => p.name.toLowerCase().includes(q)).slice(0, 3);
      if (projects.length) {
        items.push({ type: 'section', label: 'Projects' });
        projects.forEach(p => items.push({
          type: 'record', icon: '🚀', label: p.name, sub: Utils.getStatusBadge(p.status),
          action: () => { closeCommandPalette(); Router.navigate('projects'); },
        }));
      }

      // Invoices
      const invoices = Storage.getAll('invoices').filter(i => i.number?.toLowerCase().includes(q) || i.title?.toLowerCase().includes(q)).slice(0, 3);
      if (invoices.length) {
        items.push({ type: 'section', label: 'Invoices' });
        invoices.forEach(i => items.push({
          type: 'record', icon: '📄', label: i.number, sub: Utils.formatCurrency(i.total),
          action: () => { closeCommandPalette(); Router.navigate('invoices'); },
        }));
      }

      // Commands
      const cmds = COMMANDS.filter(c => c.label.toLowerCase().includes(q)).slice(0, 4);
      if (cmds.length) {
        items.push({ type: 'section', label: 'Commands' });
        cmds.forEach(c => items.push(c));
      }
    }

    _results = items.filter(i => i.type !== 'section');
    _selectedIdx = 0;

    if (items.length === 0) {
      container.innerHTML = `<div style="padding:1.5rem;text-align:center;color:var(--text-muted);font-size:var(--text-sm);">No results for "${query}"</div>`;
      return;
    }

    let resultIdx = 0;
    container.innerHTML = items.map(item => {
      if (item.type === 'section') {
        return `<div style="padding:6px 12px 4px;font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em;">${item.label}</div>`;
      }
      const idx = resultIdx++;
      return `
        <div class="menu-item cmd-result" data-idx="${idx}">
          <span class="cmd-result-icon">${item.icon || ''}</span>
          <span class="cmd-result-info">
            <span class="cmd-result-label">${item.label}</span>
            ${item.sub ? `<span class="cmd-result-sub">${item.sub}</span>` : ''}
          </span>
          <span class="cmd-result-shortcut">↵</span>
        </div>
      `;
    }).join('');

    // Bind clicks
    container.querySelectorAll('.cmd-result').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.idx);
        executeResult(idx, query);
      });
      el.addEventListener('mouseenter', () => {
        container.querySelectorAll('.cmd-result').forEach(e => e.classList.remove('active'));
        el.classList.add('active');
        _selectedIdx = parseInt(el.dataset.idx);
      });
    });

    // Highlight first
    const first = container.querySelector('.cmd-result');
    if (first) first.style.background = 'rgba(255,255,255,0.05)';
  }

  function handleCommandKeyNav(e) {
    const results = document.querySelectorAll('.cmd-result');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      _selectedIdx = Math.min(_selectedIdx + 1, results.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      _selectedIdx = Math.max(_selectedIdx - 1, 0);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const query = document.getElementById('commandInput')?.value.trim() || '';
      executeResult(_selectedIdx, query);
      return;
    }
    results.forEach((el, i) => {
      el.style.background = i === _selectedIdx ? 'rgba(255,255,255,0.05)' : '';
    });
    results[_selectedIdx]?.scrollIntoView({ block: 'nearest' });
  }

  function executeResult(idx, query = '') {
    const item = _results[idx];
    if (item && item.action) {
      if (query) saveRecentSearch(query);
      item.action();
    }
  }

  function doSearch(query) {
    const globalSearch = document.getElementById('globalSearch');
    if (globalSearch) globalSearch.value = query;
    openCommandPalette();
    const cmdInput = document.getElementById('commandInput');
    if (cmdInput) {
      cmdInput.value = query;
      renderCommandResults(query);
    }
  }

  function saveRecentSearch(query) {
    _recentSearches = [query, ..._recentSearches.filter(s => s !== query)].slice(0, 5);
    Storage.set('recentSearches', _recentSearches);
  }

  function handleGlobalSearch(e) {
    const query = e.target.value.trim();
    if (query.length >= 2) openCommandPalette();
  }

  return { init, openCommandPalette, closeCommandPalette, doSearch };
})();
