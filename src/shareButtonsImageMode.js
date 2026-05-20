const SOCIAL_BUTTON_LABELS = ['WhatsApp', 'Story', 'Facebook'];

const GOOGLE_ICON_SVG = `
  <svg width="20" height="20" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
    <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62Z" />
    <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.8.54-1.84.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 0 0 9 18Z" />
    <path fill="#FBBC05" d="M3.96 10.71A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.16.28-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.04l3-2.33Z" />
    <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.43 1.35l2.59-2.59A8.68 8.68 0 0 0 9 0 9 9 0 0 0 .96 4.96l3 2.33C4.67 5.16 6.66 3.58 9 3.58Z" />
  </svg>
`;

function isMobileDevice() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
}

function buttonText(button) {
  return button?.textContent?.replace(/\s+/g, ' ').trim() || '';
}

function isSocialButton(button) {
  const text = buttonText(button);
  return SOCIAL_BUTTON_LABELS.some((label) => text === label || text.endsWith(` ${label}`));
}

function hideSocialButtons() {
  document.querySelectorAll('button').forEach((button) => {
    if (!isSocialButton(button)) return;

    button.style.display = 'none';
    button.setAttribute('aria-hidden', 'true');
    button.setAttribute('tabindex', '-1');
  });
}

function styleGoogleButton() {
  document.querySelectorAll('button').forEach((button) => {
    if (!buttonText(button).includes('Entrar com Google')) return;
    if (button.dataset.googleOfficialButton === 'true') return;

    button.dataset.googleOfficialButton = 'true';
    button.className = '';
    button.innerHTML = `<span class="google-icon">${GOOGLE_ICON_SVG}</span><span>Continuar com Google</span>`;

    Object.assign(button.style, {
      alignItems: 'center',
      backgroundColor: '#ffffff',
      border: '1px solid #dadce0',
      borderRadius: '9999px',
      boxShadow: 'none',
      color: '#3c4043',
      cursor: 'pointer',
      display: 'flex',
      fontFamily: 'Roboto, Arial, sans-serif',
      fontSize: '14px',
      fontWeight: '500',
      gap: '12px',
      height: '52px',
      justifyContent: 'center',
      marginTop: '12px',
      padding: '0 24px',
      transition: 'background-color 120ms ease, box-shadow 120ms ease, border-color 120ms ease',
      width: '100%',
    });

    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = '#f8fafd';
      button.style.boxShadow = '0 1px 2px rgba(60, 64, 67, 0.3), 0 1px 3px rgba(60, 64, 67, 0.15)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = '#ffffff';
      button.style.boxShadow = 'none';
    });
  });
}

function forceDesktopDownloadForGeneratedImage() {
  if (isMobileDevice()) return;
  if (!navigator.canShare) return;

  const originalCanShare = navigator.canShare.bind(navigator);

  navigator.canShare = (data) => {
    if (data?.files?.length) return false;
    return originalCanShare(data);
  };
}

export function setupImageShareButtons() {
  forceDesktopDownloadForGeneratedImage();
  hideSocialButtons();
  styleGoogleButton();

  const observer = new MutationObserver(() => {
    hideSocialButtons();
    styleGoogleButton();
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
}
