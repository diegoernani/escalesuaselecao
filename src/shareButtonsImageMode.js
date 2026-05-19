const SOCIAL_BUTTON_LABELS = ['WhatsApp', 'Story', 'Facebook'];

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

  const observer = new MutationObserver(() => hideSocialButtons());
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
