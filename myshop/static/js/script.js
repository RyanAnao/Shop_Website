// -------------------- Utility Functions --------------------

// Fetch product details via AJAX
async function fetchProductDetails(pid) {
    try {
        const response = await fetch(`/api/products/${pid}/`);
        if (!response.ok) throw new Error("Failed to fetch product details");
        return await response.json();
    } catch (error) {
        console.error("Error fetching product details:", error);
        return null;
    }
}

// Validate email format
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate password complexity
function validatePassword(password) {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(password);
}

// -------------------- Cart Operations --------------------

const CART_KEY = 'cart';

// Get cart data from localStorage
function getCart() {
    const cart = localStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : {};
}

// Save cart data to localStorage
function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// // Update cart 
// function updateCartCount() {
//     const cart = getCart();
//     const totalCount = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
//     document.getElementById("cart-count").textContent = totalCount;
// }

// Update cart quantity in localStorage
function updateCartQuantity(pid, quantity) {
    const cart = getCart();
    if (cart[pid]) {
        cart[pid].quantity = quantity;
        saveCart(cart);
    }
}

// Add product to cart
function addToCart(productId, price, quantity = 1) {
    const cart = getCart();
    if (!cart[productId]) {
        cart[productId] = { price: price, quantity: 0 };
    }
    cart[productId].quantity += quantity;
    saveCart(cart);
    console.log(`Product ${productId} added to cart.`);
}

// Remove product from cart
function removeFromCart(productId) {
    const cart = getCart();
    if (cart[productId]) {
        delete cart[productId];
        saveCart(cart);
        console.log(`Product ${productId} removed from cart.`);
    }
}

// -------------------- Breadcrumb --------------------

// Generate breadcrumb from URL
function generateBreadcrumb() {
    const breadcrumbContainer = document.getElementById("breadcrumb");
    const pathSegments = window.location.pathname.split("/").filter(segment => segment);

    breadcrumbContainer.innerHTML = ""; // Clear existing breadcrumb

    let currentPath = "/";
    pathSegments.forEach((segment, index) => {
        currentPath += segment + "/";
        const li = document.createElement("li");

        if (index === pathSegments.length - 1) {
            // Last segment (current page)
            li.textContent = decodeURIComponent(segment);
        } else {
            // Intermediate segments (links)
            const a = document.createElement("a");
            a.href = currentPath;
            a.textContent = decodeURIComponent(segment);
            li.appendChild(a);
        }

        breadcrumbContainer.appendChild(li);
    });
}

// -------------------- Category List --------------------

// Fetch categories from the server
async function fetchCategories() {
    try {
        const response = await fetch("/api/categories/");
        if (!response.ok) throw new Error("Failed to fetch categories");
        return await response.json();
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

// Populate category list
async function populateCategoryList() {
    const categoryListContainer = document.getElementById("category-list");
    const categories = await fetchCategories();

    categoryListContainer.innerHTML = ""; // Clear existing categories

    categories.forEach(category => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = `/category/${category.slug}/`;
        a.textContent = category.name;
        li.appendChild(a);
        categoryListContainer.appendChild(li);
    });
}

// -------------------- Product List --------------------

// Attach event listeners for "Add to Cart" buttons
function attachAddToCartListeners() {
    const addToCartButtons = document.querySelectorAll(".btn-add-to-cart");
    addToCartButtons.forEach(button => {
        button.addEventListener("click", function () {
            const productId = this.dataset.id;
            const productName = this.dataset.name;
            const productPrice = parseFloat(this.dataset.price);

            addToCart(productId, productPrice);
            alert(`${productName} has been added to your cart!`);
        });
    });
}

// -------------------- UI Interactions --------------------

// Populate cart dynamically
async function populateCart() {
    const cartItemsContainer = document.getElementById("cart-items");
    const cartPageItemsContainer = document.getElementById("cart-page-items");
    const cartData = getCart();
    const cartTotal = document.getElementById("cart-total");

    cartItemsContainer.innerHTML = ""; // Clear existing items
    let itemIndex = 1; // For PayPal form item indexing
    let totalPrice = 0;

    for (const [pid, { quantity }] of Object.entries(cartData)) {
        const product = await fetchProductDetails(pid);

        if (product) {
            const { name, price } = product;
            const itemTotalPrice = price * quantity;
            totalPrice += itemTotalPrice;

            if (cartItemsContainer) {
                // Create cart item element
                const li = document.createElement("li");
                li.innerHTML = `
                    ${name} (${pid}) - 
                    Quantity: <input type="number" class="quantity-input" data-pid="${pid}" value="${quantity}" min="1">
                    Price: $${price.toFixed(2)} - 
                    Total: <span class="item-total">$${itemTotalPrice.toFixed(2)}</span>
                    <button class="remove-btn" data-pid="${pid}">Remove</button>
                `;
                cartItemsContainer.appendChild(li);
            } 
            if (cartPageItemsContainer) {
                // Create a table row for the cart item
                const row = document.createElement("tr");
                row.innerHTML = `
                    <th scope="row">${pid}</th>
                    <td>
                        <img src="${product.thumbnail.url}" alt="${ product.name }" class="thumbnail-img" style="max-width: 50px; max-height: 50px;">
                    </td>
                    <td><a class="product-link" href="${product.get_absolute_url}">${name}</a></td>
                    <td>$${price.toFixed(2)}</td>
                    <td>
                        <input type="number" class="quantity-input" data-pid="${pid}" value="${quantity}" min="1">
                    </td>
                    <td>$${itemTotalPrice.toFixed(2)}</td>
                    <td>
                        <button class="remove-btn" data-pid="${pid}">Remove</button>
                    </td>
                `;
                cartItemsContainer.appendChild(row);
            }
        }
    }
    cartTotal.textContent = totalPrice.toFixed(2);
    attachCartEventListeners();
}

// Attach event listeners for cart actions
function attachCartEventListeners() {
    // Handle quantity changes
    const quantityInputs = document.querySelectorAll(".quantity-input");
    quantityInputs.forEach(input => {
        input.addEventListener("change", function () {
            const pid = this.dataset.pid;
            const newQuantity = parseInt(this.value, 10);
            if (newQuantity > 0) {
                updateCartQuantity(pid, newQuantity);
                populateCart(); // Re-render the cart
            } else {
                alert("Quantity must be at least 1.");
                this.value = 1; // Reset to minimum value
            }
        });
    });
}

// Toggle dropdown menu
function toggleDropdown(dropdownToggle, dropdownMenu) {
    dropdownToggle.addEventListener("click", function () {
        dropdownMenu.classList.toggle("show");
    });

    document.addEventListener("click", function (event) {
        if (!dropdownToggle.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.classList.remove("show");
        }
    });
}

// Image zoom on hover
function enableImageZoom(productImage) {
    productImage.addEventListener("mousemove", function (event) {
        const rect = productImage.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;

        productImage.style.transformOrigin = `${x}% ${y}%`;
        productImage.style.transform = "scale(2)"; // Zoom in
    });

    productImage.addEventListener("mouseleave", function () {
        productImage.style.transform = "scale(1)"; // Reset zoom
        productImage.style.transformOrigin = "center center";
    });
}

// Lazy load images
function lazyLoadImages() {
    const images = document.querySelectorAll("img[data-src]");
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute("data-src");
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => observer.observe(img));
}

// Real-time form validation
function validateFormFields(form) {
    form.addEventListener("input", function (event) {
        const target = event.target;

        if (target.type === "email" && !validateEmail(target.value)) {
            target.setCustomValidity("Invalid email format.");
        } else if (target.type === "password" && !validatePassword(target.value)) {
            target.setCustomValidity("Password must be at least 8 characters long and include letters and numbers.");
        } else {
            target.setCustomValidity("");
        }
    });
}

// Toggle password visibility
function togglePasswordVisibility(passwordField, toggleButton) {
    toggleButton.addEventListener("click", function () {
        if (passwordField.type === "password") {
            passwordField.type = "text";
            toggleButton.textContent = "Hide Password";
        } else {
            passwordField.type = "password";
            toggleButton.textContent = "Show Password";
        }
    });
}

// ------------------- CSRF Token Handling --------------------
function getCSRFToken() {
    const csrfToken = document.querySelector("[name=csrfmiddlewaretoken]");
    return csrfToken ? csrfToken.value : "";
}

// -------------------- Create Order --------------------
// Function to handle create order
async function createOrderBeforeCheckout() {
    const cartData = getCart();
    if (Object.keys(cartData).length === 0) {
        alert("Your cart is empty!");
        return;
    }

    try {
        const response = await fetch("{% url 'orders:create_order' %}", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCSRFToken(), 
            },
            body: JSON.stringify(cartData),
        });

        const result = await response.json();
        if (result.status === "success") {
            // localStorage.removeItem("cart");
            window.location.href = result.redirect_url;
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error("Error during checkout:", error);
        alert("An error occurred. Please try again.");
    }
}

// -------------------- Paypal Payment --------------------

// Function to handle PayPal payment
async function handlePayPalPayment() {
    const cartData = getCart();
    if (Object.keys(cartData).length === 0) {
        alert("Your cart is empty!");
        return;
    }

    try {
        // Fetch product details and calculate total price
        // let totalPrice = 0;
        // const items = [];
        // for (const [pid, { quantity }] of Object.entries(cartData)) {
        //     const product = await fetchProductDetails(pid);
        //     if (product) {
        //         totalPrice += product.price * quantity;
        //         items.push({
        //             name: product.name,
        //             number: pid,
        //             quantity: quantity,
        //             price: product.price.toFixed(2),
        //         });
        //     }
        // }


        const oid = "{{ order.oid }}"
        const order_id = "{{ order.order_id }}"
        const currency = "HKD";
        // Update order on the server and generate digest in backend
        const response = await fetch(`/orders/update/${oid}/`, { // Update endpoint
            method: "PUT", // Use PUT for updating existing resources
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCSRFToken(),
            },
            body: JSON.stringify({ currency }), // Send updated data
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(`Error: ${errorData.message}`);
            return;
        }

        const updatedOrder = await response.json();
        console.log("Order updated successfully:", updatedOrder);
        
        // Extract merchantEmail and digest from the response
        const { merchant_email: merchantEmail } = updatedOrder.order;
        const { digest } = updatedOrder.digest_for_paypal;

        // Generate PayPal form
        const paypalForm = document.createElement("form");
        paypalForm.action = "https://www.sandbox.paypal.com/cgi-bin/webscr";
        paypalForm.method = "POST";

        const return_url = "https://s47.iems5718.ie.cuhk.edu.hk/orders/complete";
        const cancel_return = "https://s47.iems5718.ie.cuhk.edu.hk/orders/checkout/${oid}";

        // Add hidden fields required by PayPal
        paypalForm.innerHTML = `
            <input type="hidden" name="cmd" value="_cart">
            <input type="hidden" name="upload" value="1">
            <input type="hidden" name="business" value="${merchantEmail}">
            <input type="hidden" name="charset" value="utf-8">
            <input type="hidden" name="currency_code" value="${currency}">
            <input type="hidden" name="invoice" value="${order_id}">
            <input type="hidden" name="custom" value="${digest}">
            <input type="hidden" name="return" value="${return_url}">
            <input type="hidden" name="cancel_return" value="${cancel_return}">
        `;

        // Add items to the form
        items.forEach((item, index) => {
            const itemIndex = index + 1;
            paypalForm.innerHTML += `
                <input type="hidden" name="item_name_${itemIndex}" value="${item.name}">
                <input type="hidden" name="item_number_${itemIndex}" value="${item.number}">
                <input type="hidden" name="quantity_${itemIndex}" value="${item.quantity}">
                <input type="hidden" name="amount_${itemIndex}" value="${item.price}">
            `;
        });

        // Append form to body and submit
        document.body.appendChild(paypalForm);
        paypalForm.submit();

        // Clear cart after submission
        localStorage.removeItem(CART_KEY);
    } catch (error) {
        console.error("Error during PayPal payment:", error);
        alert("An error occurred. Please try again.");
    }
}

// Attach PayPal payment handler to the button
document.getElementById("pay-now-btn").addEventListener("click", handlePayPalPayment);

// -------------------- Event Listeners --------------------

document.addEventListener("DOMContentLoaded", function () {
    // Initialize base
    generateBreadcrumb();
    populateCategoryList();

    // Add to cart from product list page +1
    attachAddToCartListeners();

    // Initialize cart
    const cartItemsContainer = document.getElementById("cart-items");
    const cartPageItemsContainer = document.getElementById("cart-page-items");
    const paypalForm = document.getElementById("paypal-form");
    if (cartItemsContainer || cartPageItemsContainer) {
        populateCart();
    }

    // Add to cart from product detail page +n
    const addToCartForm = document.getElementById("add-to-cart-form");
    if (addToCartForm) {
        addToCartForm.addEventListener("submit", function (event) {
            event.preventDefault(); 

            const productId = addToCartForm.dataset.id;
            const quantity = parseInt(addToCartForm.dataset.quantity, 10);

            addToCart(productId, quantity);
            updateCartQuantity();

            alert("Product added to cart!");
        });
    }

    // Remove from cart
    const removeButtons = document.querySelectorAll(".remove-btn");
    if (removeButtons) {
        removeButtons.forEach(button => {
            button.addEventListener("click", function () {
                const productId = this.dataset.pid;
                removeFromCart(productId);
                updateCartQuantity();
                this.parentElement.remove(); // Remove item from UI

                alert("Product removed from cart!");
            });
        });
    }

    // Checkout button and create order
    const checkoutButton = document.getElementById("checkout-btn");
    if (checkoutButton) {
        checkoutButton.addEventListener("click", function (event) {
            event.preventDefault();
            createOrderBeforeCheckout();
        });
    }

    // Checkout and create order
    const prePayButton = document.getElementById("pre-pay-btn");
    if (prePayButton) {
        prePayButton.addEventListener("click", async function () {
            const checkoutCart = JSON.parse(localStorage.getItem("checkoutCart"));
            if (!checkoutCart) {
                alert("No items in checkout.");
                return;
            }

            try {
                const response = await fetch("/orders/create/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": getCSRFToken(),
                    },
                    body: JSON.stringify(checkoutCart),
                });

                if (response.ok) {
                    const data = await response.json();
                    alert(data.message);
                    localStorage.removeItem("checkoutCart");
                    window.location.href = data.redirect_url;
                } else {
                    const errorData = await response.json();
                    alert(`Error: ${errorData.message}`);
                }
            } catch (error) {
                console.error("Error submitting checkout:", error);
                alert("An error occurred. Please try again.");
            }
        });
    }

    // Dropdown menu
    const dropdownToggle = document.querySelector(".dropdown-toggle");
    const dropdownMenu = document.querySelector(".dropdown-menu");
    if (dropdownToggle && dropdownMenu) {
        toggleDropdown(dropdownToggle, dropdownMenu);
    }

    // Image zoom
    const productImage = document.querySelector(".product-image img");
    if (productImage) {
        enableImageZoom(productImage);
    }

    // Lazy load images
    lazyLoadImages();

    // Form validation
    const forms = document.querySelectorAll("form");
    forms.forEach(form => validateFormFields(form));

    // Password visibility toggle
    const passwordField = document.querySelector("input[type='password']");
    const toggleButton = document.querySelector(".toggle-password");
    if (passwordField && toggleButton) {
        togglePasswordVisibility(passwordField, toggleButton);
    }

    // // Payment 
    // const paymentOptions = document.querySelectorAll(".payment-option");
    // const payNowButton = document.getElementById("pay-now-btn");
    // let selectedPaymentUrl = null;

    // if (paymentOptions) {
    //     paymentOptions.forEach(option => {
    //         option.addEventListener("click", function () {
    //             paymentOptions.forEach(opt => opt.classList.remove("selected"));
    //             this.classList.add("selected");

    //             selectedPaymentUrl = this.dataset.url;
    //             payNowButton.disabled = false;
    //         });
    //     });
    // }
    
    // if (payNowButton) {
    //     payNowButton.addEventListener("click", function () {
    //         if (selectedPaymentUrl) {
    //             window.location.href = selectedPaymentUrl;
    //         } else {
    //             alert("Please select a payment method.");
    //         }
    //     });
    // }
    
});