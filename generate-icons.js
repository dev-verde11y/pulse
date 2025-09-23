const fs = require('fs');
const path = require('path');

// Criar um SVG simples para os ícones da PWA
const createPulseSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1e40af;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#grad)"/>
  <circle cx="${size * 0.3}" cy="${size * 0.3}" r="${size * 0.08}" fill="#ffffff" opacity="0.9"/>
  <circle cx="${size * 0.5}" cy="${size * 0.5}" r="${size * 0.12}" fill="#ffffff"/>
  <circle cx="${size * 0.7}" cy="${size * 0.7}" r="${size * 0.08}" fill="#ffffff" opacity="0.9"/>
  <text x="${size * 0.5}" y="${size * 0.85}" font-family="Arial, sans-serif" font-size="${size * 0.15}" font-weight="bold" text-anchor="middle" fill="#ffffff">P</text>
</svg>`;

// Tamanhos de ícones necessários
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
const shortcutIconSizes = [96];

// Criar ícones principais
iconSizes.forEach(size => {
  const svg = createPulseSVG(size);
  fs.writeFileSync(path.join(__dirname, 'public', 'icons', `icon-${size}x${size}.png.svg`), svg);
  console.log(`Criado ícone ${size}x${size}`);
});

// Criar ícones para shortcuts
const createHeartSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="#dc2626"/>
  <path d="M${size * 0.5} ${size * 0.75} c-${size * 0.15},-${size * 0.15} -${size * 0.25},-${size * 0.25} -${size * 0.25},-${size * 0.35} c0,-${size * 0.1} ${size * 0.1},-${size * 0.2} ${size * 0.25},-${size * 0.2} c${size * 0.15},0 ${size * 0.25},${size * 0.1} ${size * 0.25},${size * 0.2} c0,${size * 0.1} -${size * 0.1},${size * 0.2} -${size * 0.25},${size * 0.35} z" fill="#ffffff"/>
</svg>`;

const createSearchSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="#059669"/>
  <circle cx="${size * 0.45}" cy="${size * 0.45}" r="${size * 0.15}" stroke="#ffffff" stroke-width="${size * 0.03}" fill="none"/>
  <line x1="${size * 0.55}" y1="${size * 0.55}" x2="${size * 0.7}" y2="${size * 0.7}" stroke="#ffffff" stroke-width="${size * 0.03}" stroke-linecap="round"/>
</svg>`;

const createNewSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="#7c3aed"/>
  <circle cx="${size * 0.7}" cy="${size * 0.3}" r="${size * 0.08}" fill="#fbbf24"/>
  <rect x="${size * 0.3}" y="${size * 0.4}" width="${size * 0.4}" height="${size * 0.3}" rx="${size * 0.02}" fill="#ffffff"/>
  <line x1="${size * 0.35}" y1="${size * 0.5}" x2="${size * 0.65}" y2="${size * 0.5}" stroke="#7c3aed" stroke-width="${size * 0.02}"/>
  <line x1="${size * 0.35}" y1="${size * 0.57}" x2="${size * 0.6}" y2="${size * 0.57}" stroke="#7c3aed" stroke-width="${size * 0.02}"/>
  <line x1="${size * 0.35}" y1="${size * 0.64}" x2="${size * 0.55}" y2="${size * 0.64}" stroke="#7c3aed" stroke-width="${size * 0.02}"/>
</svg>`;

shortcutIconSizes.forEach(size => {
  fs.writeFileSync(path.join(__dirname, 'public', 'icons', `heart-${size}x${size}.png.svg`), createHeartSVG(size));
  fs.writeFileSync(path.join(__dirname, 'public', 'icons', `search-${size}x${size}.png.svg`), createSearchSVG(size));
  fs.writeFileSync(path.join(__dirname, 'public', 'icons', `new-${size}x${size}.png.svg`), createNewSVG(size));
  console.log(`Criados ícones de shortcuts ${size}x${size}`);
});

console.log('Todos os ícones SVG foram criados com sucesso!');
console.log('Nota: Estes são arquivos SVG temporários. Em produção, converta-os para PNG usando uma ferramenta como Inkscape ou um conversor online.');