// Get all query parameters from URL
function getQueryParams(url) {
    const queryParams = {};
    const queryString = url.split('?')[1];
    if (queryString) {
        const pairs = queryString.split('&');
        pairs.forEach(pair => {
            const [key, value] = pair.split('=');
            queryParams[key] = decodeURIComponent(value || '');
        });
    }
    return queryParams;
}

// generate breadcrumb
function generateAdminBreadcrumb() {
    const breadcrumb = document.getElementById('admin-breadcrumb');
    breadcrumb.innerHTML = '';

    // add home link
    const homeLink = document.createElement('li');
    const homeAnchor = document.createElement('a');
    homeAnchor.href = 'admin.html';
    homeAnchor.textContent = 'Admin';
    homeLink.appendChild(homeAnchor);
    breadcrumb.appendChild(homeLink);

    // get current page path
    const currentPath = window.location.pathname;
    const currentUrl = window.location.href;
    const queryParams = getQueryParams(currentUrl);

    if (currentPath.endsWith('admin.html') && queryParams.name) {
        // add category link
        const categoryLink = document.createElement('li');
        const categoryAnchor = document.createElement('a');
        categoryAnchor.href = `admin.html?name=${queryParams.name}`;
        categoryAnchor.textContent = `${queryParams.name}`;
        categoryLink.appendChild(categoryAnchor);
        breadcrumb.appendChild(categoryLink);
    } 
}

// On page load: do breadcrumb, load product details or category products
window.onload = () => {
    generateAdminBreadcrumb();

};

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('name');
    renderContent(name);
});

function renderContent(name) {
    const tableHeader = document.getElementById('table-header');
    const tableBody = document.getElementById('table-body');
    const addButton = document.getElementById('add-button');

    tableHeader.innerHTML = '';
    tableBody.innerHTML = '';
    addButton.style.display = 'none';

    if (name === 'category') {
        renderCategoryTable();
        addButton.style.display = 'block';
        addButton.onclick = () => showAddForm('category');
    } else if (name === 'product') {
        renderProductTable();
        addButton.style.display = 'block';
        addButton.onclick = () => showAddForm('product');
    } else {
        renderProductTable();
    }
}

function renderCategoryTable() {
    const tableHeader = document.getElementById('table-header');
    const tableBody = document.getElementById('table-body');

    tableHeader.innerHTML = `
        <tr>
            <th>Category ID</th>
            <th>Name</th>
            <th>Actions</th>
        </tr>
    `;
    tableBody.innerHTML = '';

    fetch('/api/categories/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    })
        .then(response => response.json())
        .then(categories => { //{"catid":1,"name":"C1"},{"catid":2,"name":"C2"}
            categories.forEach(category => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${category.catid}</td>
                    <td>${category.name}</td>
                    <td>
                        <button onclick="editCategory(${category.catid})">Edit</button>
                        <button onclick="deleteCategory(${category.catid})">Delete</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error:', error));
}

function renderProductTable() {
    const tableHeader = document.getElementById('table-header');
    const tableBody = document.getElementById('table-body');

    tableHeader.innerHTML = `
        <tr>
            <th>Product ID</th>
            <th>Category ID</th>
            <th>Category Name</th>
            <th>Name</th>
            <th>Price</th>
            <th>Description</th>
            <th>Image Path</th>
            <th>Actions</th>
        </tr>
    `;
    tableBody.innerHTML = '';

    fetch('/api/products/')
        .then(response => response.json())
        .then(products => {
            products.forEach(product => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${product.pid}</td>
                    <td>${product.catid}</td>
                    <td>${product.category_name}</td>
                    <td>${product.name}</td>
                    <td>${product.price}</td>
                    <td>${product.description}</td>
                    <td>${product.image_path}</td>
                    <td>
                        <button onclick="editProduct(${product.pid})">Edit</button>
                        <button onclick="deleteProduct(${product.pid})">Delete</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error:', error));
}

function showAddForm(type) {
    const modal = document.getElementById('modal');
    const form = document.getElementById('form');
    form.innerHTML = '';

    if (type === 'category') {
        form.innerHTML = `
            <label for="name">Name:</label>
            <input type="text" id="name" name="name" required>
            <input type="submit" value="Submit">
        `;
        form.onsubmit = () => submitForm('category');
    } else if (type === 'product') {
        fetch('/api/categories/')
            .then(response => response.json())
            .then(categories => {
                let categoryOptions = '<option value="">' + 'Select Category' + '</option>';
                categories.forEach(category => {
                    categoryOptions += `<option value="${category.catid}">${category.name}</option>`;
                });
                form.innerHTML = `
                    <label for="catid">Category ID:</label>
                    <select id="catid" name="catid" required>${categoryOptions}</select>
                    <label for="name">Name:</label>
                    <input type="text" id="name" name="name" required>
                    <label for="price">Price:</label>
                    <input type="number" id="price" name="price" step="0.01" required>
                    <label for="description">Description:</label>
                    <textarea id="description" name="description" required></textarea>
                    <label for="image">Image:</label>
                    <input type="file" id="image" name="image" accept="image/jpg,image/jpeg,image/png" required>
                    <input type="hidden" id="image_path" name="image_path" value="">
                    <input type="submit" value="Submit">
                `;
                form.onsubmit = () => submitForm('product');
            })
            .catch(error => console.error('Error:', error));
    }
    modal.style.display = 'block';
}


function editCategory(catid) {
    fetch(`/api/categories/${catid}/`)
        .then(response => response.json())
        .then(category => {
            showAddForm('category');
            document.getElementById('name').value = category.name;
            document.getElementById('form').onsubmit = () => updateCategory(catid);
        })
        .catch(error => console.error('Error:', error));
}

function updateCategory(catid) {
    const name = document.getElementById('name').value;
    fetch(`/api/categories/${catid}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        renderCategoryTable();
        hideModal();
    })
    .catch((error) => {
        console.error('Error:', error);
    });

    return false;
}

function editProduct(pid) {
    fetch(`/api/products/${pid}/`)
        .then(response => response.json())
        .then(product => {
            showAddForm('product');
            document.getElementById('catid').value = product.catid;
            document.getElementById('name').value = product.name;
            document.getElementById('price').value = product.price;
            document.getElementById('description').value = product.description;
            document.getElementById('image_path').value = product.image_path;
            document.getElementById('form').onsubmit = () => updateProduct(pid);
        })
        .catch(error => console.error('Error:', error));
}

function updateProduct(pid) {
    const catid = document.getElementById('catid').value;
    const name = document.getElementById('name').value;
    const price = document.getElementById('price').value;
    const description = document.getElementById('description').value;
    const image_path = document.getElementById('image_path').value;

    fetch(`/api/products/${pid}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ catid, name, price, description, image_path }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        renderProductTable();
        hideModal();
    })
    .catch((error) => {
        console.error('Error:', error);
    });

    return false;
}

function submitForm(type) {
    const form = document.getElementById('form');
    const formData = new FormData(form);

    // check if image is valid
    const imageInput = document.getElementById('image');
    if (imageInput) {
        if (imageInput.files.length > 0) {
            const file = imageInput.files[0];
            const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                alert('Only JPG, PNG, and GIF files are allowed.');
                return false;
            }
            if (file.size > 10 * 1024 * 1024) { // 10MB
                alert('File size must be less than 10MB.');
                return false;
            }
        }
    }
    
    if (type === 'category') {
        fetch('/api/categories/', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(category => {
            console.log('Success:', category);
            renderCategoryTable();
            hideModal();
        })
        .catch(error => console.error('Error:', error));
    } else if (type === 'product') {
        console.log(formData);
        fetch('/api/products/', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(product => {
            console.log('Success:', product);
            renderProductTable();
            hideModal();
        })
        .catch(error => console.error('Error:', error));
    }

    return false;
}


function deleteCategory(catid) {
    fetch(`/api/categories/${catid}/`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        renderCategoryTable();
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function deleteProduct(pid) {
    fetch(`/api/products/${pid}/`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        renderProductTable();
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function hideModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
}
