import { toBlob } from 'html-to-image';

const SOCIAL_BUTTONS = [
  { label: 'WhatsApp', target: 'whatsapp' },
  { label: 'Story', target: 'instagram' },
  { label: 'Facebook', target: 'facebook' },
];

function buttonText(button) {
  return button?.textContent?.replace(/\s+/g, ' ').trim() || '';
}

function getSocialTarget(button) {
  const text = buttonText(button);
  return SOCIAL_BUTTONS.find((item) => text.includes(item.label))?.target || null;
}

function findShareStoryElement() {
  const candidates = Array.from(document.querySelectorAll('div[style]'));
  return candidates.find((element) => element.style.width === '1080px' && element.style.height === '1920px');
}

function buildShareText() {
  return `Minha escalação no Escale Sua Seleção é essa. Faça a sua também: ${window.location.origin}`;
}

function socialUrl(target) {
  const text = buildShareText();
  const siteUrl = window.location.origin;

  if (target === 'whatsapp') {
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }

  if (target === 'facebook') {
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl)}&quote=${encodeURIComponent(text)}`;
  }

  return 'https://www.instagram.com/';
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function downloadBlob(blob) {
  const imageUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = 'minha-escalacao-escale-sua-selecao.png';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(imageUrl);
}

async function generateImage() {
  const element = findShareStoryElement();
  if (!element) throw new Error('Template da imagem não encontrado.');

  const blob = await toBlob(element, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: '#03123d',
  });

  if (!blob) throw new Error('Não foi possível gerar a imagem.');
  return blob;
}

async function handleSocialShare(target, popup) {
  const text = buildShareText();
  const blob = await generateImage();

  downloadBlob(blob);
  await copyText(text);

  if (popup) {
    popup.location.href = socialUrl(target);
    return;
  }

  window.open(socialUrl(target), '_blank', 'noopener,noreferrer');
}

export function setupImageShareButtons() {
  document.addEventListener(
    'click',
    (event) => {
      const button = event.target?.closest?.('button');
      const target = getSocialTarget(button);
      if (!button || !target || button.disabled) return;

      event.preventDefault();
      event.stopPropagation();

      const popup = window.open('about:blank', '_blank');
      handleSocialShare(target, popup).catch((error) => {
        if (popup) popup.close();
        console.error(error);
        window.open(socialUrl(target), '_blank', 'noopener,noreferrer');
      });
    },
    true
  );
}
