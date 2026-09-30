/* ============================================================
   REPORTS.JS — Reports & Analytics Module
   ============================================================ */

const Reports = (() => {

  function renderPage() {
    const invoices  = Storage.getAll('invoices');
    const payments  = Storage.getAll('payments');
    const expenses  = Storage.getAll('expenses');
    const clients   = Storage.getAll('clients');
    const projects  = Storage.getAll('projects');

    const totalRev   = Utils.sumBy(invoices.filter(i=>i.status==='paid'),'total');
    const totalExp   = Utils.sumBy(expenses,'amount');
    const profit     = totalRev - totalExp;
    const outstanding= Utils.sumBy(invoices.filter(i=>i.status!=='paid'&&i.status!=='cancelled'),'balance');

    Utils.renderPage(`
      ${UI.buildBreadcrumb([{label:'Dashboard',href:'#dashboard',page:'dashboard'},{label:'Reports'}])}
      <div class="page-header">
        <div class="page-header-left"><h1 class="page-title">Reports & Analytics</h1>
          <p class="page-subtitle">Business performance overview</p></div>
        <div class="page-header-right">
          <select class="form-select" id="reportPeriod" style="height:36px;width:auto;" onchange="Reports.refresh()">
            <option value="6">Last 6 months</option><option value="12">Last 12 months</option><option value="3">Last 3 months</option>
          </select>
          <button class="btn btn-secondary btn-sm" onclick="Reports.exportReport()">⬇ Export</button>
        </div>
      </div>

      <div class="stats-row stagger-children">
        <div class="stat-card accent-green"><div class="stat-card-header"><span class="stat-card-title">Total Revenue</span><div class="stat-card-icon green">💰</div></div><div class="stat-card-value">${Utils.formatCurrency(totalRev,'USD',true)}</div><div class="stat-card-change up">↑ From paid invoices</div></div>
        <div class="stat-card accent-red"><div class="stat-card-header"><span class="stat-card-title">Total Expenses</span><div class="stat-card-icon red">💸</div></div><div class="stat-card-value">${Utils.formatCurrency(totalExp,'USD',true)}</div><div class="stat-card-change down">↓ All categories</div></div>
        <div class="stat-card accent-gold"><div class="stat-card-header"><span class="stat-card-title">Net Profit</span><div class="stat-card-icon gold">📈</div></div><div class="stat-card-value">${Utils.formatCurrency(profit,'USD',true)}</div><div class="stat-card-change ${profit>0?'up':'down'}">${profit>0?'↑ Profitable':'↓ Loss'}</div></div>
        <div class="stat-card"><div class="stat-card-header"><span class="stat-card-title">Outstanding</span><div class="stat-card-icon blue">⏳</div></div><div class="stat-card-value">${Utils.formatCurrency(outstanding,'USD',true)}</div><div class="stat-card-change neutral">→ Pending collection</div></div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;" id="chartsRow">
        <div class="widget-card">
          <div class="widget-header"><div class="widget-title"><span class="widget-title-icon">📊</span>Revenue vs Expenses</div></div>
          <div class="widget-body" id="revenueChart"></div>
        </div>
        <div class="widget-card">
          <div class="widget-header"><div class="widget-title"><span class="widget-title-icon">📂</span>Expenses by Category</div></div>
          <div class="widget-body" id="expenseChart"></div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;" id="tablesRow">
        <div class="widget-card">
          <div class="widget-header"><div class="widget-title"><span class="widget-title-icon">👥</span>Top Clients by Revenue</div></div>
          <div class="widget-body" style="padding:0;" id="topClientsTable"></div>
        </div>
        <div class="widget-card">
          <div class="widget-header"><div class="widget-title"><span class="widget-title-icon">🚀</span>Project Status Breakdown</div></div>
          <div class="widget-body" id="projectChart"></div>
        </div>
      </div>
    `);
    renderRevenueChart(invoices, expenses);
    renderExpenseChart(expenses);
    renderTopClients(clients, invoices);
    renderProjectChart(projects);
  }

  function getMonthLabels(months = 6) {
    const labels = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push({ label: d.toLocaleString('default',{month:'short'}), year: d.getFullYear(), month: d.getMonth() });
    }
    return labels;
  }

  function renderRevenueChart(invoices, expenses) {
    const el = document.getElementById('revenueChart');
    if (!el) return;
    const months = getMonthLabels(parseInt(document.getElementById('reportPeriod')?.value) || 6);
    const revData = months.map(m => Utils.sumBy(invoices.filter(i => { const d=new Date(i.issueDate); return d.getMonth()===m.month&&d.getFullYear()===m.year&&i.status==='paid'; }), 'total'));
    const expData = months.map(m => Utils.sumBy(expenses.filter(e => { const d=new Date(e.date); return d.getMonth()===m.month&&d.getFullYear()===m.year; }), 'amount'));
    const maxVal = Math.max(...revData, ...expData, 1);

    el.innerHTML = `
      <div style="display:flex;align-items:flex-end;gap:8px;height:180px;padding:0 8px 8px;">
        ${months.map((m,i) => {
          const rh = Math.round((revData[i]/maxVal)*150);
          const eh = Math.round((expData[i]/maxVal)*150);
          return `
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;">
              <div style="display:flex;align-items:flex-end;gap:2px;height:150px;">
                <div style="width:14px;height:${rh}px;background:var(--accent-primary);border-radius:3px 3px 0 0;opacity:0.9;" title="Revenue: ${Utils.formatCurrency(revData[i])}"></div>
                <div style="width:14px;height:${eh}px;background:var(--status-error);border-radius:3px 3px 0 0;opacity:0.7;" title="Expenses: ${Utils.formatCurrency(expData[i])}"></div>
              </div>
              <div style="font-size:9px;color:var(--text-muted);">${m.label}</div>
            </div>`;
        }).join('')}
      </div>
      <div style="display:flex;gap:16px;padding:0 8px 8px;">
        <div style="display:flex;align-items:center;gap:6px;font-size:var(--text-xs);color:var(--text-secondary);"><span style="width:10px;height:10px;border-radius:2px;background:var(--accent-primary);display:inline-block;"></span>Revenue</div>
        <div style="display:flex;align-items:center;gap:6px;font-size:var(--text-xs);color:var(--text-secondary);"><span style="width:10px;height:10px;border-radius:2px;background:var(--status-error);display:inline-block;"></span>Expenses</div>
      </div>`;
  }

  function renderExpenseChart(expenses) {
    const el = document.getElementById('expenseChart');
    if (!el) return;
    const grouped = Utils.groupBy(expenses, 'category');
    const cats = Object.entries(grouped).map(([k,v]) => ({ cat: k, total: Utils.sumBy(v,'amount') })).sort((a,b) => b.total-a.total).slice(0,7);
    const maxVal = Math.max(...cats.map(c=>c.total), 1);
    const colors = ['var(--accent-primary)','var(--accent-secondary)','var(--status-info)','var(--status-error)','var(--status-purple)','#ff6b35','var(--status-neutral)'];

    el.innerHTML = !cats.length ? `<div style="text-align:center;padding:2rem;color:var(--text-muted);">No expense data</div>` :
      `<div style="display:flex;flex-direction:column;gap:10px;">
        ${cats.map((c,i) => `
          <div>
            <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--text-secondary);margin-bottom:4px;">
              <span>${c.cat}</span><span style="font-weight:600;color:var(--text-primary);">${Utils.formatCurrency(c.total,'USD',true)}</span>
            </div>
            <div class="progress"><div class="progress-bar" style="width:${Math.round((c.total/maxVal)*100)}%;background:${colors[i%colors.length]};"></div></div>
          </div>`).join('')}
      </div>`;
  }

  function renderTopClients(clients, invoices) {
    const el = document.getElementById('topClientsTable');
    if (!el) return;
    const clientRevs = clients.map(c => ({
      client: c,
      revenue: Utils.sumBy(invoices.filter(i=>i.clientId===c.id&&i.status==='paid'),'total'),
      invoiceCount: invoices.filter(i=>i.clientId===c.id).length,
    })).sort((a,b)=>b.revenue-a.revenue).slice(0,8);

    el.innerHTML = `<table style="width:100%;border-collapse:collapse;font-size:var(--text-sm);">
      <thead><tr style="border-bottom:1px solid var(--border-subtle);">
        <th style="padding:10px 16px;text-align:left;font-size:var(--text-xs);color:var(--text-muted);text-transform:uppercase;">#</th>
        <th style="padding:10px 16px;text-align:left;font-size:var(--text-xs);color:var(--text-muted);text-transform:uppercase;">Client</th>
        <th style="padding:10px 16px;text-align:right;font-size:var(--text-xs);color:var(--text-muted);text-transform:uppercase;">Revenue</th>
        <th style="padding:10px 16px;text-align:right;font-size:var(--text-xs);color:var(--text-muted);text-transform:uppercase;">Invoices</th>
      </tr></thead>
      <tbody>${clientRevs.map((cr,i) => `
        <tr style="border-bottom:1px solid var(--border-subtle);">
          <td style="padding:10px 16px;color:var(--text-muted);">${i+1}</td>
          <td style="padding:10px 16px;">
            <div style="display:flex;align-items:center;gap:10px;">
              ${UI.buildAvatar(cr.client.name,'sm')}
              <div><div style="color:var(--text-primary);font-weight:500;">${cr.client.name}</div>
              <div style="font-size:var(--text-xs);color:var(--text-muted);">${cr.client.company||''}</div></div>
            </div>
          </td>
          <td style="padding:10px 16px;text-align:right;font-weight:600;color:var(--accent-primary);">${Utils.formatCurrency(cr.revenue,'USD',true)}</td>
          <td style="padding:10px 16px;text-align:right;color:var(--text-secondary);">${cr.invoiceCount}</td>
        </tr>`).join('')}
      </tbody></table>`;
  }

  function renderProjectChart(projects) {
    const el = document.getElementById('projectChart');
    if (!el) return;
    const statuses = ['planning','in-progress','completed','on-hold'];
    const labels = { 'planning':'Planning','in-progress':'In Progress','completed':'Completed','on-hold':'On Hold' };
    const colors = { 'planning':'var(--status-purple)','in-progress':'var(--status-info)','completed':'var(--accent-primary)','on-hold':'var(--status-warning)' };
    const counts = statuses.map(s => ({ status: s, count: projects.filter(p=>p.status===s).length }));
    const total = projects.length || 1;

    el.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:12px;">
        ${counts.map(c => `
          <div>
            <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--text-secondary);margin-bottom:4px;">
              <span>${labels[c.status]}</span>
              <span style="font-weight:600;color:var(--text-primary);">${c.count} <span style="color:var(--text-muted);font-weight:400;">(${Math.round(c.count/total*100)}%)</span></span>
            </div>
            <div class="progress"><div class="progress-bar" style="width:${Math.round(c.count/total*100)}%;background:${colors[c.status]};"></div></div>
          </div>`).join('')}
      </div>
      <div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--border-subtle);display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--text-muted);">
        <span>Total Projects: <strong style="color:var(--text-primary);">${projects.length}</strong></span>
        <span>Avg Progress: <strong style="color:var(--accent-primary);">${Math.round(Utils.sumBy(projects,'progress')/total)}%</strong></span>
      </div>`;
  }

  function refresh() { renderPage(); }

  function exportReport() {
    const invoices = Storage.getAll('invoices');
    const data = invoices.map(i => ({ Number:i.number, Status:i.status, Total:i.total, Date:i.issueDate }));
    Utils.downloadCSV(data, 'report-invoices.csv');
    UI.toast('Report exported to CSV!', 'success');
  }

  return { renderPage, refresh, exportReport };
})();
