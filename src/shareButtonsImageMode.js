const SHARE_BUTTON_LABELS = ['WhatsApp', 'Facebook'];
const IMAGE_SHARE_BUTTON_LABELS = ['Compartilhar imagem', 'Story'];

function buttonText(button) {
  return button?.textContent?.replace(/\s+/g, ' ').trim() || '';
}

function findImageShareButton() {
  const buttons = Array.from(document.querySelectorAll('button'));
  return buttons.find((button) => {
    const text = buttonText(button);
    return IMAGE_SHARE_BUTTON_LABELS.some((label) => text.includes(label)) && !button.disabled;
  });
}

function isNetworkShareButton(button) {
  const text = buttonText(button);
  return SHARE_BUTTON_LABELS.some((label) => text.includes(label)) && !button.disabled;
}

export function setupImageShareButtons() {
  document.addEventListener(
    'click',
    (event) => {
      const button = event.target?.closest?.('button');
      if (!button || !isNetworkShareButton(button)) return;

      const imageShareButton = findImageShareButton();
      if (!imageShareButton || imageShareButton === button) return;

      event.preventDefault();
      event.stopPropagation();
      imageShareButton.click();
    },
    true
  );
}
