# Asset Pipeline — Adicionar um novo sprite

## Passos

1. Produzir PNG transparente no estilo cartoon western, dimensões combinadas.
2. Salvar em `assets/sprites/<char>-<state>.png` (ou atlas).
3. Registrar metadados no loader (dimensões, grade, âncora, anims).
4. Adicionar fallback: se imagem não carregou (`naturalWidth === 0`), usar procedural.
5. Atualizar `usesSheriffSprite`-style predicate para o novo personagem.
6. Ajustar hitboxes ao recorte visual (skill gameplay-physics).
7. Atualizar preview do menu (`renderCharacterMiniPreview`).
8. Validar: carregar no jogo, todas as fases, resize, P1 e P2 (espelhado).

## Loader (exemplo de forma segura)

```js
const sprites = {};
function loadSprite(key, src, meta) {
  const img = new Image();
  img.onload = () => { sprites[key] = { img, ...meta }; notifyPreviews(); };
  img.onerror = () => { console.warn('sprite missing', src); };
  img.src = src;
}
```

- Nunca bloqueie o init do jogo esperando asset; use fallback procedural até carregar.
- Evite carregar todos os sprites de uma vez se forem grandes (lazy quando selecionado).

## Checklist de aceite de arte

- [ ] Sprite aparece na arena e no preview
- [ ] P2 espelhado corretamente
- [ ] Estados com fallback funcionam
- [ ] Hitboxes alinhadas
- [ ] Sem erro no console
