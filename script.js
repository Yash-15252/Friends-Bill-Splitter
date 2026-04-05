// Friends Bill Splitter - Enhanced JavaScript Logic
// Clean, professional code with localStorage persistence and smooth animations

let state = JSON.parse(localStorage.getItem('friendsBillState')) || {
  friends: ['Alice', 'Bob'],
  currency: 'USD',
  expenses: []
};

const currencySymbols = {
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'INR': '₹'
};

const addFriendForm = document.getElementById('addFriendForm');
const expenseForm = document.getElementById('expenseForm');
const expensesContainer = document.getElementById('expensesContainer');
const noExpenses = document.getElementById('noExpenses');
const expenseCount = document.getElementById('expenseCount');
const balanceGrid = document.querySelector('.balance-grid');
const friendsList = document.getElementById('friendsList');
const netBalanceEl = document.getElementById('netBalance');

function saveState() {
  localStorage.setItem('friendsBillState', JSON.stringify(state));
}

function updatePayerSelect() {
  const payerSelect = document.getElementById('payer');
  payerSelect.innerHTML = '<option value="">Who paid?</option>';
  state.friends.forEach(friend => {
    const option = document.createElement('option');
    option.value = friend;
    option.textContent = friend;
    payerSelect.appendChild(option);
  });
}

function updateBalances() {
  const totalAmount = state.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const numFriends = state.friends.length;
  const fairShare = totalAmount / numFriends;
  
  // Clear existing balance cards
  balanceGrid.innerHTML = '';
  
  state.friends.forEach(friend => {
    const totalPaid = state.expenses
      .filter(exp => exp.payer === friend)
      .reduce((sum, exp) => sum + exp.amount, 0);
    const net = totalPaid - fairShare;
    
    const balanceCard = document.createElement('div');
    balanceCard.className = `balance-card ${net >= 0 ? 'positive' : 'negative'}`;
    balanceCard.innerHTML = `
      <h3>${friend}</h3>
      <div class="amount">${currencySymbols[state.currency] || ''}${Math.abs(net).toFixed(2)}</div>
      <span class="label">Net balance</span>
    `;
    balanceGrid.appendChild(balanceCard);
  });
  
  // Settlement card
  const settlementCard = document.createElement('div');
  settlementCard.className = 'balance-card net';
  settlementCard.innerHTML = `
    <h3>Settlement</h3>
    <div class="amount">View Chart</div>
    <span class="label">Who owes whom</span>
  `;
  balanceGrid.appendChild(settlementCard);
}

function renderExpenses() {
  const container = document.getElementById('expensesContainer');
  const noExpensesEl = document.getElementById('noExpenses');
  
  if (state.expenses.length === 0) {
    container.style.display = 'none';
    noExpensesEl.style.display = 'block';
    expenseCount.textContent = '0';
    return;
  }
  
  container.style.display = 'flex';
  noExpensesEl.style.display = 'none';
  expenseCount.textContent = state.expenses.length;
  
  container.innerHTML = state.expenses.map((exp, index) => `
    <div class="expense-item">
      <div class="expense-desc">${exp.desc}</div>
      <div class="expense-amount">${currencySymbols[state.currency]}${exp.amount.toFixed(2)}</div>
      <div class="expense-payer">${exp.payer}</div>
      <button class="delete-btn" onclick="deleteExpense(${index})" title="Delete">✕</button>
    </div>
  `).join('');
}

function deleteExpense(index) {
  state.expenses.splice(index, 1);
  saveState();
  renderExpenses();
  updateBalances();
  updatePayerSelect();
}

function addExpense(e) {
  e.preventDefault();
  const desc = document.getElementById('desc').value.trim();
  const amount = parseFloat(document.getElementById('amount').value);
  const payer = document.getElementById('payer').value;
  const currency = document.getElementById('currency').value;
  
  if (!desc || isNaN(amount) || !payer) return;
  
  state.expenses.unshift({
    id: Date.now(),
    desc,
    amount,
    payer
  });
  
  saveState();
  renderExpenses();
  updateBalances();
  updatePayerSelect();
  
  // Animate new expense
  const firstExpense = expensesContainer.children[0];
  if (firstExpense) {
    firstExpense.style.animation = 'none';
    firstExpense.offsetHeight; // trigger reflow
    firstExpense.style.animation = 'fadeInUp 0.4s ease-out';
  }
  
  // Reset form
  expenseForm.reset();
  document.getElementById('currency').value = state.currency;
  expenseForm.querySelector('button').style.animation = 'pulse 0.5s';
  setTimeout(() => expenseForm.querySelector('button').style.animation = '', 500);
}

function deleteExpense(index) {
  expenses.splice(index, 1);
  saveExpenses();
  renderExpenses();
  updateBalances();
  
  // Animate removal
  expensesContainer.style.animation = 'fadeInUp 0.3s';
}

function addFriend(e) {
  e.preventDefault();
  const name = document.getElementById('newFriendName').value.trim();
  if (name && !state.friends.includes(name)) {
    state.friends.push(name);
    saveState();
    renderFriends();
    updatePayerSelect();
    updateBalances();
    document.getElementById('newFriendName').value = '';
  }
}

function renderFriends() {
  friendsList.innerHTML = state.friends.map((friend, index) => `
    <div class="friend-item">
      <input type="text" class="friend-name-input" value="${friend}" onchange="updateFriendName(${index}, this.value)" />
      <button class="delete-btn" onclick="deleteFriend(${index})" title="Remove Friend">✕</button>
    </div>
  `).join('');
}

function updateFriendName(index, newName) {
  if (newName.trim()) {
    state.friends[index] = newName.trim();
    saveState();
    renderFriends();
    updatePayerSelect();
    updateBalances();
  }
}

function deleteFriend(index) {
  state.friends.splice(index, 1);
  saveState();
  renderFriends();
  updatePayerSelect();
  updateBalances();
}

function drawChart() {
  const canvas = document.getElementById('owesChart');
  const ctx = canvas.getContext('2d');
  canvas.width = 400;
  canvas.height = 300;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const totalAmount = state.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  if (totalAmount === 0) return;
  
  const numFriends = state.friends.length;
  const nets = state.friends.map(friend => {
    const totalPaid = state.expenses.filter(exp => exp.payer === friend).reduce((sum, exp) => sum + exp.amount, 0);
    return totalPaid - totalAmount / numFriends;
  });
  
  const positiveSum = nets.filter(n => n > 0).reduce((sum, n) => sum + n, 0);
  const negativeSum = Math.abs(nets.filter(n => n < 0).reduce((sum, n) => sum + n, 0));
  
  const total = positiveSum + negativeSum;
  let startAngle = 0;
  
  nets.forEach((net, i) => {
    if (net !== 0) {
      const sliceAngle = Math.abs(net) / total * 2 * Math.PI;
      ctx.beginPath();
      ctx.arc(200, 150, 120, startAngle, startAngle + sliceAngle);
      ctx.lineTo(200, 150);
      ctx.fillStyle = net > 0 ? '#10b981' : '#ef4444';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      startAngle += sliceAngle * Math.sign(net);
    }
  });
  
  ctx.fillStyle = '#1e3a5f';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Owes Chart', 200, 280);
}

// Event Listeners
addFriendForm.addEventListener('submit', addFriend);
expenseForm.addEventListener('submit', addExpense);
document.getElementById('settlementCard').addEventListener('click', drawChart);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  updatePayerSelect();
  renderFriends();
  renderExpenses();
  updateBalances();
  drawChart();
  
  // Form animation on load
  const forms = [addFriendForm, expenseForm];
  forms.forEach(form => {
    form.style.opacity = '0';
    form.style.transform = 'translateY(20px)';
    setTimeout(() => {
      form.style.transition = 'all 0.5s ease-out';
      form.style.opacity = '1';
      form.style.transform = 'translateY(0)';
    }, 100);
  });
});
