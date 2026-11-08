// Cart State Management via localStorage
let cart = JSON.parse(localStorage.getItem('terko_cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
    
    // Live Match Timer simulation
    const matchTimer = document.getElementById('live-match-timer');
    if (matchTimer) {
        let minute = 67;
        setInterval(() => {
            minute++;
            if (minute <= 90) {
                matchTimer.textContent = minute + "'";
            }
        }, 8000);
    }
});

// Add item to cart
function addToCart(title, priceStr, imgUrl) {
    const priceNum = parseInt(priceStr.replace(/[^0-9]/g, '')) || 0;
    const existingIndex = cart.findIndex(item => item.title === title);
    
    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({
            title: title,
            priceStr: priceStr,
            priceNum: priceNum,
            imgUrl: imgUrl,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartUI();
    
    // Toast notification or alert
    alert(`"${title}" sikeresen bekerült a kosaradba!`);
}

// Remove item from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
}

// Update quantity
function updateQuantity(index, delta) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    saveCart();
    updateCartUI();
}

// Clear cart
function clearCart() {
    if (confirm("Biztosan üríteni szeretnéd a kosarat?")) {
        cart = [];
        saveCart();
        updateCartUI();
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('terko_cart', JSON.stringify(cart));
}

// Update Cart UI (badge & modal table)
function updateCartUI() {
    const badge = document.getElementById('cart-badge');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (badge) {
        badge.textContent = totalItems;
    }
    
    const emptyMsg = document.getElementById('cart-empty-message');
    const itemsContainer = document.getElementById('cart-items-container');
    const tableBody = document.getElementById('cart-table-body');
    const totalPriceEl = document.getElementById('cart-total-price');
    
    if (!emptyMsg || !itemsContainer || !tableBody || !totalPriceEl) return;
    
    if (cart.length === 0) {
        emptyMsg.classList.remove('d-none');
        itemsContainer.classList.add('d-none');
    } else {
        emptyMsg.classList.add('d-none');
        itemsContainer.classList.remove('d-none');
        
        let html = '';
        let grandTotal = 0;
        
        cart.forEach((item, index) => {
            const itemTotal = item.priceNum * item.quantity;
            grandTotal += itemTotal;
            
            html += `
                <tr>
                    <td>
                        <div class="d-flex align-items-center">
                            <img src="${item.imgUrl}" width="50" height="50" class="rounded me-2 object-fit-cover" alt="${item.title}">
                            <div>
                                <strong class="d-block">${item.title}</strong>
                            </div>
                        </div>
                    </td>
                    <td>${item.priceStr}</td>
                    <td>
                        <div class="input-group input-group-sm" style="width: 100px;">
                            <button class="btn btn-outline-secondary" onclick="updateQuantity(${index}, -1)">-</button>
                            <span class="form-control text-center px-1">${item.quantity}</span>
                            <button class="btn btn-outline-secondary" onclick="updateQuantity(${index}, 1)">+</button>
                        </div>
                    </td>
                    <td class="fw-bold">${itemTotal.toLocaleString('hu-HU')} Ft</td>
                    <td>
                        <button onclick="removeFromCart(${index})" class="btn btn-sm btn-outline-danger" title="Törlés">
                            <i class="bi bi-x-lg"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        tableBody.innerHTML = html;
        totalPriceEl.textContent = grandTotal.toLocaleString('hu-HU') + ' Ft';
    }
}

// Checkout simulation
function checkoutCart() {
    if (cart.length === 0) return;
    alert("Köszönjük a megrendelést! A Térkő Titánok FC merch csapata hamarosan feldolgozza a vásárlásodat.");
    cart = [];
    saveCart();
    updateCartUI();
    const modalEl = document.getElementById('cartModal');
    if (modalEl && bootstrap.Modal) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
    }
}

// Toborzási űrlap visszajelzés
function handleApplicationSubmit(event) {
    event.preventDefault();
    alert('Köszönjük a jelentkezést! A Térkő Titánok vezetősége hamarosan keresni fog a megadott telefonszámon.');
    event.target.reset();
}
