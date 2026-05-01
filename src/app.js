const app = document.querySelector("#app");

const roleOptions = [
  "CEO / President",
  "Founder",
  "Chief Experience Officer",
  "Chief People Officer",
  "Chief Marketing Officer",
  "Chief Mission Officer",
  "Communications / Brand Leader",
  "Other",
];

const organizationTypes = [
  "Healthcare System",
  "Hospital",
  "Nonprofit",
  "Faith-Based Organization",
  "Education Institution",
  "Corporate / Enterprise",
  "Foundation",
  "Government / Civic Institution",
  "Other",
];

const organizationSizes = [
  "Under 100 employees",
  "100-500 employees",
  "500-2,500 employees",
  "2,500-10,000 employees",
  "10,000+ employees",
];

const promptedOptions = [
  "We are interested in an organizational theme song",
  "We want a sonic identity system",
  "We want music for patient / client experience",
  "We want employee wellness / emotional support music",
  "We want music for events, videos, or campaigns",
  "We want to improve phone / hold / IVR music",
  "We want a proprietary sound library",
  "We want to clarify our organizational identity",
  "We are navigating culture change",
  "We want to create a more emotionally coherent environment",
  "Other",
];

const connectionOptions = [
  "Patients / clients",
  "Employees",
  "Families",
  "Donors",
  "Board members",
  "Community",
  "Partners",
  "Students",
  "Members",
  "Customers",
];

const environmentOptions = [
  "Main lobby",
  "Waiting rooms",
  "Patient rooms",
  "Staff spaces",
  "Chapel / sacred spaces",
  "Phone system / hold music",
  "Website / app",
  "Events / conferences",
  "Videos / campaigns",
  "Internal meetings",
  "Leadership gatherings",
  "Wellness spaces",
  "Other",
];

const deliverableOptions = [
  "Organizational theme song",
  "Short sonic logo / motif",
  "Jingle or campaign music",
  "Piano version",
  "Orchestral / cinematic version",
  "Ambient healing soundscapes",
  "Complete emotional care album",
  "Proprietary sound library",
  "Patient experience music",
  "Employee wellness music",
  "Phone / IVR / hold music",
  "Event music package",
  "Video / media scoring",
  "Training and implementation",
  "Measurement and optimization",
  "Ongoing advisory retainer",
];

const deliverableValues = {
  "Organizational theme song": 25000,
  "Short sonic logo / motif": 15000,
  "Jingle or campaign music": 20000,
  "Ambient healing soundscapes": 30000,
  "Complete emotional care album": 75000,
  "Proprietary sound library": 100000,
  "Patient experience music": 50000,
  "Employee wellness music": 50000,
  "Phone / IVR / hold music": 25000,
  "Event music package": 30000,
  "Video / media scoring": 25000,
  "Training and implementation": 50000,
  "Measurement and optimization": 50000,
  "Ongoing advisory retainer": 15000,
};

const phaseValues = {
  "Discover only": 25000,
  "Discover + Design": 75000,
  "Discover + Design + Develop": 175000,
  "Full enterprise system": 300000,
};

const sizeValues = {
  "Under 100 employees": 0,
  "100-500 employees": 10000,
  "500-2,500 employees": 25000,
  "2,500-10,000 employees": 50000,
  "10,000+ employees": 100000,
};

const state = {
  step: 0,
  submitted: false,
  data: {
    promptedBy: [],
    connections: [],
    environments: [],
    deliverables: [],
  },
};

const steps = [
  "Organization Profile",
  "Inquiry",
  "VOICE Diagnostic",
  "Deliverables",
  "Scope & Readiness",
  "Strategic Fit",
];

function optionTags(options, selected = "") {
  return [
    '<option value="">Select one</option>',
    ...options.map((option) => `<option value="${option}" ${selected === option ? "selected" : ""}>${option}</option>`),
  ].join("");
}

function checkboxGroup(name, options, selected = []) {
  return options
    .map(
      (option) => `
        <label class="check">
          <input type="checkbox" name="${name}" value="${option}" ${selected.includes(option) ? "checked" : ""} />
          <span>${option}</span>
        </label>
      `,
    )
    .join("");
}

function estimateApplication(data) {
  let estimate = 0;
  estimate += phaseValues[data.phaseInterest] || 0;
  estimate += sizeValues[data.organizationSize] || 0;

  (data.deliverables || []).forEach((deliverable) => {
    estimate += deliverableValues[deliverable] || 0;
  });

  const environmentCount = (data.environments || []).length;
  if (environmentCount > 10) {
    estimate += 100000;
  } else if (environmentCount > 5) {
    estimate += 50000;
  }

  if (estimate < 50000) return { total: estimate, range: "$25K-$75K" };
  if (estimate < 150000) return { total: estimate, range: "$75K-$150K" };
  if (estimate < 300000) return { total: estimate, range: "$150K-$300K" };
  if (estimate < 500000) return { total: estimate, range: "$300K-$500K" };
  return { total: estimate, range: "$500K+" };
}

function collectForm() {
  const form = document.querySelector("#application-form");
  if (!form) return;
  const formData = new FormData(form);
  const checkNames = ["promptedBy", "connections", "environments", "deliverables"];
  const next = { ...state.data };

  formData.forEach((value, key) => {
    if (!checkNames.includes(key)) next[key] = value;
  });

  checkNames.forEach((name) => {
    next[name] = formData.getAll(name);
  });

  state.data = next;
}

function field(name, label, type = "text", placeholder = "") {
  return `
    <label class="field">
      <span>${label}</span>
      <input name="${name}" type="${type}" value="${state.data[name] || ""}" placeholder="${placeholder}" />
    </label>
  `;
}

function selectField(name, label, options) {
  return `
    <label class="field">
      <span>${label}</span>
      <select name="${name}">${optionTags(options, state.data[name])}</select>
    </label>
  `;
}

function textareaField(name, label) {
  return `
    <label class="field field-wide">
      <span>${label}</span>
      <textarea name="${name}" rows="4">${state.data[name] || ""}</textarea>
    </label>
  `;
}

function renderStep() {
  const data = state.data;
  const views = [
    `
      ${field("organizationName", "Organization Name")}
      ${field("yourName", "Your Name")}
      ${selectField("role", "Title / Role", roleOptions)}
      ${field("email", "Email", "email")}
      ${selectField("organizationType", "Organization Type", organizationTypes)}
      ${selectField("organizationSize", "Organization Size", organizationSizes)}
    `,
    `
      <div class="field field-wide">
        <span>What prompted this inquiry?</span>
        <div class="checks">${checkboxGroup("promptedBy", promptedOptions, data.promptedBy)}</div>
      </div>
      ${textareaField("promptedDescription", "Briefly describe what prompted this inquiry.")}
    `,
    `
      ${selectField("voiceClarity", "V - How clear is your organization's current voice?", [
        "Very clear and consistent",
        "Somewhat clear",
        "Mixed depending on context",
        "Unclear",
        "Fragmented or noisy",
      ])}
      ${selectField("originImportance", "O - How important is your organization's history, legacy, or founding story to this project?", [
        "Essential",
        "Important",
        "Somewhat relevant",
        "Not sure",
        "Not relevant",
      ])}
      ${selectField("influence", "I - What kind of influence do you most want your sonic identity to carry?", [
        "Healing",
        "Trust",
        "Excellence",
        "Hope",
        "Innovation",
        "Reverence",
        "Calm",
        "Courage",
        "Belonging",
        "Other",
      ])}
      <div class="field field-wide">
        <span>C - Which relationships are most important to nurture through this work?</span>
        <div class="checks">${checkboxGroup("connections", connectionOptions, data.connections)}</div>
      </div>
      <div class="field field-wide">
        <span>E - Which spaces or environments should this sonic identity touch?</span>
        <div class="checks">${checkboxGroup("environments", environmentOptions, data.environments)}</div>
      </div>
    `,
    `
      <div class="field field-wide">
        <span>Desired Deliverables</span>
        <div class="checks">${checkboxGroup("deliverables", deliverableOptions, data.deliverables)}</div>
      </div>
    `,
    `
      ${selectField("phaseInterest", "Engagement Pathway", [
        "Discover only",
        "Discover + Design",
        "Discover + Design + Develop",
        "Full enterprise system",
      ])}
      ${selectField("timeline", "Desired Timeline", [
        "Immediately",
        "Within 30 days",
        "1-3 months",
        "3-6 months",
        "6-12 months",
        "Exploratory only",
      ])}
      ${selectField("decisionStage", "Decision-Making Stage", [
        "I am the final decision-maker",
        "I influence the decision",
        "I need to present this internally",
        "We are gathering options",
        "Not sure yet",
      ])}
      ${selectField("investmentReadiness", "Investment Readiness", [
        "$25K-$50K",
        "$50K-$150K",
        "$150K-$300K",
        "$300K-$500K",
        "$500K+",
        "Not sure yet",
      ])}
      ${selectField("internalSupport", "Internal Support", [
        "Strong executive support",
        "Some executive support",
        "Needs internal education",
        "Early exploration",
        "Unknown",
      ])}
    `,
    `
      ${textareaField("desiredFeeling", "What should people feel when they encounter your organization?")}
      ${textareaField("currentFeeling", "What do they currently feel?")}
      ${textareaField("culturalNoise", "Where do you sense emotional or cultural noise?")}
      ${textareaField("oneYearSuccess", "If this project were successful, what would be different one year from now?")}
      ${textareaField("whyNanasi", "Why do you believe Nanasi Institute may be the right partner for this work?")}
    `,
  ];

  return views[state.step];
}

async function submitApplication() {
  collectForm();
  const estimate = estimateApplication(state.data);
  const payload = {
    ...state.data,
    estimateRange: estimate.range,
    estimateTotal: estimate.total,
    submittedAt: new Date().toISOString(),
  };

  const response = await fetch("/api/applications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error("Submission failed");
  state.submitted = true;
  render();
  document.querySelector("#application").scrollIntoView({ behavior: "smooth" });
}

function renderEstimate() {
  const { range } = estimateApplication(state.data);
  return `
    <aside class="estimate-panel">
      <p class="eyebrow">Preliminary Engagement Range</p>
      <p>Based on your responses, your organization appears to be exploring an engagement in the following preliminary range:</p>
      <strong>${range}</strong>
      <p>This is not a formal quote. Nanasi Institute reviews each application to determine strategic fit, readiness, scope, and appropriate next steps.</p>
    </aside>
  `;
}

function renderApplication() {
  if (state.submitted) {
    return `
      <section class="section application-section" id="application">
        <div class="success-card">
          <p class="eyebrow">Application Received</p>
          <h2>Thank you for your application.</h2>
          <p>Nanasi Institute will review your inquiry for strategic fit, organizational readiness, and scope alignment. If there appears to be a strong fit, we will follow up regarding a private executive consultation.</p>
          <p>We accept a limited number of Sonic Identity & Alignment engagements each year to preserve depth, quality, and strategic focus.</p>
        </div>
      </section>
    `;
  }

  return `
    <section class="section application-section" id="application">
      <div class="section-copy">
        <p class="eyebrow">Executive Application</p>
        <h2>Begin With Fit, Not a Sales Call.</h2>
        <p>This application helps us determine whether your organization is a strong fit for a Sonic Identity & Alignment Experience. Based on your selections, we will prepare an initial engagement range and recommend the appropriate pathway.</p>
        <p class="note">Submission does not guarantee acceptance. Nanasi Institute reviews each inquiry carefully to determine strategic fit, scope, and readiness.</p>
      </div>
      <div class="application-shell">
        <form id="application-form" class="application-card">
          <div class="step-header">
            <span>Step ${state.step + 1} of ${steps.length}</span>
            <h3>${steps[state.step]}</h3>
          </div>
          <div class="progress" aria-hidden="true"><span style="width:${((state.step + 1) / steps.length) * 100}%"></span></div>
          <div class="form-grid">${renderStep()}</div>
          <div class="form-actions">
            <button type="button" class="button ghost" data-action="back" ${state.step === 0 ? "disabled" : ""}>Back</button>
            <button type="button" class="button primary" data-action="${state.step === steps.length - 1 ? "submit" : "next"}">
              ${state.step === steps.length - 1 ? "Submit Application for Review" : "Continue"}
            </button>
          </div>
        </form>
        ${state.step === steps.length - 1 ? renderEstimate() : ""}
      </div>
    </section>
  `;
}

function renderMarketing() {
  return `
    <nav class="nav">
      <a href="#top" class="brand">Nanasi Institute</a>
      <div>
        <a href="#method">Method</a>
        <a href="#phases">Engagement</a>
        <a href="#application">Apply</a>
        <a href="/admin.html" class="admin-link">Admin</a>
      </div>
    </nav>

    <header class="hero" id="top">
      <div class="hero-copy">
        <p class="eyebrow">Sonic Identity & Alignment Experiences</p>
        <h1>Help Your Organization Hear Itself Clearly.</h1>
        <p>Nanasi Institute designs sonic identity and emotional environments for organizations seeking clarity, coherence, and a deeply felt experience of their mission.</p>
        <div class="hero-actions">
          <a class="button primary" href="#application">Begin Executive Application</a>
          <a class="button ghost" href="#method">Explore the Method</a>
        </div>
        <p class="hero-note">A theme song may be the beginning. Alignment is the work.</p>
      </div>
      <div class="sound-orbit" aria-hidden="true">
        <span></span><span></span><span></span>
      </div>
    </header>

    <section class="section split" id="method">
      <div class="section-copy">
        <p class="eyebrow">The Core Reframe</p>
        <h2>A Theme Song Is Not the Product.</h2>
      </div>
      <div class="prose">
        <p>A theme song is often the first thing leaders ask for. But when approached correctly, it becomes the audible artifact of something much deeper: organizational clarity.</p>
        <p>Every organization already has a sonic identity. The question is whether that identity is intentional, aligned, and emotionally coherent.</p>
        <div class="statement-card">
          <strong>We do not simply compose music for organizations.</strong>
          <span>We help organizations find, restore, and amplify their VOICE.</span>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-copy centered">
        <p class="eyebrow">The Nanasi VOICE Framework</p>
        <h2>The Nanasi VOICE Framework™</h2>
        <p>VOICE is the lens through which we diagnose, design, and deploy sonic identity. It helps an organization move from emotional noise to embodied clarity.</p>
      </div>
      <div class="voice-grid">
        ${[
          ["V", "Voice", "Uniqueness, expression, and coherence.", "What makes your organization distinct? Where is there too much noise? What sound needs to emerge?"],
          ["O", "Origin", "History, legacy, and identity.", "Where did your organization come from? What founding story still shapes your culture? What values must not be lost?"],
          ["I", "Influence", "Mission, leadership, and impact.", "What difference do you seek to make? How should people be changed after encountering you? What kind of influence should your sound carry?"],
          ["C", "Connection", "Relationships, trust, and belonging.", "Which relationships do you wish to foster? Where is emotional connection most needed?"],
          ["E", "Environment", "Culture, space, and atmosphere.", "What is the current emotional climate? What spaces do you provide? What should people feel when they are with you?"],
        ].map(([letter, title, lead, body]) => `
          <article class="voice-card">
            <span>${letter}</span>
            <h3>${title}</h3>
            <p><strong>${lead}</strong></p>
            <p>${body}</p>
          </article>
        `).join("")}
      </div>
      <p class="closing-line">The result is not merely music. It is an integrated emotional environment.</p>
    </section>

    <section class="section" id="phases">
      <div class="section-copy centered">
        <p class="eyebrow">Engagement Architecture</p>
        <h2>Three Phases. One Integrated Sonic System.</h2>
      </div>
      <div class="phase-grid">
        ${[
          ["01", "Discover", "Organizational Sonic & Emotional Audit", "Starting at $25K-$50K", "We begin by learning the organization beneath the brand: its history, felt values, leadership intent, relational ecosystem, and emotional environment.", ["Executive leadership interviews", "Cultural and environmental scan", "Sonic touchpoint audit", "Emotional journey mapping", "VOICE alignment diagnosis", "Sonic Alignment Diagnostic™ Report"]],
          ["02", "Design", "Sonic Identity Architecture", "Starting at $50K-$150K", "We translate organizational identity into a distinctive sonic language: themes, motifs, instrument palettes, emotional soundscapes, and signature musical assets.", ["Sonic Identity Blueprint™", "Signature organizational theme", "Theme variations", "Jingles / motifs / digital sonic cues", "Emotional journey sound design", "Proprietary emotional care music library"]],
          ["03", "Develop", "Deployment, Integration & Training", "Starting at $100K-$300K+", "We help the organization integrate its sonic identity across real environments, systems, gatherings, and emotional touchpoints.", ["Pilot deployment", "Staff training", "Technology integration", "Patient / employee experience implementation", "Measurement and optimization", "Ongoing advisory retainer option"]],
        ].map(([number, title, subtitle, price, description, includes]) => `
          <article class="phase-card">
            <span class="phase-number">${number}</span>
            <h3>${title}</h3>
            <h4>${subtitle}</h4>
            <p class="price">${price}</p>
            <p>${description}</p>
            <ul>${includes.map((item) => `<li>${item}</li>`).join("")}</ul>
          </article>
        `).join("")}
      </div>
    </section>

    <section class="section split">
      <div class="section-copy">
        <p class="eyebrow">Premium Positioning</p>
        <h2>This Is Not a Music Project. It Is an Alignment Engagement.</h2>
        <p>Organizations do not invest in sonic identity because they need more music. They invest because the emotional experience of their mission matters.</p>
        <p>Sound shapes memory, trust, atmosphere, attention, and belonging. When designed intentionally, it becomes part of the organization's operating system.</p>
      </div>
      <div class="outcome-stack">
        <article><h3>For Healthcare Systems</h3><p>Reduce anxiety. Support healing. Humanize clinical environments.</p></article>
        <article><h3>For Mission-Driven Organizations</h3><p>Clarify identity. Strengthen culture. Make values felt.</p></article>
        <article><h3>For Executive Teams</h3><p>Align leadership voice, organizational memory, and emotional experience.</p></article>
      </div>
    </section>
  `;
}

async function renderAdmin() {
  const response = await fetch("/api/submissions");
  const submissions = response.ok ? await response.json() : [];
  app.innerHTML = `
    <nav class="nav"><a class="brand" href="/">Nanasi Institute</a><div><a href="/admin.html">Admin</a></div></nav>
    <section class="section admin-section">
      <div class="section-copy">
        <p class="eyebrow">Application Review</p>
        <h1>Executive Application Dashboard</h1>
        <p>Review stored inquiries, preliminary ranges, and strategic fit responses. Export all submissions for private review.</p>
        <a class="button primary" href="/api/submissions.csv">Export CSV</a>
      </div>
      <div class="submission-list">
        ${submissions.length ? submissions.map((item) => `
          <article class="submission-card">
            <div>
              <p class="eyebrow">${new Date(item.submittedAt).toLocaleString()}</p>
              <h3>${item.organizationName || "Unnamed Organization"}</h3>
              <p>${item.yourName || "Unknown"} · ${item.role || "Role not provided"} · ${item.email || "No email"}</p>
            </div>
            <strong>${item.estimateRange || "No range"}</strong>
            <p>${item.organizationType || "Type not provided"} · ${item.organizationSize || "Size not provided"}</p>
            <p>${item.whyNanasi || "No strategic-fit response yet."}</p>
          </article>
        `).join("") : `<p class="empty">No applications have been submitted yet.</p>`}
      </div>
    </section>
  `;
}

function render() {
  if (window.location.pathname === "/admin.html") {
    renderAdmin();
    return;
  }

  app.innerHTML = `
    ${renderMarketing()}
    ${renderApplication()}
    <footer class="footer">
      <p>Nanasi Institute helps organizations move from emotional noise to organizational voice - clarifying identity, restoring coherence, and designing environments people can feel.</p>
    </footer>
  `;

  document.querySelector("#application-form")?.addEventListener("click", async (event) => {
    const action = event.target.dataset.action;
    if (!action) return;
    collectForm();
    if (action === "back") state.step = Math.max(0, state.step - 1);
    if (action === "next") state.step = Math.min(steps.length - 1, state.step + 1);
    if (action === "submit") {
      try {
        await submitApplication();
      } catch (error) {
        alert("The application could not be submitted. Please try again.");
      }
      return;
    }
    render();
    document.querySelector("#application").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.querySelector("#application-form")?.addEventListener("change", collectForm);
  document.querySelector("#application-form")?.addEventListener("input", collectForm);

  if (window.location.hash === "#application") {
    requestAnimationFrame(() => {
      document.querySelector("#application")?.scrollIntoView({ block: "start" });
    });
  }
}

render();
