const fs = require('node:fs');
const path = require('node:path');
const { divisions, industries, solutionPages, resources } = require('./src/site-data');

const output = path.resolve(__dirname, 'dist');
const siteUrl = (process.env.SITE_URL || 'https://gabvox.com').replace(/\/+$/, '');

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

function jsonForHtml(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function pathForIndustry(industry) {
  return `/industries/${industry.slug}/`;
}

function link(pathname, label, className = '') {
  return `<a${className ? ` class="${className}"` : ''} href="${escapeHtml(pathname)}">${label}</a>`;
}

function icon(name) {
  const paths = {
    bolt: '<path d="m13 2-3 8h7l-6 12 2-9H6l7-11Z"/>',
    window: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 4v5"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.1 0l3-3A5 5 0 0 0 13 2.9l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.1 0l-3 3a5 5 0 0 0 7.1 7.1l1.7-1.7"/>',
    arrow: '<path d="M5 12h14m-7-7 7 7-7 7"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    spark: '<path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z"/><path d="m19 14 1.2 2.3L22 17l-1.8.7L19 20l-1.1-2.3L16 17l1.9-.7L19 14Z"/>',
  };
  return `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;
}

function cards(items, className = '') {
  return `<div class="card-grid${className ? ` ${className}` : ''}">${items.join('')}</div>`;
}

function divisionCard(key, featured = false) {
  const division = divisions[key];
  const iconName = key === 'automation' ? 'bolt' : key === 'web' ? 'window' : 'link';
  return `<article class="division-card${featured ? ' division-card-featured' : ''}">
    <span class="icon-box">${icon(iconName)}</span>
    <p class="eyebrow">${escapeHtml(division.eyebrow)}</p>
    <h2>${escapeHtml(division.name)}</h2>
    <p class="card-summary">${escapeHtml(division.cardSummary || division.outcome)}</p>
    ${link(`/${key === 'automation' ? 'automation' : key === 'web' ? 'web-development' : 'automate-dev'}/`, `Explore ${escapeHtml(division.shortName)} ${icon('arrow')}`, 'text-link')}
  </article>`;
}

function industryCard(industry) {
  return `<a class="industry-card" href="${pathForIndustry(industry)}">
    <span class="industry-tier">TIER ${industry.tier}</span>
    <span class="industry-name">${escapeHtml(industry.name)}</span>
    ${icon('arrow')}
  </a>`;
}

function solutionCard(solution) {
  return `<article class="solution-card">
    <span class="solution-label">${escapeHtml(divisions[solution.division].shortName)} · ${escapeHtml(industries.find((item) => item.slug === solution.industry).name)}</span>
    <h3>${escapeHtml(solution.title)}</h3>
    <p>${escapeHtml(solution.summary)}</p>
    ${link(solution.path, `Explore the solution ${icon('arrow')}`, 'text-link')}
  </article>`;
}

function resourceCard(resource) {
  return `<article class="resource-card">
    <span class="eyebrow">PRACTICAL GUIDE</span>
    <h3>${link(`/resources/${resource.slug}/`, escapeHtml(resource.title))}</h3>
    <p>${escapeHtml(resource.description)}</p>
    ${link(`/resources/${resource.slug}/`, `Read the guide ${icon('arrow')}`, 'text-link')}
  </article>`;
}

function packageCard(industry) {
  const packageName = {
    'real-estate': 'Real Estate',
    'medical-clinics': 'Clinic',
    'recruitment-agencies': 'Recruitment',
    'insurance-agencies': 'Insurance',
    agencies: 'Agency',
  }[industry.slug];
  return `<article class="solution-card package-card">
    <span class="solution-label">CONNECTED BUSINESS SYSTEM · ${escapeHtml(industry.name)}</span>
    <h3>${escapeHtml(packageName)} Digital Systems</h3>
    <p>${escapeHtml(industry.recommendations.combined)}</p>
    ${link(`${pathForIndustry(industry)}#starting-point-combined`, `Explore the solution concept ${icon('arrow')}`, 'text-link')}
  </article>`;
}

function breadcrumb(items) {
  return `<nav class="breadcrumbs" aria-label="Breadcrumb">${items.map((item, index) => `${index ? '<span aria-hidden="true">/</span>' : ''}${index === items.length - 1 ? `<span aria-current="page">${escapeHtml(item.label)}</span>` : link(item.path, escapeHtml(item.label))}`).join('')}</nav>`;
}

function industryFaqs(industry) {
  return [
    [`What should a ${industry.name.toLowerCase()} business automate first?`, `Start with a frequent, rules-based task that creates visible friction, such as enquiry routing or routine follow-up. Map who owns exceptions before automating it.`],
    ['Will this connect to our existing systems?', 'It depends on the platforms, access, and supported integration options. Any specific connection is checked and agreed before it is described as part of a solution.'],
  ];
}

function faqSection(faqs) {
  if (!faqs || !faqs.length) return '';
  return `<section class="section section-soft"><div class="content-wrap faq-wrap">
    <div class="section-heading"><p class="eyebrow">GOOD TO KNOW</p><h2>Questions, answered.</h2></div>
    <div class="faq-list">${faqs.map(([question, answer]) => `<details><summary>${escapeHtml(question)}<span aria-hidden="true">+</span></summary><p>${escapeHtml(answer)}</p></details>`).join('')}</div>
  </div></section>`;
}

function ctaSection(heading = 'Start with the problem you want to solve.') {
  return `<section class="cta-section"><div class="content-wrap cta-inner">
    <div><p class="eyebrow">A BETTER NEXT STEP</p><h2>${escapeHtml(heading)}</h2><p>Choose a business type and tell us what you need. We’ll point you toward a relevant solution.</p></div>
    ${link('/#solution-finder', `Find your solution ${icon('arrow')}`, 'button button-light')}
  </div></section>`;
}

function pageHero(eyebrow, title, description, trail = []) {
  return `<section class="page-hero"><div class="content-wrap">
    ${breadcrumb([{ label: 'Home', path: '/' }, ...trail, { label: title }])}
    <p class="eyebrow">${escapeHtml(eyebrow)}</p><h1>${escapeHtml(title)}</h1><p class="lead">${escapeHtml(description)}</p>
  </div></section>`;
}

function homePage() {
  return `<main id="main">
    <section class="hero"><div class="content-wrap hero-grid">
      <div class="hero-copy">
        <p class="eyebrow"><span class="status-dot"></span> BUSINESS SYSTEMS, BUILT AROUND YOU</p>
        <h1>What does your business <span>need?</span></h1>
        <p class="hero-lead">Pick a business challenge. We’ll help you find the right mix of website, automation, and connected systems.</p>
        <a href="#solution-finder" class="button button-primary">Find your solution ${icon('arrow')}</a>
        <p class="hero-note">Practical solutions first. Technology second.</p>
      </div>
      <div class="hero-art" aria-hidden="true">
        <div class="art-topline"><span>YOUR BUSINESS, MOVING FORWARD</span><span class="art-indicator"></span></div>
        <div class="art-orbit orbit-one"></div><div class="art-orbit orbit-two"></div>
        <div class="art-center">${icon('spark')}<span>Better<br>business flow</span></div>
        <span class="orbit-label orbit-label-one">Respond</span><span class="orbit-label orbit-label-two">Connect</span><span class="orbit-label orbit-label-three">Grow</span>
        <div class="art-bottomline"><span>WEBSITE</span><span>+</span><span>WORKFLOW</span><span>+</span><span>PEOPLE</span></div>
      </div>
    </div></section>
    <div class="content-wrap hero-choices">
      <div class="hero-choice-heading"><p class="eyebrow">THREE CLEAR STARTING POINTS</p><p>Choose the business solution you need.</p></div>
      ${cards([divisionCard('automation', true), divisionCard('web'), divisionCard('combined')], 'division-grid')}
    </div>
    ${solutionFinder()}
    <section class="section"><div class="content-wrap">
      <div class="section-heading section-heading-row"><div><p class="eyebrow">BUILT AROUND YOUR INDUSTRY</p><h2>Made for the way your business works.</h2></div><p>Start with familiar business challenges, not a list of tools.</p></div>
      <div class="industry-grid">${industries.filter((industry) => !industry.selectorOnly).map(industryCard).join('')}</div>
      <div class="section-tail">${link('/industries/', `Explore all industries ${icon('arrow')}`, 'text-link')}</div>
    </div></section>
    <section class="section section-soft"><div class="content-wrap">
      <div class="section-heading section-heading-row"><div><p class="eyebrow">SOLUTION LIBRARY</p><h2>Practical ideas, grounded in real workflows.</h2></div><p>These are solution concepts, not claims of completed client projects or guaranteed results.</p></div>
      ${cards(solutionPages.map(solutionCard), 'solution-grid')}
    </div></section>
    <section class="section"><div class="content-wrap">
      <div class="section-heading section-heading-row"><div><p class="eyebrow">USEFUL STARTING POINTS</p><h2>Good systems start with good questions.</h2></div>${link('/resources/', `Browse all resources ${icon('arrow')}`, 'text-link')}</div>
      ${cards(resources.map(resourceCard), 'resource-grid')}
    </div></section>
    ${ctaSection()}
  </main>`;
}

function solutionFinder() {
  const selectorSlugs = new Set(['real-estate', 'medical-clinics', 'insurance-agencies', 'agencies', 'construction']);
  const options = `${industries.filter((industry) => selectorSlugs.has(industry.slug)).map((industry) => `<option value="${industry.slug}">${escapeHtml(industry.selectorName || industry.name)}</option>`).join('')}<option value="other">Other</option>`;
  return `<section class="section finder-section" id="solution-finder"><div class="content-wrap finder-layout">
    <div class="finder-intro"><p class="eyebrow">YOUR BUSINESS SOLUTION SELECTOR</p><h2>Let’s find your best starting point.</h2><p>Tell us what kind of business you run and what you want to improve. Get a relevant path, not a generic pitch.</p>
      <div class="finder-promise">${icon('check')}<span>No commitment. Just a clearer next step.</span></div>
    </div>
    <div class="finder-panel">
      <div class="finder-fields">
        <label for="business-type">What kind of business?</label>
        <select id="business-type" name="business-type"><option value="">Choose your industry</option>${options}</select>
        <label for="business-need">What would help most?</label>
        <select id="business-need" name="business-need"><option value="">Choose a need</option><option value="automation">Automation</option><option value="web">Website</option><option value="combined">Both</option></select>
      </div>
      <div class="finder-result" id="finder-result" aria-live="polite" aria-atomic="true">
        <span class="result-kicker">YOUR RECOMMENDATION</span>
        <p class="result-placeholder">Choose a business type and need to see a relevant solution.</p>
      </div>
      <a id="finder-link" class="button button-dark finder-button" href="/#solution-finder" aria-disabled="true">Show my solution ${icon('arrow')}</a>
    </div>
  </div></section>`;
}

function divisionPage(key) {
  const division = divisions[key];
  const routeSegment = key === 'automation' ? 'automation' : key === 'web' ? 'web-development' : 'automate-dev';
  const examples = solutionPages.filter((solution) => solution.division === key);
  const recommendedIndustries = industries.filter((industry) => industry.featured || industry.tier === 2);
  return `<main id="main">${pageHero(division.eyebrow, division.title, division.description, [{ label: division.shortName, path: `/${routeSegment}/` }])}
    <section class="section"><div class="content-wrap two-col">
      <div><p class="eyebrow">THE BUSINESS OUTCOME</p><h2>${escapeHtml(division.outcome)}</h2><p>Good work starts with a clear picture of the process, the people involved, and the result your business actually needs.</p></div>
      <div><div class="outcome-list">${division.outcomes.map((outcome) => `<div>${icon('check')}<span>${escapeHtml(outcome)}</span></div>`).join('')}</div><div class="service-list">${division.services.map((service) => `<div>${icon('check')}<span>${escapeHtml(service)}</span></div>`).join('')}</div></div>
    </div></section>
    <section class="section section-soft"><div class="content-wrap">
      <div class="section-heading"><p class="eyebrow">HOW IT TAKES SHAPE</p><h2>Thoughtful from first question to handoff.</h2></div>
      <div class="process-grid">${division.steps.map(([title, copy], index) => `<article class="process-card"><span class="process-number">0${index + 1}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(copy)}</p></article>`).join('')}</div>
    </div></section>
    <section class="section" id="industry-solutions"><div class="content-wrap">
      <div class="section-heading section-heading-row"><div><p class="eyebrow">INDUSTRY SOLUTIONS</p><h2>Relevant to the work you do.</h2></div><p>Explore business challenges and solution concepts tailored to your industry.</p></div>
      <div class="industry-grid">${recommendedIndustries.map(industryCard).join('')}</div>
    </div></section>
    ${key === 'combined' ? `<section class="section section-soft"><div class="content-wrap"><div class="section-heading"><p class="eyebrow">CONNECTED SYSTEM CONCEPTS</p><h2>Website and workflow, designed together.</h2><p>Explore business-focused package concepts. These describe possible solutions, not completed client projects.</p></div>${cards(industries.filter((industry) => ['real-estate', 'medical-clinics', 'recruitment-agencies', 'insurance-agencies', 'agencies'].includes(industry.slug)).map(packageCard), 'solution-grid')}</div></section>` : ''}
    ${examples.length ? `<section class="section section-soft"><div class="content-wrap"><div class="section-heading"><p class="eyebrow">SOLUTION EXAMPLES</p><h2>Ideas grounded in business needs.</h2><p>These examples describe possible approaches, not completed client engagements.</p></div>${cards(examples.map(solutionCard), 'solution-grid')}</div></section>` : ''}
    ${faqSection(division.faqs)}${ctaSection()}
  </main>`;
}

function industryPage(industry) {
  const recommendations = Object.entries(industry.recommendations).map(([key, description]) => {
    const divisionPath = key === 'automation' ? '/automation/' : key === 'web' ? '/web-development/' : '/automate-dev/';
    const title = key === 'automation' ? divisions.automation.name : key === 'web' ? divisions.web.name : divisions.combined.name;
    const example = solutionPages.find((solution) => solution.industry === industry.slug && solution.division === key);
    const destination = example ? example.path : `${pathForIndustry(industry)}#starting-point-${key}`;
    return `<article class="recommendation-card" id="starting-point-${key}"><span class="eyebrow">${escapeHtml(title)}</span><h3>${escapeHtml(description)}</h3><p>Start by mapping the current process, the tools involved, and what a useful next step looks like.</p>${link(destination, `Explore ${escapeHtml(key === 'automation' ? 'automation' : key === 'web' ? 'web development' : 'connected systems')} ${icon('arrow')}`, 'text-link')}</article>`;
  }).join('');
  const related = solutionPages.filter((solution) => solution.industry === industry.slug);
  return `<main id="main">${pageHero('INDUSTRY SOLUTIONS', `${industry.name} business solutions`, `Explore practical ways to improve the customer journey and the work behind it for ${industry.name.toLowerCase()}.`, [{ label: 'Industries', path: '/industries/' }])}
    <section class="section"><div class="content-wrap industry-story">
      <article class="story-panel"><p class="eyebrow">A CHALLENGE WORTH SOLVING</p><h2>Where work gets harder than it needs to be.</h2><p>${escapeHtml(industry.problem)}</p></article>
      <article class="story-panel story-panel-accent"><p class="eyebrow">A BETTER WAY FORWARD</p><h2>Make the next step clearer.</h2><p>${escapeHtml(industry.opportunity)}</p></article>
    </div></section>
    <section class="section section-soft"><div class="content-wrap">
      <div class="section-heading"><p class="eyebrow">CHOOSE YOUR STARTING POINT</p><h2>One business. Three ways to help.</h2><p>Pick the part of the journey you want to improve first.</p></div>
      <div class="card-grid recommendation-grid">${recommendations}</div>
    </div></section>
    ${related.length ? `<section class="section"><div class="content-wrap"><div class="section-heading"><p class="eyebrow">SOLUTION BLUEPRINTS</p><h2>Explore an example approach.</h2><p>These are starting-point concepts, not represented client results.</p></div>${cards(related.map(solutionCard), 'solution-grid')}</div></section>` : ''}
    ${faqSection(industryFaqs(industry))}
    ${ctaSection(`Find a clearer next step for your ${industry.name.toLowerCase()} business.`)}
  </main>`;
}

function solutionPage(solution) {
  const division = divisions[solution.division];
  const industry = industries.find((item) => item.slug === solution.industry);
  return `<main id="main">${pageHero(`${division.eyebrow} · ${industry.name.toUpperCase()}`, solution.title, solution.summary, [{ label: division.shortName, path: `/${solution.division === 'automation' ? 'automation' : solution.division === 'web' ? 'web-development' : 'automate-dev'}/` }, { label: industry.name, path: pathForIndustry(industry) }])}
    ${solution.visual ? `<section class="section solution-visual-section"><div class="content-wrap"><figure class="solution-concept">
      <img src="${escapeHtml(solution.visual.src)}" width="1365" height="768" alt="${escapeHtml(solution.visual.alt)}" loading="lazy" decoding="async">
      <figcaption><p class="eyebrow">CONCEPTUAL WORKFLOW</p><h2>${escapeHtml(solution.visual.title)}</h2><p>${escapeHtml(solution.visual.caption)}</p></figcaption>
    </figure></div></section>` : ''}
    <section class="section"><div class="content-wrap solution-detail">
      <aside class="solution-aside"><p class="eyebrow">THE BUSINESS CONTEXT</p><p>${escapeHtml(industry.problem)}</p>${link(pathForIndustry(industry), `More ${escapeHtml(industry.name.toLowerCase())} solutions ${icon('arrow')}`, 'text-link')}</aside>
      <div class="solution-content">${solution.sections.map(([title, copy], index) => `<article class="detail-step"><span>0${index + 1}</span><div><h2>${escapeHtml(title)}</h2><p>${escapeHtml(copy)}</p></div></article>`).join('')}</div>
    </div></section>
    ${ctaSection(`Explore a better workflow for ${industry.name.toLowerCase()}.`)}
  </main>`;
}

function industriesPage() {
  const tiers = [
    ['Tier 1 · Core focus', 1],
    ['Tier 2 · Growing opportunities', 2],
    ['Tier 3 · More industries', 3],
  ];
  return `<main id="main">${pageHero('INDUSTRIES', 'Business solutions that fit your world', 'Explore industry-specific challenges and ideas across automation, web development, and connected business systems.', [{ label: 'Industries', path: '/industries/' }])}
    ${tiers.map(([title, tier]) => `<section class="section${tier % 2 === 0 ? ' section-soft' : ''}"><div class="content-wrap"><div class="section-heading"><p class="eyebrow">${escapeHtml(title.toUpperCase())}</p><h2>${tier === 1 ? 'Start where the opportunity is clearest.' : tier === 2 ? 'Make everyday operations easier.' : 'Room to build a better experience.'}</h2></div><div class="industry-grid">${industries.filter((industry) => industry.tier === tier).map(industryCard).join('')}</div></div></section>`).join('')}
    ${ctaSection()}
  </main>`;
}

function resourcesPage() {
  return `<main id="main">${pageHero('RESOURCES', 'Practical guides for better business systems', 'Clear, useful advice for improving the way customers find you and the way work moves through your business.', [{ label: 'Resources', path: '/resources/' }])}
    <section class="section"><div class="content-wrap"><div class="resource-library">${resources.map((resource) => `<article class="resource-entry"><span class="eyebrow">PRACTICAL GUIDE</span><h2>${link(`/resources/${resource.slug}/`, escapeHtml(resource.title))}</h2><p>${escapeHtml(resource.description)}</p>${link(`/resources/${resource.slug}/`, `Read the guide ${icon('arrow')}`, 'text-link')}</article>`).join('')}</div></div></section>
    ${ctaSection()}
  </main>`;
}

function resourcePage(resource) {
  return `<main id="main">${pageHero('PRACTICAL GUIDE', resource.title, resource.description, [{ label: 'Resources', path: '/resources/' }])}
    <article class="section"><div class="content-wrap article-layout"><div class="article-copy">${resource.sections.map(([title, copy]) => `<section><h2>${escapeHtml(title)}</h2><p>${escapeHtml(copy)}</p></section>`).join('')}</div><aside class="article-aside"><p class="eyebrow">PUT IT INTO PRACTICE</p><h2>Start with the business need.</h2><p>Use the solution selector to find an approach that fits your industry and goal.</p>${link('/#solution-finder', `Find your solution ${icon('arrow')}`, 'text-link')}</aside></div></article>
    ${ctaSection()}
  </main>`;
}

function header() {
  return `<a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header"><div class="content-wrap header-inner">
    <a class="brand" href="/" aria-label="Gabvox home"><img src="/assets/logo/gabvox-logo.webp" width="190" height="62" alt="Gabvox Portfolio. Smart solutions, real results." fetchpriority="high"></a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation"><span class="sr-only">Toggle navigation</span><span></span><span></span></button>
    <nav class="primary-nav" id="primary-navigation" aria-label="Primary navigation">
      <a href="/automation/">Automate</a><a href="/web-development/">Web Dev</a><a href="/automate-dev/">Automate Dev</a>
      <a href="/industries/">Industries</a><a href="/resources/">Resources</a><a class="nav-cta" href="/#solution-finder">Find your solution ${icon('arrow')}</a>
    </nav>
  </div></header>`;
}

function footer() {
  return `<footer class="site-footer"><div class="content-wrap">
    <div class="footer-main"><div class="footer-brand"><a class="brand brand-footer" href="/" aria-label="Gabvox home"><img src="/assets/logo/gabvox-logo.webp" width="190" height="62" alt="Gabvox Portfolio. Smart solutions, real results." loading="lazy" decoding="async"></a><p>Business solutions designed around how your work actually gets done.</p></div>
      <div class="footer-links"><div><span class="footer-title">SOLUTIONS</span><a href="/automation/">Gabvox Automate</a><a href="/web-development/">Gabvox Web Dev</a><a href="/automate-dev/">Automate Dev</a></div><div><span class="footer-title">EXPLORE</span><a href="/industries/">Industries</a><a href="/resources/">Resources</a><a href="/#solution-finder">Solution selector</a></div></div>
    </div><div class="footer-bottom"><span>© ${new Date().getFullYear()} Gabvox. All rights reserved.</span><span>Built around business outcomes, not buzzwords.</span></div>
  </div></footer>`;
}

function renderDocument(page) {
  const canonical = `${siteUrl}${page.path}`;
  const socialImage = page.socialImage ? `${siteUrl}${page.socialImage}` : `${siteUrl}/assets/logo/gabvox-logo.webp`;
  const socialImageAlt = page.socialImageAlt || 'Gabvox Portfolio. Smart solutions, real results.';
  const breadcrumbs = page.path.split('/').filter(Boolean).map((segment, index, segments) => {
    const labels = {
      automation: 'Automation',
      'web-development': 'Web Development',
      'automate-dev': 'Automate Dev',
      industries: 'Industries',
      resources: 'Resources',
      'real-estate': 'Real Estate',
      clinics: 'Clinics',
      'medical-clinics': 'Medical Clinics',
      'ai-receptionist': 'AI Receptionist',
      recruitment: 'Recruitment',
      'recruitment-agencies': 'Recruitment Agencies',
      'insurance-agencies': 'Insurance Agencies',
      'law-firms': 'Law Firms',
      'home-services': 'Home Services',
      hotels: 'Hotels',
      'schools-training': 'Schools and Training Centers',
      agencies: 'Agencies',
      ecommerce: 'E-commerce',
      construction: 'Construction',
    };
    return {
      '@type': 'ListItem',
      position: index + 2,
      name: labels[segment] || segment.split('-').map((word) => word[0].toUpperCase() + word.slice(1)).join(' '),
      item: `${siteUrl}/${segments.slice(0, index + 1).join('/')}/`,
    };
  });
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Gabvox',
      url: `${siteUrl}/`,
      logo: `${siteUrl}/assets/logo/gabvox-logo.webp`,
      description: 'Business-focused website development, workflow automation, and connected digital systems.',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Gabvox',
      url: `${siteUrl}/`,
    },
    ...(page.schema || []),
    ...(page.faqs?.length ? [{
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: page.faqs.map(([question, answer]) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    }] : []),
    ...(page.path !== '/' ? [{
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
        ...breadcrumbs,
      ],
    }] : []),
  ];
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#ffffff">
  <meta name="description" content="${escapeHtml(page.description)}">
  <meta property="og:type" content="${page.type === 'article' ? 'article' : 'website'}">
  <meta property="og:site_name" content="Gabvox">
  <meta property="og:title" content="${escapeHtml(page.title)}">
  <meta property="og:description" content="${escapeHtml(page.description)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta property="og:image" content="${escapeHtml(socialImage)}">
  <meta property="og:image:alt" content="${escapeHtml(socialImageAlt)}">
  <meta name="twitter:card" content="${page.socialImage ? 'summary_large_image' : 'summary'}">
  ${page.socialImage ? `<meta name="twitter:image" content="${escapeHtml(socialImage)}">\n  <meta name="twitter:image:alt" content="${escapeHtml(socialImageAlt)}">` : ''}
  <title>${escapeHtml(page.title)}</title>
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <link rel="icon" href="/assets/logo/gabvox-icon.png" type="image/png">
  <link rel="stylesheet" href="/styles.css">
  <script type="application/ld+json">${jsonForHtml(structuredData)}</script>
  ${page.includeSelectorData ? `<script type="application/json" id="site-config">${jsonForHtml({
    industries: industries.map((industry) => ({
      slug: industry.slug,
      name: industry.name,
      selectorName: industry.selectorName,
      recommendations: industry.recommendations,
      path: pathForIndustry(industry),
    })),
    solutions: solutionPages.map((solution) => ({
      industry: solution.industry,
      division: solution.division,
      path: solution.path,
    })),
  })}</script><script src="/selector.js" defer></script>` : ''}
  <script src="/app.js" defer></script>
</head>
<body>${header()}${page.body}${footer()}</body>
</html>`;
}

function createPages() {
  const pages = [{
    path: '/',
    title: 'Business Automation & Web Development | Gabvox',
    description: 'Choose a business solution. Explore workflow automation, conversion-focused websites, and connected digital systems designed around real business needs.',
    body: homePage(),
    includeSelectorData: true,
    schema: [{ '@context': 'https://schema.org', '@type': 'WebPage', name: 'Gabvox business solution selector', description: 'Find the right mix of automation, web development, and connected systems for your business.' }],
  }];
  for (const [key, division] of Object.entries(divisions)) {
    const segment = key === 'automation' ? 'automation' : key === 'web' ? 'web-development' : 'automate-dev';
    pages.push({
      path: `/${segment}/`,
      title: `${division.name} | ${division.eyebrow.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase())} | Gabvox`,
      description: division.description,
      body: divisionPage(key),
      faqs: division.faqs,
      schema: [{ '@context': 'https://schema.org', '@type': 'Service', name: division.name, description: division.description, provider: { '@type': 'Organization', name: 'Gabvox', url: `${siteUrl}/` } }],
    });
  }
  for (const industry of industries) {
    pages.push({
      path: pathForIndustry(industry),
      title: `${industry.name} Business Solutions | Gabvox`,
      description: `Explore business-focused automation, website, and connected-system ideas for ${industry.name.toLowerCase()}.`,
      body: industryPage(industry),
      faqs: industryFaqs(industry),
      schema: [{ '@context': 'https://schema.org', '@type': 'WebPage', name: `${industry.name} business solutions`, description: industry.opportunity }],
    });
  }
  pages.push({
    path: '/industries/',
    title: 'Industries | Tailored Business Solutions | Gabvox',
    description: 'Browse business-specific ideas for real estate, clinics, recruitment, insurance, legal, home services, hospitality, education, agencies, and ecommerce.',
    body: industriesPage(),
  });
  for (const solution of solutionPages) {
    pages.push({
      path: solution.path,
      title: solution.seoTitle || `${solution.title} | Gabvox`,
      description: solution.summary,
      body: solutionPage(solution),
      ...(solution.visual ? {
        socialImage: solution.visual.src,
        socialImageAlt: solution.visual.alt,
      } : {}),
      schema: [{ '@context': 'https://schema.org', '@type': 'Service', name: solution.title, description: solution.summary, provider: { '@type': 'Organization', name: 'Gabvox', url: `${siteUrl}/` } }],
    });
  }
  pages.push({
    path: '/resources/',
    title: 'Business Systems Resources & Guides | Gabvox',
    description: 'Practical guides to lead response, business websites, and connecting customer journeys to business workflows.',
    body: resourcesPage(),
  });
  for (const resource of resources) {
    pages.push({
      path: `/resources/${resource.slug}/`,
      title: `${resource.title} | Gabvox Resources`,
      description: resource.description,
      body: resourcePage(resource),
      type: 'article',
      schema: [{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: resource.title,
        description: resource.description,
        author: { '@type': 'Organization', name: 'Gabvox' },
        publisher: { '@type': 'Organization', name: 'Gabvox', url: `${siteUrl}/` },
        mainEntityOfPage: `${siteUrl}/resources/${resource.slug}/`,
      }],
    });
  }
  return pages;
}

function writePage(page) {
  const directory = path.join(output, page.path.replace(/^\/|\/$/g, ''));
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, 'index.html'), renderDocument(page), 'utf8');
}

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
for (const page of createPages()) writePage(page);
for (const asset of ['app.js', 'selector.js', 'styles.css']) {
  fs.copyFileSync(path.join(__dirname, 'src', asset), path.join(output, asset));
}
const logoDirectory = path.join(output, 'assets', 'logo');
fs.mkdirSync(logoDirectory, { recursive: true });
for (const asset of ['gabvox-logo.webp', 'gabvox-icon.png']) {
  fs.copyFileSync(path.join(__dirname, 'src', 'assets', 'logo', asset), path.join(logoDirectory, asset));
}
const solutionAssetDirectory = path.join(output, 'assets', 'solutions');
fs.mkdirSync(solutionAssetDirectory, { recursive: true });
fs.copyFileSync(
  path.join(__dirname, 'src', 'assets', 'solutions', 'real-estate-lead-response.webp'),
  path.join(solutionAssetDirectory, 'real-estate-lead-response.webp'),
);

const sitemapPages = createPages();
fs.writeFileSync(path.join(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapPages.map((page) => `  <url><loc>${escapeHtml(`${siteUrl}${page.path}`)}</loc></url>`).join('\n')}\n</urlset>\n`, 'utf8');
fs.writeFileSync(path.join(output, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`, 'utf8');
console.log(`Built ${sitemapPages.length} static pages into ${output}`);
