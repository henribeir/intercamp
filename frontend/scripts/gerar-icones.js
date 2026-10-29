// ============================================================
// Gera a logo do cabeçalho e os ícones do app a partir da
// arte original dos alunos (marca/logo-original.png).
//
// Uso:  npm run icones
// Rode de novo sempre que a logo original mudar.
// ============================================================
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const ORIGINAL = 'marca/logo-original.png';
const FUNDO = '#070B14'; // mesma cor de fundo do app

// 1) Corta as bordas pretas da arte (fica só o desenho)
await mkdir('public/brand', { recursive: true });
const logoRecortada = await sharp(ORIGINAL)
  .trim({ background: '#000000', threshold: 25 })
  .png()
  .toBuffer();

// Logo do cabeçalho: exibida com ~64 px de altura; 4x isso basta
// para telas de alta densidade. "palette" deixa o arquivo bem menor.
await sharp(logoRecortada)
  .resize({ height: 256, withoutEnlargement: true })
  .png({ palette: true, quality: 90, compressionLevel: 9 })
  .toFile('public/brand/logo.png');

/**
 * Ícone quadrado: logo centralizada sobre o fundo do app.
 * @param ocupacao quanto do quadrado a logo ocupa (0 a 1)
 */
async function gerarIcone(tamanho, arquivo, ocupacao = 0.86) {
  const lado = Math.round(tamanho * ocupacao);
  const logo = await sharp(logoRecortada)
    .resize({ width: lado, height: lado, fit: 'inside' })
    .toBuffer();

  await sharp({ create: { width: tamanho, height: tamanho, channels: 4, background: FUNDO } })
    .composite([{ input: logo, gravity: 'center' }])
    .png({ palette: true, quality: 90, compressionLevel: 9 })
    .toFile(arquivo);
}

await gerarIcone(48, 'public/favicon.png', 0.96); // aba do navegador
await gerarIcone(180, 'public/apple-touch-icon.png'); // tela inicial do iPhone
await gerarIcone(192, 'public/icon-192.png'); // Android
await gerarIcone(512, 'public/icon-512.png');
await gerarIcone(512, 'public/icon-maskable-512.png', 0.66); // Android recorta as bordas

console.log('Logo e ícones gerados em /public');
