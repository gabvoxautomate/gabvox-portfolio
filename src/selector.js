(() => {
  const configElement = document.getElementById('site-config');
  const config = configElement ? JSON.parse(configElement.textContent) : null;
  const industryField = document.getElementById('business-type');
  const needField = document.getElementById('business-need');
  const result = document.getElementById('finder-result');
  const resultLink = document.getElementById('finder-link');
  if (!config || !industryField || !needField || !result || !resultLink) return;

  const divisionDetails = {
    automation: {
      name: 'Gabvox Automate',
      path: '/automation/',
      generic: 'Explore ways to reduce repetitive work and keep follow-up moving.',
    },
    web: {
      name: 'Gabvox Web Dev',
      path: '/web-development/',
      generic: 'Explore a clearer, faster website built around your customers.',
    },
    combined: {
      name: 'Automate Dev',
      path: '/automate-dev/',
      generic: 'Explore a connected customer journey, from your website to the work that follows.',
    },
  };

  function updateRecommendation() {
    const industry = config.industries.find((item) => item.slug === industryField.value);
    const division = divisionDetails[needField.value];
    if (!industryField.value || !division) {
      result.innerHTML = '<span class="result-kicker">YOUR RECOMMENDATION</span><p class="result-placeholder">Choose a business type and need to see a relevant solution.</p>';
      resultLink.href = '/#solution-finder';
      resultLink.setAttribute('aria-disabled', 'true');
      resultLink.setAttribute('tabindex', '-1');
      resultLink.textContent = 'Show my solution';
      return;
    }

    const matchingSolution = industry && config.solutions.find((item) => (
      item.industry === industry.slug && item.division === needField.value
    ));
    const destination = matchingSolution
      ? matchingSolution.path
      : industry
        ? `${industry.path}#starting-point-${needField.value}`
        : division.path;
    const recommendation = industry
      ? industry.recommendations[needField.value]
      : division.generic;
    const label = industry ? `${industry.selectorName || industry.name} · ${division.name}` : division.name;

    result.innerHTML = `<span class="result-kicker">A GOOD PLACE TO START</span><p class="result-label">${label}</p><p class="result-recommendation">${recommendation}</p>`;
    resultLink.href = destination;
    resultLink.setAttribute('aria-disabled', 'false');
    resultLink.removeAttribute('tabindex');
    resultLink.innerHTML = `Explore this solution <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>`;
  }

  resultLink.addEventListener('click', (event) => {
    if (resultLink.getAttribute('aria-disabled') === 'true') event.preventDefault();
  });
  industryField.addEventListener('change', updateRecommendation);
  needField.addEventListener('change', updateRecommendation);

  updateRecommendation();
})();
