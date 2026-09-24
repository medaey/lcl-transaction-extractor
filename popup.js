let extractedData = [];
let currentSelectedIndex = 0;

const tabsContainer = document.getElementById('monthTabs');
if (tabsContainer) {
  tabsContainer.addEventListener('wheel', (evt) => {
    evt.preventDefault();
    tabsContainer.scrollLeft += evt.deltaY;
  });
}

document.getElementById('extractBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: extractLCLTransactions
  }, (results) => {
    const statusCard = document.getElementById('statusCard');
    const statusIcon = document.getElementById('statusIcon');
    const statusText = document.getElementById('statusText');

    if (results && results[0] && results[0].result) {
      extractedData = results[0].result;

      if (extractedData.length === 0) {
        statusCard.className = "status-card info";
        statusIcon.textContent = "⚠️";
        statusText.textContent = "Aucune liste d'opérations trouvée sur cette page LCL.";
        return;
      }

      renderTabs();
      selectMonth(0);

      let totalOps = 0;
      extractedData.forEach(item => totalOps += item.values.length);

      document.getElementById('copyBtn').disabled = false;

      statusCard.className = "status-card success";
      statusIcon.textContent = "✓";
      statusText.innerHTML = `<span class="status-badge-count">${totalOps} opérations</span> extraites sur <strong>${extractedData.length} mois</strong>.`;
    } else {
      statusCard.className = "status-card info";
      statusIcon.textContent = "❌";
      statusText.textContent = "Impossible d'accéder à la page courante.";
    }
  });
});

function renderTabs() {
  const tabsContainer = document.getElementById('monthTabs');
  tabsContainer.innerHTML = '';
  tabsContainer.style.display = 'flex';

  extractedData.forEach((item, idx) => {
    const btn = document.createElement('button');
    btn.className = `tab-btn ${idx === 0 ? 'active' : ''}`;
    btn.textContent = item.monthName || `Mois ${idx + 1}`;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectMonth(idx);
    });
    tabsContainer.appendChild(btn);
  });
}

function parseAmount(valStr) {
  if (!valStr) return 0;
  let cleaned = valStr.replace(/[^0-9,-]/g, '').replace(',', '.');
  let num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function formatEuro(val) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val);
}

function selectMonth(index) {
  currentSelectedIndex = index;
  const monthData = extractedData[index];
  if (!monthData) return;

  const ops = monthData.values || [];
  
  let totalExpenses = 0;
  let totalIncome = 0;

  ops.forEach(val => {
    let amount = parseAmount(val);
    if (amount < 0) {
      totalExpenses += Math.abs(amount);
    } else {
      totalIncome += amount;
    }
  });

  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('dataHeader').style.display = 'flex';
  document.getElementById('summaryGrid').style.display = 'grid';
  document.getElementById('opsList').style.display = 'block';

  document.getElementById('totalExpense').textContent = `- ${formatEuro(totalExpenses)}`;
  document.getElementById('totalIncome').textContent = `+ ${formatEuro(totalIncome)}`;

  document.getElementById('currentMonthTitle').textContent = monthData.monthName || `Mois ${index + 1}`;
  document.getElementById('currentMonthCount').textContent = `${ops.length} opération${ops.length > 1 ? 's' : ''}`;

  const listEl = document.getElementById('opsList');
  listEl.innerHTML = '';

  ops.forEach(val => {
    const li = document.createElement('li');
    const isNegative = val.trim().startsWith('-');
    li.className = `op-item ${isNegative ? 'negative' : 'positive'}`;
    
    const labelSpan = document.createElement('span');
    labelSpan.style.color = '#64748b';
    labelSpan.style.fontSize = '11px';
    labelSpan.textContent = isNegative ? 'Débit' : 'Crédit';

    const valSpan = document.createElement('span');
    valSpan.textContent = val;

    li.appendChild(labelSpan);
    li.appendChild(valSpan);
    listEl.appendChild(li);
  });
}

document.getElementById('copyBtn').addEventListener('click', () => {
  if (extractedData.length === 0) return;

  let textToCopy = "";

  if (extractedData[currentSelectedIndex]) {
    textToCopy = extractedData[currentSelectedIndex].values.join('\n');
  } else {
    extractedData.forEach(item => {
      textToCopy += `=== ${item.monthName} ===\n` + item.values.join('\n') + "\n\n";
    });
  }

  navigator.clipboard.writeText(textToCopy.trim()).then(() => {
    const statusText = document.getElementById('statusText');
    const prevText = statusText.innerHTML;
    statusText.textContent = "✓ Liste copiée dans le presse-papiers !";
    setTimeout(() => {
      statusText.innerHTML = prevText;
    }, 2000);
  });
});

function extractLCLTransactions() {
  const result = [];

  const xpathUl = '//*[@id="main-content"]/app-account-details-page/div[1]/ui-transaction-list/ul';
  const ulNodes = document.evaluate(xpathUl, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

  for (let i = 0; i < ulNodes.snapshotLength; i++) {
    const ul = ulNodes.snapshotItem(i);
    const index = i + 1;

    let monthName = `Mois ${index}`;
    const xpathH2 = `//*[@id="main-content"]/app-account-details-page/div[1]/ui-transaction-list/h2[${index}]/span/span`;
    const h2Node = document.evaluate(xpathH2, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    
    if (h2Node && h2Node.textContent.trim()) {
      monthName = h2Node.textContent.trim();
    }

    const valuesInCurrentUl = [];
    const xpathSpans = './/li/ui-transaction-item/button/span[1]/span[4]/span';
    const spanNodes = document.evaluate(xpathSpans, ul, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

    for (let j = 0; j < spanNodes.snapshotLength; j++) {
      const text = spanNodes.snapshotItem(j).textContent.trim();
      if (text) {
        valuesInCurrentUl.push(text);
      }
    }

    result.push({
      monthName: monthName,
      values: valuesInCurrentUl
    });
  }

  return result;
}
