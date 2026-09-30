/* ============================================================
   DASHBOARD.JS — Main Dashboard Page
   ============================================================ */

const Dashboard = (() => {

  function renderPage() {
    const clients  = Storage.getAll('clients');
    const projects = Storage.getAll('projects');
    const invoices = Storage.getAll('invoices');
    const payments = Storage.getAll('payments');
    const expenses = Storage.getAll('expenses');
    const leads    = Storage.getAll('leads');
    const events   = Storage.getAll('events');
    const notes    = Storage.getAll('notes');
    const activities = Storage.getAll('activities');

    const totalRev    = Utils.sumBy(invoices.filter(i=>i.status==='paid'),'total');
    const totalExp    = Utils.sumBy(expenses,'amount');
    const outstanding = Utils.sumBy(invoices.filter(i=>i.status!=='paid'&&i.status!=='cancelled'),'balance');
    const overdueInv  = invoices.filter(i=>i.status==='overdue').length;
    const activeProj  = projects.filter(p=>p.status==='in-progress').length;
    const newLeads    = leads.filter(l=>l.stage==='new'||l.stage==='contacted').length;

    // Health score calculation
    const healthScore = calcHealthScore(clients, projects, invoices, payments);

    // Monthly revenue for chart (last 6 months)
    const revenueData = getMonthlyData(invoices, payments, 6);

    const html = `
      <div class="page-container">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">
          <div>
            <h1 class="page-title" style="font-size:var(--text-2xl);">Good ${getGreeting()}, ${(Storage.get('settings')?.company?.name || 'Admin').split(' ')[0]} 👋</h1>
            <p class="page-subtitle">Here's what's happening with your business today.</p>
          </div>
          <div style="display:flex;align-items:center;gap:10px;font-size:var(--text-sm);color:var(--text-secondary);">
            <span>📅 ${new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</span>
          </div>
        </div>

        <!-- KPI Cards -->
        <div class="dashboard-kpis stagger-children">
          ${kpiCard('Total Revenue','💰',totalRev,true,'green','All time collected')}
          ${kpiCard('Active Projects','🚀',activeProj,false,'blue',`${projects.length} total projects`)}
          ${kpiCard('Active Clients','👥',clients.filter(c=>c.status==='active').length,false,'purple',`${clients.length} total clients`)}
          ${kpiCard('Outstanding','⏳',outstanding,true,'gold',`${overdueInv} overdue invoices`)}
        </div>

        <!-- Row 1: Health Score + Revenue Chart -->
        <div style="display:grid;grid-template-columns:340px 1fr;gap:20px;margin-bottom:20px;">
          ${renderHealthScore(healthScore)}
          ${renderRevenueWidget(revenueData)}
        </div>

        <!-- Row 2: Quick Actions + Upcoming + Recent Activity -->
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin-bottom:20px;">
          ${renderQuickActions()}
          ${renderUpcomingDeadlines(projects, events)}
          ${renderRecentActivity(activities)}
        </div>

        <!-- Row 3: Recent Clients + Recent Invoices -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
          ${renderRecentClients(clients)}
          ${renderRecentInvoices(invoices, clients)}
        </div>

        <!-- Row 4: Recent Projects + Notes -->
        <div style="display:grid;grid-template-columns:2fr 1fr;gap:20px;margin-bottom:20px;">
          ${renderRecentProjects(projects, clients)}
          ${renderRecentNotes(notes)}
        </div>

        <!-- Row 5: Cash Flow -->
        ${renderCashFlow(revenueData)}
      </div>
    `;

    Utils.renderPage(html);
    setTimeout(UI.animateStatCards, 100);
  }

  function kpiCard(title, icon, value, isCurrency, color, sub) {
    const display = isCurrency ? Utils.formatCurrency(value,'USD',true) : Utils.formatNumber(value);
    return `
      <div class="stat-card" style="cursor:default;">
        <div class="stat-card-header">
          <span class="stat-card-title">${title}</span>
          <div class="stat-card-icon ${color}">${icon}</div>
        </div>
        <div class="stat-card-value">${display}</div>
        <div class="stat-card-footer" style="border-top:1px solid var(--border-subtle);padding-top:8px;margin-top:8px;font-size:var(--text-xs);color:var(--text-muted);">${sub}</div>
      </div>`;
  }

  function calcHealthScore(clients, projects, invoices, payments) {
    let score = 0;
    const active = clients.filter(c=>c.status==='active').length;
    if (clients.length) score += Math.min((active/clients.length)*25, 25);
    const completed = projects.filter(p=>p.status==='completed').length;
    if (projects.length) score += Math.min((completed/projects.length)*25, 25);
    const paid = invoices.filter(i=>i.status==='paid').length;
    if (invoices.length) score += Math.min((paid/invoices.length)*25, 25);
    const completedPay = payments.filter(p=>p.status==='completed').length;
    if (payments.length) score += Math.min((completedPay/payments.length)*25, 25);
    return Math.round(score);
  }

  function renderHealthScore(score) {
    const circumference = 2 * Math.PI * 34;
    const offset = circumference - (score / 100) * circumference;
    const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Attention';
    const color = score >= 80 ? 'var(--accent-primary)' : score >= 60 ? 'var(--status-info)' : score >= 40 ? 'var(--status-warning)' : 'var(--status-error)';

    return `
      <div class="health-score-widget">
        <div class="health-score-ring">
          <svg viewBox="0 0 80 80" width="80" height="80">
            <circle class="health-score-ring-bg" cx="40" cy="40" r="34" />
            <circle class="health-score-ring-fill" cx="40" cy="40" r="34"
              stroke="${color}"
              stroke-dasharray="${circumference}"
              stroke-dashoffset="${offset}"
              style="transition:stroke-dashoffset 1s ease;" />
          </svg>
          <div class="health-score-label">
            <div class="health-score-value" style="color:${color};">${score}</div>
            <div class="health-score-pct">/ 100</div>
          </div>
        </div>
        <div class="health-score-info">
          <div class="health-score-title">Business Health</div>
          <div class="health-score-desc" style="color:${color};font-weight:600;">${label}</div>
          <div class="health-factors">
            <div class="health-factor">
              <span style="font-size:10px;color:var(--text-muted);width:80px;">Client Activity</span>
              <div class="health-factor-bar"><div class="health-factor-fill" style="width:${Math.min(score*1.1,100)}%;background:${color};"></div></div>
              <span class="health-factor-val">${Math.min(Math.round(score*1.1),100)}%</span>
            </div>
            <div class="health-factor">
              <span style="font-size:10px;color:var(--text-muted);width:80px;">Invoice Rate</span>
              <div class="health-factor-bar"><div class="health-factor-fill" style="width:${Math.min(score*0.9,100)}%;background:${color};"></div></div>
              <span class="health-factor-val">${Math.min(Math.round(score*0.9),100)}%</span>
            </div>
            <div class="health-factor">
              <span style="font-size:10px;color:var(--text-muted);width:80px;">Project Health</span>
              <div class="health-factor-bar"><div class="health-factor-fill" style="width:${score}%;background:${color};"></div></div>
              <span class="health-factor-val">${score}%</span>
            </div>
          </div>
        </div>
      </div>`;
  }

  function getMonthlyData(invoices, payments, months) {
    const result = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth(); const y = d.getFullYear();
      const rev = Utils.sumBy(invoices.filter(inv => { const id=new Date(inv.issueDate); return id.getMonth()===m&&id.getFullYear()===y&&inv.status==='paid'; }), 'total');
      const exp = Utils.sumBy(payments.filter(p => { const pd=new Date(p.date); return pd.getMonth()===m&&pd.getFullYear()===y; }), 'amount');
      result.push({ label: d.toLocaleString('default',{month:'short'}), revenue: rev, expenses: exp });
    }
    return result;
  }

  function renderRevenueWidget(data) {
    const maxVal = Math.max(...data.map(d=>Math.max(d.revenue,d.expenses)),1);
    return `
      <div class="widget-card">
        <div class="widget-header">
          <div class="widget-title"><span class="widget-title-icon">📊</span>Revenue Overview</div>
          <div class="widget-actions">
            <span style="font-size:var(--text-xs);color:var(--text-muted);">Last 6 months</span>
          </div>
        </div>
        <div class="widget-body">
          <div style="display:flex;align-items:flex-end;gap:10px;height:160px;padding-bottom:8px;">
            ${data.map(d => {
              const rh = Math.max(Math.round((d.revenue/maxVal)*140),2);
              const eh = Math.max(Math.round((d.expenses/maxVal)*140),2);
              return `
                <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;">
                  <div style="display:flex;align-items:flex-end;gap:2px;height:140px;">
                    <div style="width:16px;height:${rh}px;background:var(--accent-primary);border-radius:3px 3px 0 0;opacity:0.85;" title="${Utils.formatCurrency(d.revenue)}"></div>
                    <div style="width:16px;height:${eh}px;background:var(--status-error);border-radius:3px 3px 0 0;opacity:0.65;" title="${Utils.formatCurrency(d.expenses)}"></div>
                  </div>
                  <span style="font-size:9px;color:var(--text-muted);">${d.label}</span>
                </div>`;
            }).join('')}
          </div>
          <div style="display:flex;gap:16px;padding-top:8px;border-top:1px solid var(--border-subtle);">
            <div style="display:flex;align-items:center;gap:6px;font-size:var(--text-xs);color:var(--text-secondary);"><span style="width:10px;height:10px;background:var(--accent-primary);border-radius:2px;display:inline-block;"></span>Revenue</div>
            <div style="display:flex;align-items:center;gap:6px;font-size:var(--text-xs);color:var(--text-secondary);"><span style="width:10px;height:10px;background:var(--status-error);border-radius:2px;display:inline-block;"></span>Expenses</div>
            <div style="margin-left:auto;font-size:var(--text-xs);color:var(--text-muted);cursor:pointer;color:var(--accent-primary);" onclick="Router.navigate('reports')">View full report →</div>
          </div>
        </div>
      </div>`;
  }

  function renderQuickActions() {
    const actions = [
      { icon:'👤', label:'New Client',    color:'var(--status-success-bg)', action:"Clients.openCreateModal()" },
      { icon:'🚀', label:'New Project',   color:'var(--status-info-bg)',    action:"Projects.openCreateModal()" },
      { icon:'📄', label:'New Invoice',   color:'var(--status-warning-bg)', action:"Invoices.openCreateModal()" },
      { icon:'💰', label:'Record Payment',color:'var(--accent-primary-subtle)', action:"Payments.openCreateModal()" },
      { icon:'🎯', label:'New Lead',      color:'var(--status-purple-bg)',  action:"Router.navigate('leads')" },
      { icon:'📝', label:'New Note',      color:'var(--bg-tertiary)',       action:"Router.navigate('notes')" },
      { icon:'📅', label:'New Event',     color:'var(--status-info-bg)',    action:"Calendar.openCreateModal()" },
      { icon:'📁', label:'Upload Doc',    color:'var(--bg-tertiary)',       action:"Router.navigate('documents')" },
    ];
    return `
      <div class="widget-card">
        <div class="widget-header"><div class="widget-title"><span class="widget-title-icon">⚡</span>Quick Actions</div></div>
        <div class="widget-body">
          <div class="quick-actions-grid">
            ${actions.map(a => `
              <div class="quick-action-btn" onclick="${a.action}">
                <div class="quick-action-icon" style="background:${a.color};">${a.icon}</div>
                <div class="quick-action-label">${a.label}</div>
              </div>`).join('')}
          </div>
        </div>
      </div>`;
  }

  function renderUpcomingDeadlines(projects, events) {
    const today = Utils.todayISO();
    const upcoming = [
      ...projects.filter(p=>p.status!=='completed'&&p.deadline>=today)
        .sort((a,b)=>a.deadline.localeCompare(b.deadline)).slice(0,3)
        .map(p => ({ title: p.name, date: p.deadline, type: 'deadline', icon:'🚀' })),
      ...events.filter(e=>e.date>=today)
        .sort((a,b)=>a.date.localeCompare(b.date)).slice(0,3)
        .map(e => ({ title: e.title, date: e.date, type: e.type, icon:'📅' })),
    ].sort((a,b)=>a.date.localeCompare(b.date)).slice(0,6);

    return `
      <div class="widget-card">
        <div class="widget-header"><div class="widget-title"><span class="widget-title-icon">⏰</span>Upcoming Deadlines</div></div>
        <div class="widget-body" style="padding:0;">
          ${!upcoming.length ? `<div style="padding:1.5rem;text-align:center;color:var(--text-muted);font-size:var(--text-sm);">No upcoming deadlines 🎉</div>` :
            upcoming.map(u => {
              const daysLeft = Utils.daysUntil(u.date);
              const urgent = daysLeft !== null && daysLeft <= 3;
              const d = new Date(u.date);
              return `
                <div class="upcoming-item" style="padding:10px 16px;">
                  <div class="upcoming-date-block" style="${urgent?'background:var(--status-error-bg);border-color:rgba(255,71,87,0.2);':''}">
                    <div class="upcoming-date-day" style="${urgent?'color:var(--status-error);':''}">${d.getDate()}</div>
                    <div class="upcoming-date-mon">${d.toLocaleString('default',{month:'short'})}</div>
                  </div>
                  <div class="upcoming-content">
                    <div class="upcoming-title">${Utils.truncate(u.title, 28)}</div>
                    <div class="upcoming-meta">${u.icon} ${Utils.titleCase(u.type)}</div>
                  </div>
                  <span style="font-size:10px;font-weight:600;color:${urgent?'var(--status-error)':'var(--text-muted)'};">
                    ${daysLeft===0?'Today':daysLeft===1?'Tomorrow':(daysLeft||0)+'d'}
                  </span>
                </div>`;
            }).join('')
          }
        </div>
      </div>`;
  }

  function renderRecentActivity(activities) {
    const recent = (activities || []).sort((a,b) => new Date(b.timestamp)-new Date(a.timestamp)).slice(0,8);
    const colorMap = { green:'var(--status-success-bg)', gold:'var(--status-warning-bg)', blue:'var(--status-info-bg)', red:'var(--status-error-bg)' };
    return `
      <div class="widget-card">
        <div class="widget-header"><div class="widget-title"><span class="widget-title-icon">🕐</span>Recent Activity</div></div>
        <div class="widget-body" style="padding:12px;">
          ${!recent.length ? `<div style="text-align:center;color:var(--text-muted);padding:1rem;font-size:var(--text-sm);">No activity yet</div>` :
            recent.map(a => `
              <div class="activity-item">
                <div class="activity-icon" style="background:${colorMap[a.color]||'var(--bg-tertiary)'};">${a.icon||'●'}</div>
                <div class="activity-body">
                  <div class="activity-text" style="font-size:var(--text-xs);">${a.description||''}</div>
                  <div class="activity-time">${Utils.formatRelativeTime(a.timestamp)}</div>
                </div>
              </div>`).join('')}
        </div>
      </div>`;
  }

  function renderRecentClients(clients) {
    const recent = [...clients].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5);
    return `
      <div class="widget-card">
        <div class="widget-header">
          <div class="widget-title"><span class="widget-title-icon">👥</span>Recent Clients</div>
          <button class="widget-action-btn" onclick="Router.navigate('clients')" title="View all">→</button>
        </div>
        <div class="widget-body" style="padding:0;">
          ${recent.map(c => `
            <div class="recent-item" onclick="Router.navigate('clients')">
              ${UI.buildAvatar(c.name,'sm')}
              <div class="recent-item-body">
                <div class="recent-item-name">${c.name}</div>
                <div class="recent-item-meta">${c.company||'—'} • ${c.industry||''}</div>
              </div>
              ${Utils.getStatusBadge(c.status)}
            </div>`).join('')}
        </div>
      </div>`;
  }

  function renderRecentInvoices(invoices, clients) {
    const recent = [...invoices].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5);
    return `
      <div class="widget-card">
        <div class="widget-header">
          <div class="widget-title"><span class="widget-title-icon">📄</span>Recent Invoices</div>
          <button class="widget-action-btn" onclick="Router.navigate('invoices')" title="View all">→</button>
        </div>
        <div class="widget-body" style="padding:0;">
          ${recent.map(i => {
            const client = i.clientId ? Storage.getById('clients', i.clientId) : null;
            return `
              <div class="recent-item" onclick="Router.navigate('invoices')">
                <div style="width:32px;height:32px;border-radius:var(--radius-md);background:var(--bg-tertiary);display:flex;align-items:center;justify-content:center;font-size:0.9rem;flex-shrink:0;">📄</div>
                <div class="recent-item-body">
                  <div class="recent-item-name">${i.number}</div>
                  <div class="recent-item-meta">${client ? client.name : '—'} • Due ${Utils.formatDate(i.dueDate)}</div>
                </div>
                <div style="text-align:right;">
                  <div class="recent-item-value">${Utils.formatCurrency(i.total,'USD',true)}</div>
                  <div style="margin-top:3px;">${Utils.getStatusBadge(i.status)}</div>
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>`;
  }

  function renderRecentProjects(projects, clients) {
    const recent = [...projects].sort((a,b) => new Date(b.updatedAt)-new Date(a.updatedAt)).slice(0,5);
    return `
      <div class="widget-card">
        <div class="widget-header">
          <div class="widget-title"><span class="widget-title-icon">🚀</span>Recent Projects</div>
          <button class="widget-action-btn" onclick="Router.navigate('projects')" title="View all">→</button>
        </div>
        <div class="widget-body" style="padding:0;">
          ${recent.map(p => {
            const client = p.clientId ? Storage.getById('clients', p.clientId) : null;
            return `
              <div class="recent-item" onclick="Router.navigate('projects')">
                <div style="width:36px;height:36px;border-radius:var(--radius-md);background:var(--accent-primary-subtle);display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0;">🚀</div>
                <div class="recent-item-body" style="flex:1;">
                  <div class="recent-item-name">${Utils.truncate(p.name,30)}</div>
                  <div class="recent-item-meta">${client ? client.company||client.name : '—'} • ${Utils.formatDate(p.deadline)}</div>
                  <div class="progress thin" style="margin-top:5px;width:80%;"><div class="progress-bar" style="width:${p.progress}%"></div></div>
                </div>
                <div style="text-align:right;flex-shrink:0;">
                  ${Utils.getStatusBadge(p.status)}
                  <div style="font-size:10px;color:var(--text-muted);margin-top:4px;">${p.progress}%</div>
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>`;
  }

  function renderRecentNotes(notes) {
    const pinned = [...notes].filter(n=>n.isPinned).slice(0,3);
    const recent = [...notes].sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt)).slice(0,3);
    const display = pinned.length ? pinned : recent;
    return `
      <div class="widget-card">
        <div class="widget-header">
          <div class="widget-title"><span class="widget-title-icon">📝</span>Pinned Notes</div>
          <button class="widget-action-btn" onclick="Router.navigate('notes')" title="View all">→</button>
        </div>
        <div class="widget-body" style="padding:8px;">
          ${!display.length ? `<div style="text-align:center;color:var(--text-muted);padding:1rem;font-size:var(--text-sm);">No notes yet</div>` :
            display.map(n => `
              <div class="note-list-item" onclick="Router.navigate('notes')" style="margin-bottom:6px;">
                <div class="note-list-title">${n.isPinned?'📌 ':''}${Utils.truncate(n.title||'Untitled',28)}</div>
                <div class="note-list-preview">${Utils.truncate(n.content||'',55)}</div>
                <div class="note-list-date">${Utils.formatRelativeTime(n.updatedAt)}</div>
              </div>`).join('')}
          <button class="btn btn-ghost btn-sm" style="width:100%;margin-top:4px;" onclick="Notes.createNote()">+ New Note</button>
        </div>
      </div>`;
  }

  function renderCashFlow(data) {
    const totalRev = Utils.sumBy(data, 'revenue');
    const totalExp = Utils.sumBy(data, 'expenses');
    const net = totalRev - totalExp;
    return `
      <div class="widget-card">
        <div class="widget-header">
          <div class="widget-title"><span class="widget-title-icon">💹</span>Cash Flow Summary (Last 6 Months)</div>
        </div>
        <div class="widget-body">
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:16px;">
            <div style="text-align:center;">
              <div style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:4px;">Total Income</div>
              <div style="font-size:var(--text-xl);font-weight:700;color:var(--accent-primary);">${Utils.formatCurrency(totalRev,'USD',true)}</div>
            </div>
            <div style="text-align:center;">
              <div style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:4px;">Total Expenses</div>
              <div style="font-size:var(--text-xl);font-weight:700;color:var(--status-error);">${Utils.formatCurrency(totalExp,'USD',true)}</div>
            </div>
            <div style="text-align:center;">
              <div style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:4px;">Net Cash Flow</div>
              <div style="font-size:var(--text-xl);font-weight:700;color:${net>=0?'var(--accent-primary)':'var(--status-error)'};">${Utils.formatCurrency(net,'USD',true)}</div>
            </div>
          </div>
          <div class="progress" style="height:8px;">
            <div class="progress-bar" style="width:${Math.round(totalRev/(totalRev+totalExp||1)*100)}%;background:var(--accent-primary);"></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-muted);margin-top:4px;">
            <span>Revenue ${Math.round(totalRev/(totalRev+totalExp||1)*100)}%</span>
            <span>Expenses ${Math.round(totalExp/(totalRev+totalExp||1)*100)}%</span>
          </div>
        </div>
      </div>`;
  }

  function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  }

  return { renderPage };
})();
