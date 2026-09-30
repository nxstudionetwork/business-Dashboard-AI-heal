/* ============================================================
   SETTINGS.JS — Application Settings
   ============================================================ */

const Settings = (() => {
  function renderPage() {
    const settings = Storage.get('settings') || {};
    const company = settings.company || {};
    const invoice = settings.invoice || {};
    const notification = settings.notifications || {};

    Utils.renderPage(`
      ${UI.buildBreadcrumb([{ label: 'Dashboard', href: '#dashboard', page: 'dashboard' }, { label: 'Settings' }])}
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Settings</h1>
          <p class="page-subtitle">Configure company details, billing settings, and application preferences.</p>
        </div>
      </div>
      <div class="settings-grid">
        <section class="settings-card">
          <h2>Company Profile</h2>
          <div class="form-grid">
            <label>Company name<input type="text" id="companyName" class="form-input" value="${company.name || ''}" /></label>
            <label>Email<input type="email" id="companyEmail" class="form-input" value="${company.email || ''}" /></label>
            <label>Phone<input type="text" id="companyPhone" class="form-input" value="${company.phone || ''}" /></label>
            <label>Website<input type="text" id="companyWebsite" class="form-input" value="${company.website || ''}" /></label>
            <label>Address<textarea id="companyAddress" class="form-textarea" rows="3">${company.address || ''}</textarea></label>
            <label>GST Number<input type="text" id="companyGST" class="form-input" value="${company.gst || ''}" /></label>
            <label>PAN Number<input type="text" id="companyPAN" class="form-input" value="${company.pan || ''}" /></label>
          </div>
        </section>

        <section class="settings-card">
          <h2>Invoice Settings</h2>
          <div class="form-grid">
            <label>Invoice Prefix<input type="text" id="invoicePrefix" class="form-input" value="${invoice.prefix || 'INV-'}" /></label>
            <label>Start Number<input type="number" id="invoiceStart" class="form-input" value="${invoice.startNumber || 2024001}" /></label>
            <label>Payment Terms (days)<input type="number" id="invoiceDueDays" class="form-input" value="${invoice.dueDays || 30}" /></label>
            <label>Tax Rate (%)<input type="number" id="invoiceTaxRate" class="form-input" value="${invoice.taxRate || 18}" /></label>
            <label>Invoice Notes<textarea id="invoiceNotes" class="form-textarea" rows="3">${invoice.notes || ''}</textarea></label>
            <label>Footer Text<textarea id="invoiceFooter" class="form-textarea" rows="3">${invoice.footer || ''}</textarea></label>
          </div>
        </section>

        <section class="settings-card">
          <h2>Application Preferences</h2>
          <div class="form-grid">
            <label>Notifications<select id="notifEmail" class="form-select">
                <option value="true" ${notification.email ? 'selected' : ''}>Email Alerts</option>
                <option value="false" ${!notification.email ? 'selected' : ''}>No Email Alerts</option>
              </select></label>
            <label>Browser Alerts<select id="notifBrowser" class="form-select">
                <option value="true" ${notification.browser ? 'selected' : ''}>Enabled</option>
                <option value="false" ${!notification.browser ? 'selected' : ''}>Disabled</option>
              </select></label>
            <label>SMS Alerts<select id="notifSMS" class="form-select">
                <option value="true" ${notification.sms ? 'selected' : ''}>Enabled</option>
                <option value="false" ${!notification.sms ? 'selected' : ''}>Disabled</option>
              </select></label>
          </div>
        </section>
      </div>
      <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:16px;">
        <button class="btn btn-secondary" onclick="Settings.resetDefaults()">Reset Defaults</button>
        <button class="btn btn-primary" onclick="Settings.saveSettings()">Save Settings</button>
      </div>
    `);
  }

  function saveSettings() {
    const settings = Storage.get('settings') || {};
    settings.company = {
      name: document.getElementById('companyName')?.value || '',
      email: document.getElementById('companyEmail')?.value || '',
      phone: document.getElementById('companyPhone')?.value || '',
      website: document.getElementById('companyWebsite')?.value || '',
      address: document.getElementById('companyAddress')?.value || '',
      gst: document.getElementById('companyGST')?.value || '',
      pan: document.getElementById('companyPAN')?.value || '',
    };
    settings.invoice = {
      prefix: document.getElementById('invoicePrefix')?.value || 'INV-',
      startNumber: parseInt(document.getElementById('invoiceStart')?.value, 10) || 2024001,
      dueDays: parseInt(document.getElementById('invoiceDueDays')?.value, 10) || 30,
      taxRate: parseFloat(document.getElementById('invoiceTaxRate')?.value) || 18,
      notes: document.getElementById('invoiceNotes')?.value || '',
      footer: document.getElementById('invoiceFooter')?.value || '',
    };
    settings.notifications = {
      email: document.getElementById('notifEmail')?.value === 'true',
      browser: document.getElementById('notifBrowser')?.value === 'true',
      sms: document.getElementById('notifSMS')?.value === 'true',
    };
    Storage.set('settings', settings);
    UI.toast('Settings saved successfully.', 'success');
  }

  function resetDefaults() {
    UI.confirm('Reset settings to defaults? This will restore company and invoice settings.', 'Reset Settings', () => {
      Storage.remove('settings');
      Storage.initSeedData();
      renderPage();
      UI.toast('Settings reset to defaults.', 'info');
    });
  }

  return { renderPage, saveSettings, resetDefaults };
})();
