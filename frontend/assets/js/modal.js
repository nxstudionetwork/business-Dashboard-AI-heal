/* ============================================================
   MODAL.JS — Modal System
   ============================================================ */

const Modal = (() => {

  let _onSave = null;
  let _currentType = null;
  let _currentId = null;

  function open(config) {
    const {
      title = 'Create',
      icon = '📝',
      iconBg = 'var(--accent-primary-subtle)',
      iconColor = 'var(--accent-primary)',
      body = '',
      onSave = null,
      saveLabel = 'Save',
      saveClass = 'btn-primary',
      hideFooter = false,
      size = '',
      type = null,
      editId = null,
    } = config;

    _onSave = onSave;
    _currentType = type;
    _currentId = editId;

    const overlay = document.getElementById('crudOverlay');
    const modal   = document.getElementById('crudModal');
    const titleEl = document.getElementById('crudModalTitle');
    const iconEl  = document.getElementById('crudModalIcon');
    const bodyEl  = document.getElementById('crudModalBody');
    const footerEl= document.getElementById('crudModalFooter');
    const closeBtn= document.getElementById('crudModalClose');
    const cancelBtn=document.getElementById('crudCancelBtn');
    const saveBtn = document.getElementById('crudSaveBtn');

    if (!overlay) return;

    // Set modal size, preserve glass class
    modal.className = `modal ${size}` + (modal.classList.contains('glass') ? ' glass' : '');

    // Set content
    iconEl.textContent = icon;
    iconEl.style.background = iconBg;
    iconEl.style.color = iconColor;
    titleEl.textContent = title;
    bodyEl.innerHTML = body;

    if (hideFooter) {
      footerEl.style.display = 'none';
    } else {
      footerEl.style.display = '';
      saveBtn.textContent = saveLabel;
      saveBtn.className = `btn ${saveClass}`;
    }

    overlay.classList.add('open');

    // Bind close
    closeBtn.onclick = close;
    cancelBtn.onclick = close;

    // Close on overlay click
    overlay.onclick = (e) => {
      if (e.target === overlay) close();
    };

    // Save
    saveBtn.onclick = () => {
      if (_onSave) {
        const result = _onSave();
        if (result !== false) close();
      } else {
        close();
      }
    };

    // Focus first input
    setTimeout(() => {
      const first = bodyEl.querySelector('input, textarea, select');
      if (first) first.focus();
    }, 100);
  }

  function close() {
    const overlay = document.getElementById('crudOverlay');
    if (overlay) overlay.classList.remove('open');
    _onSave = null;
    _currentType = null;
    _currentId = null;
  }

  function showLoading(saveBtn) {
    if (!saveBtn) saveBtn = document.getElementById('crudSaveBtn');
    if (saveBtn) {
      saveBtn.classList.add('loading');
      saveBtn.disabled = true;
    }
  }

  function hideLoading(saveBtn) {
    if (!saveBtn) saveBtn = document.getElementById('crudSaveBtn');
    if (saveBtn) {
      saveBtn.classList.remove('loading');
      saveBtn.disabled = false;
    }
  }

  // ── Form value helpers ──
  function getFormData(formSelector) {
    const form = document.querySelector(formSelector) || document.getElementById('crudModalBody');
    const data = {};
    form.querySelectorAll('[name]').forEach(field => {
      if (field.type === 'checkbox') data[field.name] = field.checked;
      else data[field.name] = field.value;
    });
    return data;
  }

  function validateRequired(fields) {
    let valid = true;
    fields.forEach(({ name, label }) => {
      const field = document.querySelector(`[name="${name}"]`);
      if (!field) return;
      if (!field.value.trim()) {
        field.classList.add('error');
        field.style.borderColor = 'var(--status-error)';
        valid = false;
        field.addEventListener('input', () => {
          field.classList.remove('error');
          field.style.borderColor = '';
        }, { once: true });
      }
    });
    if (!valid) {
      UI.toast('Please fill in all required fields.', 'warning');
    }
    return valid;
  }

  return { open, close, showLoading, hideLoading, getFormData, validateRequired };
})();
