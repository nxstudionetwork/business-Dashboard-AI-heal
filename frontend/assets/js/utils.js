/* ============================================================
   UTILS.JS — Shared utility functions
   ============================================================ */

const Utils = (() => {

  // ── ID Generation ──
  function generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`;
  }

  // ── Date Formatting ──
  function formatDate(dateStr, style = 'medium') {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    if (isNaN(date)) return '—';
    const opts = {
      short:  { month: 'short', day: 'numeric', year: 'numeric' },
      medium: { month: 'short', day: 'numeric', year: 'numeric' },
      long:   { month: 'long', day: 'numeric', year: 'numeric' },
      monthYear: { month: 'short', year: 'numeric' },
      dayMonth: { month: 'short', day: 'numeric' },
    };
    return date.toLocaleDateString('en-US', opts[style] || opts.medium);
  }

  function formatRelativeTime(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const secs = Math.floor(diff / 1000);
    const mins = Math.floor(secs / 60);
    const hrs  = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);
    if (secs < 60)   return 'just now';
    if (mins < 60)   return `${mins}m ago`;
    if (hrs  < 24)   return `${hrs}h ago`;
    if (days < 7)    return `${days}d ago`;
    if (days < 30)   return `${Math.floor(days / 7)}w ago`;
    if (days < 365)  return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
  }

  function daysUntil(dateStr) {
    if (!dateStr) return null;
    const target = new Date(dateStr);
    const now = new Date();
    target.setHours(0,0,0,0);
    now.setHours(0,0,0,0);
    return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  }

  function isOverdue(dateStr) {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  }

  function todayISO() {
    return new Date().toISOString().split('T')[0];
  }

  function addDays(dateStr, days) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  }

  // ── Currency Formatting ──
  function formatCurrency(amount, currency = 'USD', compact = false) {
    if (amount === null || amount === undefined) return '—';
    const num = parseFloat(amount) || 0;
    if (compact && num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    }
    if (compact && num >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  }

  function formatNumber(num) {
    if (num === null || num === undefined) return '0';
    return new Intl.NumberFormat('en-US').format(num);
  }

  function formatPercent(val, total) {
    if (!total) return '0%';
    return `${Math.round((val / total) * 100)}%`;
  }

  // ── String Utilities ──
  function truncate(str, len = 40) {
    if (!str) return '';
    return str.length > len ? str.slice(0, len) + '…' : str;
  }

  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  function titleCase(str) {
    if (!str) return '';
    return str.replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
  }

  function slugify(str) {
    if (!str) return '';
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  // ── Search ──
  function fuzzySearch(query, text) {
    if (!query) return true;
    if (!text) return false;
    const q = query.toLowerCase().trim();
    const t = text.toLowerCase();
    // Check if all chars in query appear in order in text
    let qi = 0;
    for (let i = 0; i < t.length && qi < q.length; i++) {
      if (t[i] === q[qi]) qi++;
    }
    return qi === q.length;
  }

  function searchFilter(items, query, fields) {
    if (!query) return items;
    const q = query.toLowerCase().trim();
    return items.filter(item =>
      fields.some(field => {
        const val = String(item[field] || '').toLowerCase();
        return val.includes(q);
      })
    );
  }

  // ── DOM Utilities ──
  function el(selector) {
    return document.querySelector(selector);
  }

  function els(selector) {
    return document.querySelectorAll(selector);
  }

  function createEl(tag, attrs = {}, children = []) {
    const element = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'class') element.className = v;
      else if (k === 'html') element.innerHTML = v;
      else if (k === 'text') element.textContent = v;
      else if (k.startsWith('data-')) element.setAttribute(k, v);
      else element[k] = v;
    });
    children.forEach(child => {
      if (typeof child === 'string') element.innerHTML += child;
      else if (child) element.appendChild(child);
    });
    return element;
  }

  function setHTML(selector, html) {
    const el = document.querySelector(selector);
    if (el) el.innerHTML = html;
  }

  function show(selector) {
    const el = document.querySelector(selector);
    if (el) el.style.display = '';
  }

  function hide(selector) {
    const el = document.querySelector(selector);
    if (el) el.style.display = 'none';
  }

  // ── Array Utilities ──
  function sortBy(arr, key, dir = 'asc') {
    return [...arr].sort((a, b) => {
      let va = a[key], vb = b[key];
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return dir === 'asc' ? -1 : 1;
      if (va > vb) return dir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  function groupBy(arr, key) {
    return arr.reduce((groups, item) => {
      const group = item[key];
      if (!groups[group]) groups[group] = [];
      groups[group].push(item);
      return groups;
    }, {});
  }

  function sumBy(arr, key) {
    return arr.reduce((sum, item) => sum + (parseFloat(item[key]) || 0), 0);
  }

  function unique(arr, key) {
    if (!key) return [...new Set(arr)];
    const seen = new Set();
    return arr.filter(item => {
      const val = item[key];
      if (seen.has(val)) return false;
      seen.add(val);
      return true;
    });
  }

  // ── Color Utilities ──
  const avatarColors = ['green', 'gold', 'blue', 'red', 'purple', 'orange'];
  function getAvatarColor(str) {
    if (!str) return avatarColors[0];
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return avatarColors[Math.abs(hash) % avatarColors.length];
  }

  // ── Debounce / Throttle ──
  function debounce(fn, delay = 300) {
    let timer;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function throttle(fn, limit = 100) {
    let last = 0;
    return function(...args) {
      const now = Date.now();
      if (now - last >= limit) {
        last = now;
        fn.apply(this, args);
      }
    };
  }

  // ── Number animation ──
  function animateNumber(element, start, end, duration = 800) {
    const range = end - start;
    const startTime = performance.now();
    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.round(start + range * eased);
      element.textContent = formatNumber(current);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ── Status helpers ──
  function getStatusBadge(status) {
    const map = {
      active:    ['badge-success', '✓ Active'],
      inactive:  ['badge-neutral', '○ Inactive'],
      pending:   ['badge-warning', '⏳ Pending'],
      overdue:   ['badge-error',   '⚠ Overdue'],
      paid:      ['badge-success', '✓ Paid'],
      unpaid:    ['badge-error',   '✕ Unpaid'],
      draft:     ['badge-neutral', '◦ Draft'],
      sent:      ['badge-info',    '→ Sent'],
      cancelled: ['badge-neutral', '✕ Cancelled'],
      inprogress:['badge-info',    '▶ In Progress'],
      'in-progress':['badge-info', '▶ In Progress'],
      completed: ['badge-success', '✓ Completed'],
      onhold:    ['badge-warning', '⏸ On Hold'],
      'on-hold': ['badge-warning', '⏸ On Hold'],
      planning:  ['badge-purple',  '◈ Planning'],
      new:       ['badge-info',    '◉ New'],
      contacted: ['badge-info',    '● Contacted'],
      qualified: ['badge-accent',  '★ Qualified'],
      proposal:  ['badge-warning', '📋 Proposal'],
      won:       ['badge-success', '🏆 Won'],
      lost:      ['badge-error',   '✗ Lost'],
      partial:   ['badge-warning', '◑ Partial'],
    };
    const key = (status || '').toLowerCase().replace(/\s+/g, '');
    const [cls, label] = map[key] || ['badge-neutral', status || '—'];
    return `<span class="badge ${cls}">${label}</span>`;
  }

  function getPriorityBadge(priority) {
    const map = {
      critical: 'priority-critical',
      high: 'priority-high',
      medium: 'priority-medium',
      low: 'priority-low',
    };
    const cls = map[(priority || '').toLowerCase()] || 'priority-low';
    return `<span class="priority-indicator ${cls}">▲ ${Utils.titleCase(priority || 'Low')}</span>`;
  }

  // ── Download CSV ──
  function downloadCSV(data, filename) {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'export.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Clipboard ──
  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      return true;
    }
  }

  // ── Random data helpers ──
  function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // ── Page render helper ──
  function renderPage(html) {
    const content = document.getElementById('pageContent');
    if (content) {
      content.innerHTML = html;
      content.className = 'page-enter';
      void content.offsetWidth;
    }
  }

  // ── Skeleton loading for pages ──
  function showPageSkeleton() {
    const content = document.getElementById('pageContent');
    if (!content) return;
    content.innerHTML = `
      <div class="page-container">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">
          <div style="flex:1;display:flex;flex-direction:column;gap:8px;">
            <div class="skeleton skeleton-text" style="width:240px;height:28px;"></div>
            <div class="skeleton skeleton-text" style="width:320px;height:14px;"></div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;">
          ${Array.from({length:4},()=>`
            <div class="card" style="padding:20px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <div class="skeleton" style="width:80px;height:14px;"></div>
                <div class="skeleton skeleton-circle" style="width:36px;height:36px;"></div>
              </div>
              <div class="skeleton" style="width:120px;height:32px;margin-bottom:8px;"></div>
              <div class="skeleton" style="width:160px;height:12px;"></div>
            </div>
          `).join('')}
        </div>
        <div style="display:grid;grid-template-columns:1fr 2fr;gap:20px;margin-bottom:20px;">
          <div class="card" style="padding:24px;display:flex;flex-direction:column;gap:12px;">
            <div class="skeleton" style="width:160px;height:16px;"></div>
            <div class="skeleton" style="width:100px;height:80px;align-self:center;"></div>
            ${Array.from({length:3},()=>`
              <div style="display:flex;align-items:center;gap:8px;">
                <div class="skeleton" style="width:80px;height:10px;"></div>
                <div class="skeleton" style="flex:1;height:6px;"></div>
                <div class="skeleton" style="width:30px;height:10px;"></div>
              </div>
            `).join('')}
          </div>
          <div class="card" style="padding:24px;display:flex;flex-direction:column;gap:16px;">
            <div class="skeleton" style="width:180px;height:16px;"></div>
            <div style="display:flex;align-items:flex-end;gap:8px;height:140px;">
              ${Array.from({length:6},()=>`
                <div class="skeleton" style="flex:1;height:${40+Math.random()*100}px;"></div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>`;
    content.className = '';
  }

  return {
    generateId, formatDate, formatRelativeTime, daysUntil, isOverdue, todayISO, addDays,
    formatCurrency, formatNumber, formatPercent,
    truncate, capitalize, titleCase, slugify, getInitials,
    fuzzySearch, searchFilter,
    el, els, createEl, setHTML, show, hide,
    sortBy, groupBy, sumBy, unique,
    getAvatarColor, avatarColors,
    debounce, throttle, animateNumber,
    getStatusBadge, getPriorityBadge,
    downloadCSV, copyToClipboard,
    randomBetween, pickRandom, renderPage, showPageSkeleton,
  };
})();
