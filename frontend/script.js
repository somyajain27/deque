let cart = [];
let scanning = false;
let walletBalance = 1000;

function setStatus(msg) {
  document.getElementById("status").innerText = msg;
}

// Start barcode scan
function startScan() {
  if (scanning) return;
  scanning = true;

  setStatus("📷 Scanning barcode...");
  document.getElementById("scanner").innerHTML = "";

  Quagga.init({
    inputStream: {
      type: "LiveStream",
      target: document.querySelector("#scanner"),
      constraints: { facingMode: "environment" }
    },
    decoder: { readers: ["ean_reader"] }
  }, err => {
    if (err) {
      setStatus("❌ Camera error");
      scanning = false;
      return;
    }
    Quagga.start();
  });

  Quagga.onDetected(onDetected);
}

// When barcode detected
function onDetected(result) {
  const barcode = result.codeResult.code;

  Quagga.offDetected(onDetected);
  Quagga.stop();
  scanning = false;

  document.getElementById("scanner").innerHTML =
    "✅ Scan complete. Click Start Scan to scan next item.";

  setStatus("✅ Scanned: " + barcode);

  fetch(`http://localhost:3000/product/${barcode}`)
    .then(res => res.json())
    .then(product => {
      if (!product) {
        setStatus("❌ Product not found");
        return;
      }

      cart.push(product);
      updateCart();
      setStatus(`🛒 Added ${product.name} (₹${product.price})`);
    });
}

// Update cart UI
function updateCart() {
  const list = document.getElementById("cart-items");
  const totalEl = document.getElementById("total");

  list.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    total += item.price;
    list.innerHTML += `<li>${item.name} - ₹${item.price}</li>`;
  });

  totalEl.innerText = total;
}

// Cashless wallet payment
function payNow() {
  if (cart.length === 0) {
    alert("Cart is empty");
    return;
  }

  const total = cart.reduce((sum, p) => sum + p.price, 0);

  if (walletBalance < total) {
    alert("❌ Insufficient wallet balance");
    return;
  }

  walletBalance -= total;
  document.getElementById("balance").innerText = walletBalance;

  setStatus("💰 Payment successful via Cashless Wallet");
  generateQR(total);
}

// Generate QR after payment
function generateQR(totalAmount) {
  const bill = {
    items: cart,
    total: totalAmount,
    payment_mode: "CASHLESS_TOKEN",
    remaining_balance: walletBalance,
    time: new Date().toISOString()
  };

  document.getElementById("qrBox").innerHTML = "";
  new QRCode(document.getElementById("qrBox"), {
    text: JSON.stringify(bill),
    width: 200,
    height: 200
  });

  cart = [];
  updateCart();
}
