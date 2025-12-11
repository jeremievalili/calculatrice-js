// Calculatrice JS - logique simple et robuste

const displayEl = document.getElementById('display');
const keys = document.querySelector('.keys');

let current = '';      // l'expression visible
let lastResult = null; // dernier résultat (optionnel)

function updateDisplay(value){
  displayEl.textContent = value === '' ? '0' : value;
}

// Ajoute un caractère (chiffre ou opérateur)
function append(value){
  // éviter deux opérateurs consécutifs (sauf minus après autre opérateur)
  const lastChar = current.slice(-1);
  const operators = ['+','-','*','/'];

  if (operators.includes(value)) {
    if (current === '' && value !== '-') return; // n'autorise pas + * / en premier
    if (operators.includes(lastChar)) {
      // remplacer l'opérateur précédent par le nouveau (sauf si dernier est - et on met - après)
      current = current.slice(0,-1) + value;
      updateDisplay(current);
      return;
    }
  }

  // gérer le point décimal : n'ajouter qu'un point par nombre
  if (value === '.') {
    // trouver la partie après le dernier opérateur
    const parts = current.split(/[\+\-\*\/]/);
    const lastPart = parts[parts.length-1];
    if (lastPart.includes('.')) return;
    if (lastPart === '') current += '0'; // si on appuie sur . directement après opérateur
  }

  current += value;
  updateDisplay(current);
}

// Supprimer dernier caractère
function backspace(){
  current = current.slice(0,-1);
  updateDisplay(current);
}

// Clear
function clearAll(){
  current = '';
  lastResult = null;
  updateDisplay(current);
}

// Change le signe du nombre courant (±)
function toggleNeg(){
  const parts = current.split(/([\+\-\*\/])/); // conserve séparateurs
  // le dernier élément est la partie active
  let last = parts.pop();
  // si vide, on fait rien
  if (last === '') return;
  // si last contient un opérateur isolé (peu probable), ignore
  if (['+','-','*','/'].includes(last)) { parts.push(last); return; }

  // inverse le signe du dernier nombre
  if (last.startsWith('-')) {
    last = last.slice(1);
  } else {
    last = '-' + last;
  }
  parts.push(last);
  current = parts.join('');
  updateDisplay(current);
}

// Pourcentage : transforme le dernier nombre en pourcentage
function percent(){
  const parts = current.split(/([\+\-\*\/])/);
  let last = parts.pop();
  if (last === '') return;
  const num = parseFloat(last);
  if (isNaN(num)) return;
  const val = (num / 100).toString();
  parts.push(val);
  current = parts.join('');
  updateDisplay(current);
}

// Évaluer l'expression (avec précautions)
function calculate(){
  if (current === '') return;
  // Safety: autorise uniquement chiffres, opérateurs et points
  if (!/^[0-9+\-*/.() ]+$/.test(current)) {
    updateDisplay('Erreur');
    return;
  }

  try {
    // Évaluer l'expression
    const result = Function('"use strict"; return (' + current + ')')();
    lastResult = result;
    current = String(result);
    updateDisplay(current);
  } catch (e) {
    updateDisplay('Erreur');
  }
}

// Gestion des clicks
keys.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;

  const value = btn.dataset.value;
  const action = btn.dataset.action;

  if (action === 'clear') clearAll();
  else if (action === 'back') backspace();
  else if (action === 'calculate') calculate();
  else if (action === 'neg') toggleNeg();
  else if (action === 'percent') percent();
  else if (value) append(value);
});

// Raccourcis clavier
window.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') append(e.key);
  else if (['+','-','*','/','.'].includes(e.key)) append(e.key);
  else if (e.key === 'Enter') { e.preventDefault(); calculate(); }
  else if (e.key === 'Backspace') backspace();
  else if (e.key === 'Escape') clearAll();
});

// initialisation
updateDisplay('');
