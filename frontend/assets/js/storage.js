/* ============================================================
   STORAGE.JS — LocalStorage CRUD + Mock Data Generation
   ============================================================ */

const Storage = (() => {

  const PREFIX = 'bos_';

  // ── Core ──
  function get(key) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage error:', e);
      return false;
    }
  }

  function remove(key) {
    localStorage.removeItem(PREFIX + key);
  }

  function clear() {
    Object.keys(localStorage)
      .filter(k => k.startsWith(PREFIX))
      .forEach(k => localStorage.removeItem(k));
  }

  // ── Collections ──
  function getAll(collection) {
    return get(collection) || [];
  }

  function getById(collection, id) {
    return getAll(collection).find(item => item.id === id) || null;
  }

  function create(collection, data) {
    const items = getAll(collection);
    const item = { ...data, id: data.id || Utils.generateId(collection.slice(0, 3)), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    items.push(item);
    set(collection, items);
    return item;
  }

  function update(collection, id, data) {
    const items = getAll(collection);
    const idx = items.findIndex(item => item.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...data, updatedAt: new Date().toISOString() };
    set(collection, items);
    return items[idx];
  }

  function del(collection, id) {
    const items = getAll(collection).filter(item => item.id !== id);
    set(collection, items);
    return true;
  }

  function query(collection, filters = {}, sort = null, dir = 'asc') {
    let items = getAll(collection);
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        items = items.filter(item => {
          const itemVal = item[key];
          if (Array.isArray(value)) return value.includes(itemVal);
          return String(itemVal).toLowerCase().includes(String(value).toLowerCase());
        });
      }
    });
    if (sort) items = Utils.sortBy(items, sort, dir);
    return items;
  }

  // ══════════════════════════════════════════════════════════
  // MOCK DATA GENERATION
  // ══════════════════════════════════════════════════════════

  const firstNames = ['James','Sarah','Michael','Emily','David','Lisa','Robert','Jennifer','William','Amanda','Thomas','Jessica','Christopher','Ashley','Daniel','Stephanie','Matthew','Nicole','Andrew','Megan','John','Rachel','Mark','Lauren','Kevin','Samantha','Steven','Amber','Paul','Brittany','Ryan','Heather','Brian','Melissa','Scott','Kelly','George','Amy','Kenneth','Rebecca'];
  const lastNames  = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Wilson','Moore','Taylor','Anderson','Thomas','Jackson','White','Harris','Martin','Thompson','Martinez','Robinson','Clark','Rodriguez','Lewis','Lee','Walker','Hall','Allen','Young','Hernandez','King','Wright','Lopez','Hill','Scott','Green','Adams','Baker','Gonzalez','Nelson'];
  const companies  = ['TechVision Inc','Apex Solutions','GlobalTrade Corp','NextGen Systems','Pinnacle Group','Horizon Digital','Summit Enterprises','Catalyst Partners','Velocity Media','Forte Technologies','BlueSky Innovations','Meridian Group','Quantum Dynamics','Nexus Corp','Orion Strategies','Vertex Partners','Luminary Labs','Titan Industries','Aurora Brands','Crestview Holdings'];
  const industries = ['Technology','Finance','Healthcare','Manufacturing','Retail','Education','Real Estate','Media','Consulting','Energy','Logistics','Marketing','Legal','Construction','Food & Beverage'];
  const cities     = ['New York','Los Angeles','Chicago','Houston','Phoenix','Philadelphia','San Antonio','San Diego','Dallas','San Jose','Austin','Jacksonville','Fort Worth','Columbus','Charlotte'];
  const states     = ['NY','CA','IL','TX','AZ','PA','TX','CA','TX','CA','TX','FL','TX','OH','NC'];
  const domains    = ['gmail.com','company.com','business.net','enterprise.org','corp.io','solutions.co'];
  const projectNames = ['Website Redesign','Mobile App Development','Cloud Migration','ERP Implementation','Brand Identity','Digital Marketing Campaign','Data Analytics Platform','E-commerce Platform','CRM Integration','Security Audit','API Development','Content Strategy','Product Launch','Infrastructure Upgrade','Sales Training Program'];
  const projectPrefixes = ['Project','Initiative','Program','Campaign','Phase'];
  const notesTitles = ['Meeting Notes','Client Call Summary','Strategy Planning','Q3 Review','Budget Discussion','Product Roadmap','Team Standup','Investor Update','Partnership Discussion','Technical Review','Design Feedback','Launch Checklist','Risk Assessment','Performance Review','Market Research'];
  const invoiceDescs = ['Web Development Services','Consulting Services','Software License','Design Package','Monthly Retainer','Project Milestone Payment','Annual Support Contract','Training Services','Marketing Campaign','Implementation Services'];

  function randDate(daysBack, daysForward = 0) {
    const d = new Date();
    d.setDate(d.getDate() - Utils.randomBetween(0, daysBack) + daysForward);
    return d.toISOString().split('T')[0];
  }

  function randFuture(daysFrom, daysTo) {
    const d = new Date();
    d.setDate(d.getDate() + Utils.randomBetween(daysFrom, daysTo));
    return d.toISOString().split('T')[0];
  }

  function randName() {
    return Utils.pickRandom(firstNames) + ' ' + Utils.pickRandom(lastNames);
  }

  function randEmail(name) {
    const clean = name.toLowerCase().replace(/\s+/g, '.');
    return `${clean}@${Utils.pickRandom(domains)}`;
  }

  function randPhone() {
    return `+1 (${Utils.randomBetween(200, 999)}) ${Utils.randomBetween(200, 999)}-${Utils.randomBetween(1000, 9999)}`;
  }

  function randGST() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({length: 15}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  function randPAN() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return Array.from({length: 5}, () => letters[Math.floor(Math.random() * 26)]).join('') +
           Utils.randomBetween(1000, 9999) + letters[Math.floor(Math.random() * 26)];
  }

  // ── Seed Clients (30) ──
  function seedClients() {
    const existing = getAll('clients');
    if (existing.length > 0) return;
    const statuses = ['active','active','active','active','inactive'];
    const tags = [['VIP','Tech'],['Enterprise'],['SMB'],['Startup','Hot'],['Partner']];
    const clients = Array.from({ length: 30 }, (_, i) => {
      const name = randName();
      const company = Utils.pickRandom(companies);
      const cityIdx = i % cities.length;
      return {
        id: `cli_${i+1}`,
        name,
        company,
        email: randEmail(name),
        phone: randPhone(),
        status: Utils.pickRandom(statuses),
        industry: Utils.pickRandom(industries),
        gst: randGST(),
        pan: randPAN(),
        address: `${Utils.randomBetween(100, 9999)} ${Utils.pickRandom(['Main St','Oak Ave','Park Blvd','Commerce Dr','Business Way'])}`,
        city: cities[cityIdx],
        state: states[cityIdx],
        country: 'USA',
        website: `www.${company.toLowerCase().replace(/[^a-z0-9]+/g, '')}.com`,
        totalRevenue: Utils.randomBetween(15000, 450000),
        totalProjects: Utils.randomBetween(1, 12),
        totalInvoices: Utils.randomBetween(2, 20),
        outstandingAmount: Utils.randomBetween(0, 50000),
        tags: Utils.pickRandom(tags),
        isFavorite: i < 5,
        notes: `Key client since ${Utils.randomBetween(2019, 2024)}. ${Utils.pickRandom(['Excellent partner', 'High priority account', 'Growing relationship', 'Long-term client'])}.`,
        avatar: Utils.getAvatarColor(name),
        joinDate: randDate(900, 0),
        lastActivity: randDate(30, 0),
        createdAt: randDate(900, 0),
        updatedAt: randDate(30, 0),
      };
    });
    set('clients', clients);
  }

  // ── Seed Leads (20) ──
  function seedLeads() {
    if (getAll('leads').length > 0) return;
    const stages = ['new','contacted','qualified','proposal','won','won','lost'];
    const sources = ['Website','Referral','LinkedIn','Cold Call','Conference','Email Campaign','Partner'];
    const leads = Array.from({ length: 20 }, (_, i) => {
      const name = randName();
      const stage = Utils.pickRandom(stages);
      return {
        id: `lead_${i+1}`,
        name,
        company: Utils.pickRandom(companies),
        email: randEmail(name),
        phone: randPhone(),
        stage,
        source: Utils.pickRandom(sources),
        value: Utils.randomBetween(5000, 200000),
        probability: { new: 10, contacted: 25, qualified: 50, proposal: 70, won: 100, lost: 0 }[stage] || 10,
        assignedTo: randName(),
        industry: Utils.pickRandom(industries),
        nextFollowUp: randFuture(1, 30),
        notes: `Interested in ${Utils.pickRandom(['enterprise plan', 'custom solution', 'migration services', 'consulting package'])}.`,
        createdAt: randDate(180, 0),
        updatedAt: randDate(30, 0),
      };
    });
    set('leads', leads);
  }

  // ── Seed Projects (40) ──
  function seedProjects() {
    if (getAll('projects').length > 0) return;
    const statuses = ['planning','in-progress','in-progress','in-progress','completed','completed','on-hold'];
    const priorities = ['low','medium','medium','high','critical'];
    const clientIds = Array.from({length: 30}, (_, i) => `cli_${i+1}`);
    const projects = Array.from({ length: 40 }, (_, i) => {
      const budget = Utils.randomBetween(20000, 300000);
      const spent = Utils.randomBetween(budget * 0.1, budget * 0.95);
      const status = Utils.pickRandom(statuses);
      const progress = status === 'completed' ? 100 : status === 'planning' ? Utils.randomBetween(0, 20) : Utils.randomBetween(20, 90);
      const clientId = clientIds[i % clientIds.length];
      return {
        id: `proj_${i+1}`,
        name: `${Utils.pickRandom(projectNames)} ${i > 14 ? Math.ceil(i/3) : ''}`.trim(),
        clientId,
        status,
        priority: Utils.pickRandom(priorities),
        progress,
        budget,
        spent,
        profit: budget - spent,
        startDate: randDate(365, 0),
        deadline: status === 'completed' ? randDate(0, 0) : randFuture(10, 180),
        description: `${Utils.pickRandom(projectNames)} for ${Utils.pickRandom(companies)}. Focus on delivering high-quality results.`,
        tags: [Utils.pickRandom(['Web','Mobile','Design','Backend','API','Data']), Utils.pickRandom(['Active','Priority','Q4'])],
        milestones: generateMilestones(i),
        isPinned: i < 3,
        teamSize: Utils.randomBetween(2, 8),
        createdAt: randDate(400, 0),
        updatedAt: randDate(14, 0),
      };
    });
    set('projects', projects);
  }

  function generateMilestones(seed) {
    const names = ['Kickoff & Discovery', 'Design Approval', 'Development Phase 1', 'Development Phase 2', 'QA & Testing', 'Deployment', 'Client Review', 'Project Sign-off'];
    const count = Utils.randomBetween(3, 6);
    return names.slice(0, count).map((name, i) => ({
      id: Utils.generateId('ms'),
      name,
      dueDate: randFuture(i * 14, i * 14 + 20),
      done: i < Math.floor(count * 0.4),
    }));
  }

  // ── Seed Quotations (25) ──
  function seedQuotations() {
    if (getAll('quotations').length > 0) return;
    const statuses = ['draft','sent','accepted','accepted','declined','expired'];
    const quotations = Array.from({ length: 25 }, (_, i) => {
      const clientId = `cli_${(i % 30) + 1}`;
      const subtotal = Utils.randomBetween(10000, 200000);
      const tax = Math.round(subtotal * 0.18);
      return {
        id: `quo_${i+1}`,
        number: `QUO-${2024000 + i + 1}`,
        clientId,
        title: `${Utils.pickRandom(invoiceDescs)} Proposal`,
        status: Utils.pickRandom(statuses),
        subtotal,
        tax,
        total: subtotal + tax,
        validUntil: randFuture(15, 60),
        notes: 'Prices are valid for 30 days from the date of issue.',
        items: generateLineItems(3),
        createdAt: randDate(180, 0),
        updatedAt: randDate(30, 0),
      };
    });
    set('quotations', quotations);
  }

  // ── Seed Invoices (35) ──
  function seedInvoices() {
    if (getAll('invoices').length > 0) return;
    const statuses = ['paid','paid','paid','sent','draft','overdue','partial'];
    const invoices = Array.from({ length: 35 }, (_, i) => {
      const clientId = `cli_${(i % 30) + 1}`;
      const projectId = `proj_${(i % 40) + 1}`;
      const subtotal = Utils.randomBetween(5000, 150000);
      const tax = Math.round(subtotal * 0.18);
      const total = subtotal + tax;
      const status = Utils.pickRandom(statuses);
      const paidAmount = status === 'paid' ? total : status === 'partial' ? Math.round(total * 0.5) : 0;
      return {
        id: `inv_${i+1}`,
        number: `INV-${2024000 + i + 1}`,
        clientId, projectId,
        title: Utils.pickRandom(invoiceDescs),
        status,
        subtotal, tax, total,
        paidAmount,
        balance: total - paidAmount,
        issueDate: randDate(180, 0),
        dueDate: status === 'overdue' ? randDate(30, -30) : randFuture(5, 45),
        items: generateLineItems(Utils.randomBetween(2, 5)),
        notes: 'Payment due within 30 days. Late fees apply after due date.',
        createdAt: randDate(180, 0),
        updatedAt: randDate(14, 0),
      };
    });
    set('invoices', invoices);
  }

  function generateLineItems(count) {
    const services = ['Web Development','UI Design','Backend API','Database Setup','Cloud Hosting','SEO Optimization','Content Creation','Testing & QA','Project Management','Training'];
    return Array.from({ length: count }, () => {
      const qty = Utils.randomBetween(1, 20);
      const rate = Utils.randomBetween(500, 15000);
      return { description: Utils.pickRandom(services), qty, rate, amount: qty * rate };
    });
  }

  // ── Seed Payments (35) ──
  function seedPayments() {
    if (getAll('payments').length > 0) return;
    const methods = ['Bank Transfer','Credit Card','Cash','Check','UPI','Wire Transfer'];
    const payments = Array.from({ length: 35 }, (_, i) => ({
      id: `pay_${i+1}`,
      reference: `PAY-${2024000 + i + 1}`,
      invoiceId: `inv_${(i % 35) + 1}`,
      clientId: `cli_${(i % 30) + 1}`,
      amount: Utils.randomBetween(3000, 100000),
      method: Utils.pickRandom(methods),
      status: Utils.pickRandom(['completed','completed','completed','pending','failed']),
      date: randDate(180, 0),
      notes: `Payment for ${Utils.pickRandom(invoiceDescs)}`,
      createdAt: randDate(180, 0),
      updatedAt: randDate(14, 0),
    }));
    set('payments', payments);
  }

  // ── Seed Expenses (20) ──
  function seedExpenses() {
    if (getAll('expenses').length > 0) return;
    const categories = ['Software','Hardware','Travel','Marketing','Office','Utilities','Salaries','Contractors','Legal','Miscellaneous'];
    const expenses = Array.from({ length: 20 }, (_, i) => ({
      id: `exp_${i+1}`,
      title: `${Utils.pickRandom(categories)} Expense`,
      category: Utils.pickRandom(categories),
      amount: Utils.randomBetween(500, 50000),
      vendor: Utils.pickRandom(companies),
      status: Utils.pickRandom(['approved','pending','rejected']),
      date: randDate(180, 0),
      projectId: Math.random() > 0.4 ? `proj_${Utils.randomBetween(1, 40)}` : null,
      notes: 'Expense submitted for approval.',
      receipt: null,
      createdAt: randDate(180, 0),
      updatedAt: randDate(14, 0),
    }));
    set('expenses', expenses);
  }

  // ── Seed Documents (60) ──
  function seedDocuments() {
    if (getAll('documents').length > 0) return;
    const types = ['pdf','excel','word','img','pdf','word','excel'];
    const folders = ['Contracts','Proposals','Reports','Invoices','Legal','Marketing','Technical','Finance'];
    const docNames = ['Service Agreement','Project Proposal','Annual Report','Invoice Template','NDA','Marketing Plan','Technical Spec','Financial Statement','Brand Guidelines','SLA Document','Employee Handbook','Privacy Policy'];
    const docs = Array.from({ length: 60 }, (_, i) => {
      const type = Utils.pickRandom(types);
      const ext = { pdf: 'pdf', excel: 'xlsx', word: 'docx', img: 'png' }[type];
      return {
        id: `doc_${i+1}`,
        name: `${Utils.pickRandom(docNames)} ${i > 11 ? Math.ceil(i/5) : ''}.${ext}`.trim(),
        type,
        folder: Utils.pickRandom(folders),
        size: `${Utils.randomBetween(100, 9999)} KB`,
        clientId: Math.random() > 0.3 ? `cli_${Utils.randomBetween(1, 30)}` : null,
        projectId: Math.random() > 0.5 ? `proj_${Utils.randomBetween(1, 40)}` : null,
        tags: [Utils.pickRandom(['Important','Draft','Final','Template','Archive'])],
        uploadedBy: randName(),
        uploadedAt: randDate(365, 0),
        createdAt: randDate(365, 0),
        updatedAt: randDate(60, 0),
      };
    });
    set('documents', docs);
  }

  // ── Seed Notes (30) ──
  function seedNotes() {
    if (getAll('notes').length > 0) return;
    const categories = ['Meeting','Strategy','Personal','Client','Technical','Finance'];
    const noteBodies = [
      'Discussed project timelines and deliverables. Client is happy with progress so far.',
      'Need to follow up on pending invoices and payment status.',
      'Key insights from today\'s strategy session. Focus areas: growth, efficiency, client retention.',
      'Technical debt items to address in Q4 sprint cycle.',
      'Ideas for new service offerings based on client feedback.',
      'Budget planning for next quarter. Review expenses and forecast revenue.',
    ];
    const notes = Array.from({ length: 30 }, (_, i) => ({
      id: `note_${i+1}`,
      title: notesTitles[i % notesTitles.length],
      content: Utils.pickRandom(noteBodies),
      category: Utils.pickRandom(categories),
      isPinned: i < 4,
      isTodo: i % 5 === 0,
      tags: [Utils.pickRandom(['Work','Personal','Important','Follow-up'])],
      clientId: Math.random() > 0.5 ? `cli_${Utils.randomBetween(1, 30)}` : null,
      projectId: Math.random() > 0.5 ? `proj_${Utils.randomBetween(1, 40)}` : null,
      color: Utils.pickRandom(['', '', '', 'green', 'gold']),
      createdAt: randDate(180, 0),
      updatedAt: randDate(30, 0),
    }));
    set('notes', notes);
  }

  // ── Seed Calendar Events ──
  function seedCalendarEvents() {
    if (getAll('events').length > 0) return;
    const eventTypes = ['meeting','deadline','payment','renewal','event'];
    const eventTitles = {
      meeting: ['Client Call','Team Standup','Strategy Meeting','Discovery Call','Review Session','Kickoff Meeting'],
      deadline: ['Project Deadline','Invoice Due','Report Due','Proposal Deadline','Contract Renewal'],
      payment: ['Payment Due','Invoice Payment','Retainer Payment','Milestone Payment'],
      renewal: ['Contract Renewal','License Renewal','Subscription Renewal'],
      event: ['Company Anniversary','Product Launch','Conference','Webinar','Training Session'],
    };
    const events = [];
    for (let i = 0; i < 50; i++) {
      const type = Utils.pickRandom(eventTypes);
      const titles = eventTitles[type];
      const eventDate = Math.random() > 0.3 ? randFuture(1, 90) : randDate(30, 0);
      events.push({
        id: `evt_${i+1}`,
        title: Utils.pickRandom(titles),
        type,
        date: eventDate,
        time: `${Utils.randomBetween(8, 18)}:${Utils.pickRandom(['00','15','30','45'])}`,
        duration: Utils.randomBetween(30, 120),
        description: `${Utils.pickRandom(titles)} - Important business event.`,
        clientId: Math.random() > 0.4 ? `cli_${Utils.randomBetween(1, 30)}` : null,
        projectId: Math.random() > 0.5 ? `proj_${Utils.randomBetween(1, 40)}` : null,
        createdAt: randDate(60, 0),
        updatedAt: randDate(14, 0),
      });
    }
    set('events', events);
  }

  // ── Seed Activities ──
  function seedActivities() {
    if (getAll('activities').length > 0) return;
    const actions = [
      { type: 'client_added', icon: '👤', color: 'green' },
      { type: 'invoice_paid', icon: '💰', color: 'green' },
      { type: 'project_created', icon: '🚀', color: 'blue' },
      { type: 'payment_received', icon: '✓', color: 'green' },
      { type: 'lead_converted', icon: '🎯', color: 'gold' },
      { type: 'document_uploaded', icon: '📄', color: 'blue' },
      { type: 'invoice_sent', icon: '📧', color: 'blue' },
      { type: 'project_completed', icon: '✅', color: 'green' },
    ];
    const activities = Array.from({ length: 50 }, (_, i) => {
      const action = Utils.pickRandom(actions);
      return {
        id: `act_${i+1}`,
        ...action,
        description: generateActivityDesc(action.type),
        entityId: Utils.generateId('ent'),
        timestamp: new Date(Date.now() - Utils.randomBetween(0, 30 * 24 * 60 * 60 * 1000)).toISOString(),
      };
    });
    set('activities', activities);
  }

  function generateActivityDesc(type) {
    const templates = {
      client_added:   [`New client <strong>${randName()}</strong> was added to the system.`],
      invoice_paid:   [`Invoice <strong>INV-${Utils.randomBetween(2024001, 2024035)}</strong> marked as paid. Amount: ${Utils.formatCurrency(Utils.randomBetween(5000, 80000))}`],
      project_created:[`Project <strong>${Utils.pickRandom(projectNames)}</strong> was created and assigned.`],
      payment_received:[`Payment of <strong>${Utils.formatCurrency(Utils.randomBetween(5000, 80000))}</strong> received from client.`],
      lead_converted: [`Lead <strong>${randName()}</strong> converted to client successfully.`],
      document_uploaded:[`New document uploaded to <strong>${Utils.pickRandom(['Contracts','Reports','Proposals'])}</strong>.`],
      invoice_sent:   [`Invoice sent to <strong>${randName()}</strong> for review.`],
      project_completed:[`Project <strong>${Utils.pickRandom(projectNames)}</strong> marked as completed.`],
    };
    return Utils.pickRandom(templates[type] || ['Activity logged.']);
  }

  // ── Seed Company Settings ──
  function seedSettings() {
    if (get('settings')) return;
    set('settings', {
      company: {
        name: 'Apex Solutions Ltd.',
        email: 'info@apexsolutions.com',
        phone: '+1 (800) 123-4567',
        website: 'www.apexsolutions.com',
        address: '123 Business Ave, New York, NY 10001',
        gst: '29AAACB1234F1ZS',
        pan: 'AAACB1234F',
        currency: 'USD',
        logo: null,
      },
      invoice: {
        prefix: 'INV-',
        startNumber: 2024001,
        dueDays: 30,
        taxRate: 18,
        notes: 'Payment due within 30 days. Late payment fee of 1.5% per month applies.',
        footer: 'Thank you for your business!',
      },
      theme: 'dark',
      notifications: { email: true, browser: true, sms: false },
    });
  }

  // ── Initialize all seed data ──
  function initSeedData() {
    seedClients();
    seedLeads();
    seedProjects();
    seedQuotations();
    seedInvoices();
    seedPayments();
    seedExpenses();
    seedDocuments();
    seedNotes();
    seedCalendarEvents();
    seedActivities();
    seedSettings();
  }

  return {
    get, set, remove, clear,
    getAll, getById, create, update, del, query,
    initSeedData,
  };
})();
