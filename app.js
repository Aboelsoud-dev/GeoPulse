const onboarding = document.querySelector('#onboarding');
const identityForm = document.querySelector('#identityForm');
const identityName = document.querySelector('#identityName');
const userName = document.querySelector('#userName');
const userProfileName = document.querySelector('#userProfileName');
const bootProgressBar = document.querySelector('#bootProgressBar');
const storedName = window.localStorage.getItem('geopulse-user-name');

// ========== STATE MANAGEMENT ==========
const appState = {
  selectedCountry: null,
  theme: window.localStorage.getItem('geopulse-theme') || 'dark',
  alertFilter: 'all',
  feedFilter: '',
  expandedPanels: {},
  favorites: JSON.parse(window.localStorage.getItem('geopulse-favorites') || '[]')
};

function setState(key, value) {
  appState[key] = value;
  if (key === 'theme') window.localStorage.setItem('geopulse-theme', value);
}

function personalize(name) {
  const cleanName = name.trim().slice(0, 40);
  if (!cleanName) return;
  userName.textContent = cleanName;
  userProfileName.textContent = cleanName;
  window.localStorage.setItem('geopulse-user-name', cleanName);
}

function closeOnboarding() {
  document.body.classList.remove('booting');
  onboarding.classList.add('is-hidden');
  window.setTimeout(() => onboarding.remove(), 750);
}

if (storedName) {
  personalize(storedName);
  closeOnboarding();
} else {
  [25, 50, 75, 100].forEach((progress, index) => {
    window.setTimeout(() => { bootProgressBar.style.width = `${progress}%`; }, 500 + index * 700);
  });
  window.setTimeout(() => onboarding.classList.add('ready'), 3400);
  identityForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!identityName.value.trim()) return;
    personalize(identityName.value);
    closeOnboarding();
  });
}

const tooltip = document.querySelector('#mapTooltip');
const countryMap = document.querySelector('#countryMap');
const mapLoading = document.querySelector('#mapLoading');
const countryInfo = document.querySelector('#countryInfo');
const riskPalette = ['#d9b84a', '#f0a35b', '#ff6b6b'];
const riskByCountry = { 804: 89, 158: 78, 729: 76, 376: 74, 760: 71, 434: 64, 408: 61, 466: 58, 566: 55, 180: 52, 364: 49, 4: 47, 356: 43, 586: 41, 643: 39, 840: 36, 124: 30, 276: 28, 250: 22, 36: 18 };
const regions = { 804: 'Eastern Europe', 158: 'East Asia', 729: 'North Africa', 376: 'Middle East', 760: 'Middle East', 408: 'East Asia', 466: 'West Africa', 566: 'West Africa', 180: 'Central Africa', 364: 'West Asia' };
const countryNames = { 804: 'Ukraine', 158: 'Taiwan', 729: 'Sudan', 376: 'Israel', 760: 'Syria', 434: 'Libya', 408: 'North Korea', 466: 'Mali', 566: 'Nigeria', 180: 'Democratic Republic of Congo', 364: 'Iran', 4: 'Afghanistan', 356: 'India', 586: 'Pakistan', 643: 'Russia', 840: 'United States', 124: 'Canada', 276: 'Germany', 250: 'France', 36: 'Australia' };

function getRisk(country) {
  return riskByCountry[country.id] || 18;
}

// ========== LIVE DATA SIMULATION ==========
let dataUpdateInterval;
function simulateLiveData() {
  const now = new Date();
  for (const countryId in riskByCountry) {
    const volatility = Math.random() * 6 - 3;
    riskByCountry[countryId] = Math.max(0, Math.min(100, riskByCountry[countryId] + volatility));
  }
  updateNotificationBadge();
  if (appState.selectedCountry) renderCountryDetail();
  const lastUpdated = document.querySelector('#lastUpdated');
  if (lastUpdated) lastUpdated.textContent = `Updated ${Math.floor(Math.random() * 5) + 1}m ago`;
}

dataUpdateInterval = window.setInterval(simulateLiveData, 8000);

function riskLevel(score) {
  return score >= 80 ? 'Critical' : score >= 55 ? 'Elevated' : 'Watch';
}

function showCountry(country) {
  const score = getRisk(country);
  const name = country.properties.name || 'Unknown country';
  document.querySelector('#countryName').textContent = name;
  document.querySelector('#countryRegion').textContent = regions[country.id] || 'Global monitoring region';
  document.querySelector('#countryRisk').textContent = score;
  document.querySelector('#countryRiskLabel').textContent = riskLevel(score);
  const meter = document.querySelector('#countryRiskMeter');
  meter.style.width = `${score}%`;
  meter.style.background = riskPalette[score >= 80 ? 2 : score >= 55 ? 1 : 0];
  countryInfo.hidden = false;
  tooltip.textContent = `${name} · country risk selected`;
  tooltip.style.color = '#5dc9e2';
}

async function buildCountryMap() {
  if (!countryMap || !window.d3 || !window.topojson) return;
  try {
    const response = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
    const world = await response.json();
    const countries = topojson.feature(world, world.objects.countries).features;
    const projection = d3.geoNaturalEarth1().fitSize([900, 430], { type: 'FeatureCollection', features: countries });
    const path = d3.geoPath(projection);

    d3.select(countryMap).selectAll('path').data(countries).join('path')
      .attr('class', 'country')
      .attr('d', path)
      .attr('fill', (country) => {
        const score = getRisk(country);
        return riskPalette[score >= 80 ? 2 : score >= 55 ? 1 : 0];
      })
      .attr('fill-opacity', (country) => riskByCountry[country.id] ? 0.92 : 0.38)
      .attr('aria-label', (country) => `${country.properties.name}, risk ${getRisk(country)} out of 100`)
      .on('mouseenter', function (_, country) {
        tooltip.textContent = `${country.properties.name} · risk ${getRisk(country)}/100`;
      })
      .on('mouseleave', () => {
        if (countryInfo.hidden) tooltip.textContent = 'Select a country to inspect risk';
      })
      .on('click', function (event, country) {
        d3.selectAll('.country').classed('selected', false);
        d3.select(event.currentTarget).classed('selected', true);
        showCountryDetail(country);
      });
    mapLoading.remove();
  } catch (error) {
    mapLoading.textContent = 'Country map unavailable · check network';
    tooltip.textContent = 'Map data could not be loaded';
    console.error('GeoPulse map data failed', error);
  }
}

document.querySelector('#countryInfoClose')?.addEventListener('click', () => {
  countryInfo.hidden = true;
  tooltip.textContent = 'Select a country to inspect risk';
  d3.selectAll('.country').classed('selected', false);
});

document.querySelectorAll('.map-control').forEach((control) => {
  control.addEventListener('click', () => {
    if (control.getAttribute('aria-label')) return;
    document.querySelectorAll('.map-control').forEach((item) => item.classList.remove('active'));
    control.classList.add('active');
    tooltip.textContent = `${control.textContent.trim()} layer active · select a country`;
  });
});

document.querySelectorAll('.risk-item').forEach((item) => {
  item.addEventListener('click', () => {
    tooltip.textContent = `${item.querySelector('strong').textContent} · risk profile opened`;
    document.querySelector('#map').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
});

const topChanges = [
  { country: 'Egypt', change: 8, direction: 'up' },
  { country: 'Ukraine', change: 12, direction: 'up' },
  { country: 'Taiwan', change: 6, direction: 'up' },
  { country: 'Israel', change: -4, direction: 'down' },
  { country: 'Jordan', change: -2, direction: 'down' }
];

const intelFeed = [
  { region: 'Eastern Europe', title: 'Elevated activity along contact line', level: 'high', confidence: 87, time: '04:21 UTC', source: 'Field Signal', description: 'Joint monitoring systems detected sustained movement and radar disruption near forward positions.' },
  { region: 'Indo-Pacific', title: 'Maritime posture intensified', level: 'moderate', confidence: 74, time: '03:47 UTC', source: 'Naval Desk', description: 'Regional escort groups increased patrol frequency across key shipping lanes.' },
  { region: 'Middle East', title: 'Cellular network disruption observed', level: 'critical', confidence: 91, time: '02:58 UTC', source: 'Open Source', description: 'Communication outages and convoy movement suggest elevated operational tension in selected corridors.' },
  { region: 'West Africa', title: 'Regional mediation efforts resumed', level: 'low', confidence: 69, time: '01:26 UTC', source: 'Regional Desk', description: 'Diplomatic channels reopened after a short pause in security consultations.' }
];

const alerts = [
  { title: 'Tension increased significantly in Eastern Europe.', risk: 'High', change: '+12%', time: '04:21 UTC', read: false },
  { title: 'Cross-border logistics exposure rising in the Red Sea corridor.', risk: 'Moderate', change: '+6%', time: '03:18 UTC', read: true },
  { title: 'Diplomatic channels in South Asia remain unstable.', risk: 'Elevated', change: '+4%', time: '01:44 UTC', read: false }
];

const situationMetrics = [
  { name: 'Political Risk', value: 71, color: '#ff7d7d' },
  { name: 'Military Activity', value: 78, color: '#ffb347' },
  { name: 'Economic Risk', value: 62, color: '#f5d26d' },
  { name: 'Diplomatic Activity', value: 54, color: '#7ee0b8' }
];

function updateGreeting() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const greetingLabel = document.querySelector('#greetingText');
  if (greetingLabel) greetingLabel.textContent = greeting;
}

function updateClock() {
  const now = new Date();
  const currentDate = document.querySelector('#currentDate');
  const utcClock = document.querySelector('#utcClock');
  const summaryUtc = document.querySelector('#summaryUtc');
  if (currentDate) currentDate.textContent = now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
  if (utcClock) utcClock.textContent = now.toLocaleTimeString('en-GB', { timeZone: 'UTC', hour12: false, hour: '2-digit', minute: '2-digit' }) + ' UTC';
  if (summaryUtc) summaryUtc.textContent = now.toLocaleTimeString('en-GB', { timeZone: 'UTC', hour12: false, hour: '2-digit', minute: '2-digit' });
}

function renderTodayChanges() {
  const list = document.querySelector('#todayChangesList');
  if (!list) return;
  list.innerHTML = topChanges.map((entry) => `
    <li>
      <div><b>${entry.country}</b> <span>risk change</span></div>
      <strong class="${entry.direction === 'up' ? 'change-positive' : 'change-negative'}">${entry.direction === 'up' ? '+' : ''}${entry.change}%</strong>
    </li>
  `).join('');
  const summaryDevelopments = document.querySelector('#summaryDevelopments');
  const summaryRegions = document.querySelector('#summaryRegions');
  const summaryRisk = document.querySelector('#summaryRisk');
  if (summaryDevelopments) summaryDevelopments.textContent = '07';
  if (summaryRegions) summaryRegions.textContent = '04';
  if (summaryRisk) summaryRisk.textContent = '03';
}

function renderFeed() {
  const feed = document.querySelector('#intelFeedList');
  if (!feed) return;
  const levelMap = { low: 'importance-low', moderate: 'importance-moderate', high: 'importance-high', critical: 'importance-critical' };
  let filtered = intelFeed;
  if (appState.feedFilter) {
    filtered = intelFeed.filter(item => item.title.toLowerCase().includes(appState.feedFilter) || item.region.toLowerCase().includes(appState.feedFilter));
  }
  feed.innerHTML = filtered.map((item) => `
    <div class="intel-item">
      <div class="intel-head">
        <span class="intel-region">${item.region}</span>
        <span class="intel-level ${levelMap[item.level]}">${item.level}</span>
      </div>
      <h4>${item.title}</h4>
      <div class="intel-meta">
        <span>Confidence: <strong>${item.confidence}%</strong></span>
        <span>Detected: <strong>${item.time}</strong></span>
      </div>
      <p style="margin:0.55rem 0 0; color:#7d959b; font-size:0.64rem; line-height:1.5;">${item.description}</p>
      <div class="intel-meta" style="margin-top:0.5rem;"><span>Source: ${item.source}</span></div>
    </div>
  `).join('');
}

function renderAlerts() {
  const alertsList = document.querySelector('#alertsList');
  if (!alertsList) return;
  let filtered = alerts;
  if (appState.alertFilter !== 'all') {
    filtered = alerts.filter(a => a.risk === appState.alertFilter);
  }
  alertsList.innerHTML = filtered.map((alert, index) => `
    <div class="alert-item ${alert.read ? 'read' : ''}">
      <div class="alert-top">
        <span class="alert-tag">${alert.risk}</span>
        <button type="button" data-index="${alerts.indexOf(alert)}">${alert.read ? 'Read' : 'Mark read'}</button>
      </div>
      <h5>${alert.title}</h5>
      <p>Risk: ${alert.risk}<br/>Change: ${alert.change}<br/>Detected: ${alert.time}</p>
    </div>
  `).join('');

  alertsList.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.index);
      alerts[index].read = true;
      renderAlerts();
      updateNotificationBadge();
    });
  });
}

function updateNotificationBadge() {
  const notifSpan = document.querySelector('.notification');
  const unreadCount = alerts.filter((a) => !a.read).length;
  if (notifSpan) {
    notifSpan.textContent = unreadCount > 0 ? unreadCount : '';
  }
}

function renderSituationMetrics() {
  const host = document.querySelector('#situationMetrics');
  if (!host) return;
  host.innerHTML = situationMetrics.map((metric) => `
    <div class="axis-row">
      <span>${metric.name}</span>
      <div class="axis-bar"><i style="width: ${metric.value}%; background: ${metric.color};"></i></div>
      <strong>${metric.value}</strong>
    </div>
  `).join('');
}

function getWatchlist() {
  try {
    const saved = JSON.parse(window.localStorage.getItem('geopulse-watchlist') || 'null');
    return Array.isArray(saved) && saved.length ? saved : ['Ukraine', 'Taiwan', 'Israel', 'Egypt'];
  } catch (error) {
    return ['Ukraine', 'Taiwan', 'Israel', 'Egypt'];
  }
}

function saveWatchlist(list) {
  window.localStorage.setItem('geopulse-watchlist', JSON.stringify(list));
}

function renderWatchlist() {
  const watchlistList = document.querySelector('#watchlistList');
  if (!watchlistList) return;
  const watchlist = getWatchlist();
  watchlistList.innerHTML = watchlist.map((country) => {
    const flags = { Egypt: '🇪🇬', 'United States': '🇺🇸', China: '🇨🇳', Thailand: '🇹🇭', Ukraine: '🇺🇦', Taiwan: '🇹🇼', Sudan: '🇸🇩', Israel: '🇮🇱' };
    return `
      <div class="watch-country">
        <strong>${flags[country] || '•'} ${country}</strong>
        <button type="button" data-country="${country}">Remove</button>
      </div>
    `;
  }).join('');

  watchlistList.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => {
      const country = button.dataset.country;
      const nextList = getWatchlist().filter((item) => item !== country);
      saveWatchlist(nextList);
      renderWatchlist();
    });
  });
}

function renderRelationshipGraph() {
  const svg = document.querySelector('#relationshipGraph');
  if (!svg) return;
  const nodes = [
    { name: 'USA', x: 60, y: 90 },
    { name: 'EU', x: 170, y: 55 },
    { name: 'Ukraine', x: 250, y: 110 },
    { name: 'China', x: 450, y: 75 },
    { name: 'Taiwan', x: 520, y: 150 },
    { name: 'Egypt', x: 360, y: 175 }
  ];
  const links = [
    [0, 1, '#5dc9e2'], [1, 2, '#ffb347'], [0, 2, '#ff7d7d'], [2, 5, '#7ee0b8'], [3, 4, '#ff7d7d'], [3, 5, '#5dc9e2'], [0, 3, '#f5d26d']
  ];

  let markup = '';
  links.forEach(([a, b, color]) => {
    const start = nodes[a];
    const end = nodes[b];
    markup += `<line x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}" stroke="${color}" stroke-opacity="0.6" stroke-width="1.3" />`;
  });
  nodes.forEach((node) => {
    markup += `<circle cx="${node.x}" cy="${node.y}" r="6" fill="#0d1a1f" stroke="#5dc9e2" stroke-width="1.5" />`;
    markup += `<text x="${node.x + 10}" y="${node.y + 4}" fill="#cfe0e4" font-size="10">${node.name}</text>`;
  });
  svg.innerHTML = markup;
}

function setupCommandPalette() {
  const commandPalette = document.querySelector('#commandPalette');
  const commandInput = document.querySelector('#commandInput');
  if (!commandPalette || !commandInput) return;

  const open = () => {
    commandPalette.classList.add('visible');
    window.setTimeout(() => commandInput.focus(), 50);
  };
  const close = () => commandPalette.classList.remove('visible');

  window.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      commandPalette.classList.contains('visible') ? close() : open();
    }
    if (event.key === 'Escape') close();
  });

  commandPalette.addEventListener('click', (event) => {
    if (event.target === commandPalette) close();
  });

  document.querySelector('.command-button')?.addEventListener('click', open);
}

function setupSettings() {
  const changeIdentityBtn = document.querySelector('#changeIdentityBtn');
  if (changeIdentityBtn) {
    changeIdentityBtn.addEventListener('click', () => {
      const nextName = window.prompt('Enter your name', userName.textContent.trim() || '');
      if (!nextName) return;
      personalize(nextName);
    });
  }

  document.querySelector('#resetOnboardingBtn')?.addEventListener('click', () => {
    window.localStorage.removeItem('geopulse-user-name');
    window.location.reload();
  });

  document.querySelector('#resetDataBtn')?.addEventListener('click', () => {
    window.localStorage.removeItem('geopulse-user-name');
    window.localStorage.removeItem('geopulse-watchlist');
    window.location.reload();
  });
}

updateGreeting();
updateClock();
renderTodayChanges();
renderFeed();
renderAlerts();
renderSituationMetrics();
renderWatchlist();
renderRelationshipGraph();
setupCommandPalette();
setupSettings();

function setupNavigation() {
  document.querySelectorAll('.nav-item').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const target = link.getAttribute('href');
      document.querySelectorAll('.nav-item').forEach((item) => item.classList.remove('active'));
      link.classList.add('active');
      
      const sectionNames = {
        '#overview': 'Global overview',
        '#situationRoom': 'Situation Room',
        '#developments': 'Recent developments',
        '#watchlistPanel': 'Your watchlist',
        '#settingsPanel': 'System preferences'
      };
      const breadcrumb = document.querySelector('#breadcrumbPage');
      if (breadcrumb) breadcrumb.textContent = sectionNames[target] || 'Overview';
      
      const section = document.querySelector(target);
      if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function setupExportBrief() {
  const exportBtn = document.querySelector('.export-button');
  if (!exportBtn) return;
  exportBtn.addEventListener('click', () => {
    const name = userName.textContent.trim() || 'Analyst';
    const briefDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const briefText = `GEOPULSE INTELLIGENCE BRIEFING\n${briefDate}\nPrepared for: ${name}\n\nGlobal Tension Index: 67.4/100\nActive Flashpoints: 12\nCountries Monitored: 84\n\nKey Changes:\n• Ukraine: +12% risk\n• Taiwan: +6% risk\n• Egypt: +8% risk\n• Israel: -4% risk\n• Jordan: -2% risk\n\nTop Alerts:\n1. Elevated activity in Eastern Europe (+12%)\n2. Cross-border logistics exposure in Red Sea (+6%)\n3. Diplomatic instability in South Asia (+4%)\n\nReport Generated: ${new Date().toLocaleTimeString('en-GB', { timeZone: 'UTC', hour12: false })} UTC`;
    const blob = new Blob([briefText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GeoPulse-Brief-${briefDate.replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    tooltip.textContent = 'Brief exported successfully';
    exportBtn.style.opacity = '0.7';
    window.setTimeout(() => { exportBtn.style.opacity = '1'; tooltip.textContent = 'Select a country to inspect risk'; }, 2000);
  });
}

function setupNotifications() {
  const notifBtn = document.querySelector('.icon-button');
  if (!notifBtn) return;
  updateNotificationBadge();
  notifBtn.addEventListener('click', () => {
    const alertsPanel = document.querySelector('#alertsPanel');
    if (alertsPanel) alertsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const unreadCount = alerts.filter((a) => !a.read).length;
    tooltip.textContent = unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All alerts read';
  });
}

function setupProfileMenu() {
  const profileBtn = document.querySelector('.profile button');
  if (!profileBtn) return;
  profileBtn.addEventListener('click', () => {
    const action = window.confirm('Profile options:\n\nOK = Change name\nCancel = Keep current');
    if (action) {
      const nextName = window.prompt('Enter your name', userName.textContent.trim() || '');
      if (nextName) personalize(nextName);
    }
  });
}

function setupPanelButtons() {
  // More button for risk panel
  document.querySelector('.more-button')?.addEventListener('click', () => {
    tooltip.textContent = 'Risk monitoring options available';
    const riskList = document.querySelector('.risk-list');
    if (riskList) riskList.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  // Filter button for regions
  document.querySelector('.filter-button')?.addEventListener('click', function() {
    const options = ['7D', '30D', '90D', 'All'];
    const current = this.textContent.trim().split(' ')[0];
    const currentIdx = options.indexOf(current);
    const next = options[(currentIdx + 1) % options.length];
    this.innerHTML = `${next} <span>⌄</span>`;
    tooltip.textContent = `Viewing ${next} trend data`;
  });

  // See all button for developments
  document.querySelector('.developments-panel .text-button')?.addEventListener('click', () => {
    const devPanel = document.querySelector('#developmentsFeed');
    if (devPanel) devPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    tooltip.textContent = 'Showing all recent developments';
  });

  // View full intelligence map button
  document.querySelector('.map-footer button')?.addEventListener('click', () => {
    const mapPanel = document.querySelector('#map');
    if (mapPanel) mapPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    tooltip.textContent = 'Expanding full intelligence map';
  });
}

// ========== ADVANCED SEARCH & FILTER ==========
function setupGlobalSearch() {
  const searchInput = document.querySelector('#globalSearch');
  if (!searchInput) return;
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    if (!query) {
      renderFeed();
      renderAlerts();
      return;
    }
    const filteredFeed = intelFeed.filter(item => item.title.toLowerCase().includes(query) || item.region.toLowerCase().includes(query));
    const filteredAlerts = alerts.filter(a => a.title.toLowerCase().includes(query));
    const feedHost = document.querySelector('#intelFeedList');
    const alertsHost = document.querySelector('#alertsList');
    if (feedHost) feedHost.innerHTML = filteredFeed.length ? filteredFeed.map((item) => {
      const levelMap = { low: 'importance-low', moderate: 'importance-moderate', high: 'importance-high', critical: 'importance-critical' };
      return `<div class="intel-item"><div class="intel-head"><span class="intel-region">${item.region}</span><span class="intel-level ${levelMap[item.level]}">${item.level}</span></div><h4>${item.title}</h4></div>`;
    }).join('') : '<p style="color:#6f8f9a; text-align:center; padding:2rem;">No matching intelligence found</p>';
    if (alertsHost) alertsHost.innerHTML = filteredAlerts.length ? filteredAlerts.map((a, i) => `<div class="alert-item"><div class="alert-top"><span class="alert-tag">${a.risk}</span></div><h5>${a.title}</h5></div>`).join('') : '<p style="color:#6f8f9a; text-align:center; padding:2rem;">No matching alerts</p>';
  });
}

function setupFeedSearch() {
  const feedSearch = document.querySelector('#feedSearch');
  if (!feedSearch) return;
  feedSearch.addEventListener('input', (e) => {
    setState('feedFilter', e.target.value.toLowerCase());
    renderFeed();
  });
}

function setupAlertFilter() {
  const alertFilter = document.querySelector('#alertFilter');
  if (!alertFilter) return;
  alertFilter.addEventListener('change', (e) => {
    setState('alertFilter', e.target.value);
    renderAlerts();
  });
}

// ========== THEME TOGGLE ==========
function setupThemeToggle() {
  const themeToggle = document.querySelector('#themeToggle');
  if (!themeToggle) return;
  const updateTheme = () => {
    const newTheme = appState.theme === 'dark' ? 'light' : 'dark';
    setState('theme', newTheme);
    document.documentElement.style.filter = newTheme === 'light' ? 'invert(0.95) hue-rotate(180deg)' : 'none';
    themeToggle.textContent = newTheme === 'light' ? '☀️' : '🌙';
  };
  themeToggle.addEventListener('click', updateTheme);
  if (appState.theme === 'light') {
    document.documentElement.style.filter = 'invert(0.95) hue-rotate(180deg)';
    themeToggle.textContent = '☀️';
  }
}

// ========== KEYBOARD SHORTCUTS ==========
function setupKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
    if (isInput && e.key !== 'Escape') return;
    const modKey = e.ctrlKey || e.metaKey;
    if (modKey && e.key.toLowerCase() === 's') { e.preventDefault(); document.querySelector('#settingsPanel')?.scrollIntoView({ behavior: 'smooth' }); }
    if (modKey && e.key.toLowerCase() === 'w') { e.preventDefault(); document.querySelector('#watchlistPanel')?.scrollIntoView({ behavior: 'smooth' }); }
    if (e.key.toLowerCase() === 'g') { e.preventDefault(); document.querySelector('#map')?.scrollIntoView({ behavior: 'smooth' }); }
    if (e.key.toLowerCase() === 'a') { e.preventDefault(); document.querySelector('#alertsPanel')?.scrollIntoView({ behavior: 'smooth' }); }
    if (e.key === '?') { e.preventDefault(); document.querySelector('#keyboardHelp')?.classList.toggle('visible'); }
    if (e.key.toLowerCase() === 't') { e.preventDefault(); document.querySelector('#themeToggle')?.click(); }
    if (e.key.toLowerCase() === 'r') { e.preventDefault(); simulateLiveData(); tooltip.textContent = 'Data refreshed'; }
    if (e.key === '/') { e.preventDefault(); document.querySelector('#globalSearch')?.focus(); }
  });
}

// ========== COUNTRY DETAIL MODAL ==========
function renderCountryDetail() {
  if (!appState.selectedCountry) return;
  const country = appState.selectedCountry;
  const modal = document.querySelector('#countryDetailModal');
  const nameEl = document.querySelector('#detailCountryName');
  const regionEl = document.querySelector('#detailRegion');
  const scoreEl = document.querySelector('#detailRiskScore');
  const barEl = document.querySelector('#detailRiskBar');
  
  const risk = getRisk(country);
  const countryName = countryNames[country.id] || country.properties.name || 'Unknown';
  const region = regions[country.id] || 'Global';
  
  if (nameEl) nameEl.textContent = countryName;
  if (regionEl) regionEl.textContent = region;
  if (scoreEl) scoreEl.textContent = Math.round(risk);
  if (barEl) { barEl.style.width = `${risk}%`; barEl.style.background = riskPalette[risk >= 80 ? 2 : risk >= 55 ? 1 : 0]; }
}

function showCountryDetail(country) {
  setState('selectedCountry', country);
  renderCountryDetail();
  document.querySelector('#countryDetailModal').classList.add('visible');
}

function setupCountryDetailModal() {
  const modal = document.querySelector('#countryDetailModal');
  const closeBtn = document.querySelector('#detailCloseBtn');
  const addBtn = document.querySelector('#detailAddToWatchlistBtn');
  
  if (closeBtn) closeBtn.addEventListener('click', () => { modal.classList.remove('visible'); setState('selectedCountry', null); });
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) { modal.classList.remove('visible'); setState('selectedCountry', null); } });
  if (addBtn) addBtn.addEventListener('click', () => {
    const country = appState.selectedCountry;
    if (!country) return;
    const name = countryNames[country.id] || country.properties.name;
    const watchlist = getWatchlist();
    if (!watchlist.includes(name)) {
      watchlist.push(name);
      saveWatchlist(watchlist);
      renderWatchlist();
      addBtn.textContent = 'Added to watchlist ✓';
      addBtn.style.background = '#7ee0b8';
      window.setTimeout(() => { addBtn.textContent = 'Add to watchlist'; addBtn.style.background = '#5dc9e2'; }, 1500);
    }
  });
}

// ========== HELP & KEYBOARD CHEAT SHEET ==========
function setupKeyboardHelp() {
  const helpBtn = document.querySelector('#helpButton');
  const helpModal = document.querySelector('#keyboardHelp');
  if (helpBtn && helpModal) {
    helpBtn.addEventListener('click', () => helpModal.classList.add('visible'));
    helpModal.addEventListener('click', (e) => { if (e.target === helpModal) helpModal.classList.remove('visible'); });
    document.addEventListener('keydown', (e) => { if (e.key === '?') helpModal.classList.add('visible'); });
  }
}

// ========== WATCHLIST EXPORT ==========
function setupWatchlistActions() {
  const watchlistList = document.querySelector('#watchlistList');
  if (!watchlistList || watchlistList.querySelector('.export-btn')) return;
  const exportBtn = document.createElement('button');
  exportBtn.textContent = 'Export watchlist';
  exportBtn.className = 'export-btn';
  exportBtn.style.cssText = 'background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); color: #8db3bf; padding: 0.5rem 0.8rem; border-radius: 6px; font-size: 0.8rem; cursor: pointer; margin: 0.5rem 0 1rem;';
  watchlistList.parentElement.insertBefore(exportBtn, watchlistList);
  exportBtn.addEventListener('click', () => {
    const data = { watchlist: getWatchlist(), exported: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GeoPulse-watchlist-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    tooltip.textContent = 'Watchlist exported';
  });
}

setupGlobalSearch();
setupFeedSearch();
setupAlertFilter();
setupThemeToggle();
setupKeyboardShortcuts();
setupCountryDetailModal();
setupKeyboardHelp();
setupWatchlistActions();

setupNavigation();
setupExportBrief();
setupNotifications();
setupProfileMenu();
setupPanelButtons();

window.setInterval(updateClock, 60000);

buildCountryMap();
