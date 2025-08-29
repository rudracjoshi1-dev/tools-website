/* =======================
   WORD COUNTER
======================= */
const textInput = document.getElementById('textInput');
if(textInput){
  textInput.addEventListener('input', () => {
    const text = textInput.value;
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const chars = text.replace(/\s/g, '').length;
    document.getElementById('wordCount').textContent = words;
    document.getElementById('charCount').textContent = chars;
  });
}

/* =======================
   PASSWORD GENERATOR
======================= */
function generatePassword() {
  const length = parseInt(document.getElementById('length').value);
  const includeNumbers = document.getElementById('includeNumbers').checked;
  const includeSymbols = document.getElementById('includeSymbols').checked;

  let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if(includeNumbers) chars += '0123456789';
  if(includeSymbols) chars += '!@#$%^&*()_+{}[]';

  let password = '';
  for(let i=0;i<length;i++){
    password += chars.charAt(Math.floor(Math.random()*chars.length));
  }
  const output = document.getElementById('passwordOutput');
  output.value = password;
}

// Copy button
const copyBtn = document.getElementById('copyBtn');
if(copyBtn){
  copyBtn.addEventListener('click', () => {
    const output = document.getElementById('passwordOutput');
    navigator.clipboard.writeText(output.value);
    copyBtn.textContent = 'Copied ✓';
    setTimeout(()=>copyBtn.textContent='Copy',1500);
  });
}

// Slider value display
const lengthSlider = document.getElementById('length');
const lengthDisplay = document.getElementById('lengthValue');
if(lengthSlider){
  lengthSlider.addEventListener('input', ()=>{
    lengthDisplay.textContent = lengthSlider.value;
  });
}

/* =======================
   MORTGAGE CALCULATOR
======================= */

// Cache DOM elements
const principalSlider = document.getElementById('principal');
const interestSlider = document.getElementById('interest');
const yearsSlider = document.getElementById('years');
const yearsValueDisplay = document.getElementById('yearsValue');
const mortgageResult = document.getElementById('mortgageResult');
const extraPaymentInput = document.getElementById('extraPayment');
const downPaymentInput = document.getElementById('downPayment');

function updateYearsDisplay() {
  yearsValueDisplay.textContent = yearsSlider.value;
}

function adjustYears(delta) {
  let val = parseInt(yearsSlider.value);
  val += delta;
  if(val < parseInt(yearsSlider.min)) val = yearsSlider.min;
  if(val > parseInt(yearsSlider.max)) val = yearsSlider.max;
  yearsSlider.value = val;
  updateYearsDisplay();
}

function calculateMortgage() {
  const principal = parseFloat(principalSlider.value) || 0;
  const annualInterest = parseFloat(interestSlider.value) || 0;
  const years = parseInt(yearsSlider.value) || 0;
  const extraPayment = parseFloat(extraPaymentInput?.value) || 0;
  const downPayment = parseFloat(downPaymentInput?.value) || 0;

  const loan = principal - downPayment;
  const monthlyInterest = annualInterest / 100 / 12;
  const totalPayments = years * 12;

  let monthlyPayment = loan * monthlyInterest / (1 - Math.pow(1 + monthlyInterest, -totalPayments));
  monthlyPayment += extraPayment;

  if(isNaN(monthlyPayment) || !isFinite(monthlyPayment)) monthlyPayment = 0;

  mortgageResult.innerHTML =
    `<strong>Monthly Payment:</strong> £${monthlyPayment.toFixed(2)}<br>
     <strong>Total Payment:</strong> £${(monthlyPayment*totalPayments).toFixed(2)}<br>
     <strong>Total Interest:</strong> £${(monthlyPayment*totalPayments - loan).toFixed(2)}`;

  drawPieChart(loan, monthlyPayment, totalPayments, monthlyInterest);
  drawAmortizationChart(loan, monthlyPayment, totalPayments, monthlyInterest);
}

// Chart functions
function toggleChartSize(chartId, button) {
  const chartContainer = document.getElementById(chartId).parentElement;
  if(chartContainer.classList.contains('large')){
    chartContainer.classList.remove('large');
    button.textContent = 'Enlarge';
  } else {
    chartContainer.classList.add('large');
    button.textContent = 'Minimize';
  }
}

function drawPieChart(loan, monthlyPayment, totalPayments, monthlyInterest){
  const ctx = document.getElementById('pieChart').getContext('2d');
  if(window.pieChart) window.pieChart.destroy();
  const totalInterest = monthlyPayment*totalPayments - loan;
  window.pieChart = new Chart(ctx,{
    type:'pie',
    data:{
      labels:['Principal','Interest'],
      datasets:[{data:[loan,totalInterest], backgroundColor:['#4facfe','#00f2fe'] }]
    },
    options:{ responsive:true, plugins:{ legend:{ position:'bottom' } } }
  });
}

function drawAmortizationChart(loan, monthlyPayment, totalPayments, monthlyInterest){
  const ctx = document.getElementById('amortizationChart').getContext('2d');
  if(window.amortChart) window.amortChart.destroy();
  let balance = loan;
  const labels = [];
  const principalData = [];
  const interestData = [];

  for(let i=1;i<=totalPayments;i++){
    const interest = balance*monthlyInterest;
    const principalPaid = monthlyPayment - interest;
    balance -= principalPaid;
    if(balance<0) balance=0;
    labels.push(i);
    principalData.push(principalPaid);
    interestData.push(interest);
  }

  window.amortChart = new Chart(ctx,{
    type:'bar',
    data:{
      labels,
      datasets:[
        {label:'Principal', data: principalData, backgroundColor:'#4facfe'},
        {label:'Interest', data: interestData, backgroundColor:'#00f2fe'}
      ]
    },
    options:{
      responsive:true,
      scales:{ x:{ stacked:true }, y:{ stacked:true } },
      plugins:{ legend:{ position:'bottom' } }
    }
  });
}

// Initialize slider displays
if(yearsSlider) updateYearsDisplay();

// Optionally, you can attach input listeners for principal and interest sliders for live update
