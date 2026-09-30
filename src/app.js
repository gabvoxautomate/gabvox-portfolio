(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.primary-nav');

  if (!menuButton || !navigation) return;

  const closeNavigation = () => {
    menuButton.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
  };

  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    navigation.classList.toggle('is-open', !isOpen);
  });
  menuButton.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      closeNavigation();
      menuButton.focus();
    }
  });
  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeNavigation();
  });
  navigation.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeNavigation();
      menuButton.focus();
    }
  });
})();
