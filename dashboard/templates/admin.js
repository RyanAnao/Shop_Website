// Wait for the DOM to fully load
document.addEventListener("DOMContentLoaded", function () {
    // Initialize all features
    autoHideAlerts();
    highlightActiveMenu();
    confirmLogout();
    addSubmitButtonLoadingState();
    validateForms();
    removeErrorMessagesOnInput();
    confirmDeleteLinks();
    highlightTableRows();
    styleOrderStatuses();
});

// Function to auto-hide alert messages
function autoHideAlerts() {
    const alerts = document.querySelectorAll(".alert");
    if (alerts.length === 0) return; // 如果没有 alert，直接退出
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.transition = "opacity 0.5s ease";
            alert.style.opacity = "0";
            setTimeout(() => alert.remove(), 500); // Remove the element after fade-out
        }, 5000);
    });
}

// Function to highlight the active menu item
function highlightActiveMenu() {
    const menuLinks = document.querySelectorAll(".menu-link");
    if (menuLinks.length === 0) return; // 如果没有菜单链接，直接退出
    menuLinks.forEach(link => {
        if (link.href === window.location.href) {
            link.classList.add("active");
        }
    });
}

// Function to add a confirmation dialog for the logout link
function confirmLogout() {
    const logoutLink = document.querySelector(".menu-link.danger");
    if (!logoutLink) return; // 如果没有 logout 链接，直接退出
    logoutLink.addEventListener("click", function (event) {
        const confirmLogout = confirm("Are you sure you want to log out?");
        if (!confirmLogout) {
            event.preventDefault();
        }
    });
}

// Function to add loading state to submit buttons
function addSubmitButtonLoadingState() {
    const forms = document.querySelectorAll(".form-container");
    if (forms.length === 0) return; // 如果没有表单，直接退出
    forms.forEach(form => {
        const submitButton = form.querySelector(".submit-btn");
        if (submitButton) {
            form.addEventListener("submit", function () {
                submitButton.disabled = true;
                submitButton.textContent = "Submitting...";
            });
        }
    });
}

// Function to validate forms on submit
function validateForms() {
    const forms = document.querySelectorAll(".form-container");
    if (forms.length === 0) return; // 如果没有表单，直接退出
    forms.forEach(form => {
        form.addEventListener("submit", function (event) {
            const requiredFields = form.querySelectorAll("[required]");
            let isValid = true;

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add("error");
                    const errorMessage = document.createElement("div");
                    errorMessage.className = "error-message";
                    errorMessage.textContent = "This field is required.";
                    if (!field.nextElementSibling || !field.nextElementSibling.classList.contains("error-message")) {
                        field.parentNode.insertBefore(errorMessage, field.nextSibling);
                    }
                } else {
                    field.classList.remove("error");
                    if (field.nextElementSibling && field.nextElementSibling.classList.contains("error-message")) {
                        field.nextElementSibling.remove();
                    }
                }
            });

            if (!isValid) {
                event.preventDefault();
            }
        });
    });
}

// Function to remove error messages on input
function removeErrorMessagesOnInput() {
    const inputs = document.querySelectorAll(".form-container input, .form-container textarea");
    if (inputs.length === 0) return; // 如果没有输入框，直接退出
    inputs.forEach(input => {
        input.addEventListener("input", function () {
            if (input.classList.contains("error")) {
                input.classList.remove("error");
                if (input.nextElementSibling && input.nextElementSibling.classList.contains("error-message")) {
                    input.nextElementSibling.remove();
                }
            }
        });
    });
}

// Function to add confirmation dialog for delete links
function confirmDeleteLinks() {
    const deleteLinks = document.querySelectorAll(".delete-link");
    if (deleteLinks.length === 0) return; // 如果没有删除链接，直接退出
    deleteLinks.forEach(link => {
        link.addEventListener("click", function (event) {
            const confirmDelete = confirm("Are you sure you want to delete this item?");
            if (!confirmDelete) {
                event.preventDefault();
            }
        });
    });
}

// Function to highlight table rows on hover and click
function highlightTableRows() {
    const tableRows = document.querySelectorAll("table tbody tr");
    if (tableRows.length === 0) return; // 如果没有表格行，直接退出
    tableRows.forEach(row => {
        row.addEventListener("mouseenter", function () {
            row.style.backgroundColor = "#f9f9f9";
        });
        row.addEventListener("mouseleave", function () {
            row.style.backgroundColor = "";
        });
        row.addEventListener("click", function () {
            tableRows.forEach(r => r.classList.remove("selected-row"));
            row.classList.add("selected-row");
        });
    });
}

// Function to style order statuses dynamically
function styleOrderStatuses() {
    const orderStatuses = document.querySelectorAll(".order-status");
    if (orderStatuses.length === 0) return; // 如果没有订单状态，直接退出
    orderStatuses.forEach(status => {
        if (status.classList.contains("success")) {
            status.style.color = "green";
        } else if (status.classList.contains("danger")) {
            status.style.color = "red";
        }
    });
}