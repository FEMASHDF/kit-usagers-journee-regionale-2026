document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', async () => {
 const target = document.getElementById(button.dataset.copy);
 const status = document.getElementById('copy-status');
 try {
  if (!navigator.clipboard) throw new Error('clipboard unavailable');
  await navigator.clipboard.writeText(target.innerText);
  status.textContent = 'Texte copié. Pensez à personnaliser les éléments entre crochets.';
  button.textContent = 'Texte copié ✓';
  setTimeout(() => {button.textContent = 'Copier le texte';}, 3500);
 } catch {
  const range = document.createRange(); range.selectNodeContents(target);
  const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
  status.textContent = 'Le texte est sélectionné. Utilisez la commande Copier de votre appareil.';
 }
}));
