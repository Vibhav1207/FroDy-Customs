/*=================== Document Title ==================*/

/*==================== ProductsData ===================*/
// Import productsData
import { productsData } from './products/customcarsProducts.js';

/*======================== Modal ======================*/
const cartBtn = document.querySelector('.cart-btn'),
  cartModal = document.querySelector('.cart'),
  backDrop = document.querySelector('.backdrop'),
  closeModalBtn = document.querySelector('.cart-item-confirm'),
  productModal = document.getElementById('product-modal'),
  closeProductModalBtn = document.querySelector('.close-button');

cartBtn.addEventListener('click', showModal);
closeModalBtn.addEventListener('click', closeModal);
backDrop.addEventListener('click', closeModal);
closeProductModalBtn.addEventListener('click', closeProductModal);

function showModal() {
  backDrop.style.display = 'block';
  cartModal.style.opacity = '1';
  cartModal.style.position = 'fixed';
  cartModal.style.top = '21%';
}

function closeModal() {
  backDrop.style.display = 'none';
  cartModal.style.opacity = '0';
  cartModal.style.top = '-100%';
}

function showProductModal(product) {
  backDrop.style.display = 'block';
  productModal.style.display = 'block';

  document.querySelector('.modal-title').textContent = product.title;
  document.querySelector('.modal-image').src = product.imageUrl;
  document.querySelector('.modal-description').innerHTML = product.description.replace(/\n/g, '<br>');
  document.querySelector('.modal-price').textContent = `$${product.price}`;

  document.querySelector('.paypal-link1').href = product.paypalLink1;
  document.querySelector('.preview').href = product.paypalLink2;
}

function closeProductModal() {
  backDrop.style.display = 'none';
  productModal.style.display = 'none';
}

/*==================== Get Products ===================*/
class Products {
  // Load products from API endpoint while loading the page
  getProducts() {
    return productsData;
  }
}

/*================== Display Products =================*/
const productsDOM = document.querySelector('.products-center'),
  searchInput = document.querySelector('.search');

class UI {

  displayProducts(products) {
    let result = '';

    products.forEach((item) => {
      result += `
       <div class="product">
          <div class="img-container">
            <img class="product-img" src="${item.imageUrl}" alt="${item.title}" />
          </div>
          <div class="product-desc">
            <p class="product-title">${item.title}</p>
            <p class="product-price">$${item.price}</p>
          </div>
          <div class="button-container">
            <a class="btn add-to-cart" href="${item.paypalLink1}" target="_blank">Buy Now</a>
            <a class="btn add-to-cart" href="${item.preview}" target="_blank">Preview</a>
          </div>
          <button class="btn more-details" data-id="${item.id}">ⓘ</button>
        </div>
      `;
    });

    productsDOM.innerHTML = result;
  }

  getMoreDetailsBtns() {
    const moreDetailsBtns = [...document.querySelectorAll('.more-details')];

    moreDetailsBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const product = Storage.getProducts(id);
        showProductModal(product);
      });
    });
  }
}

/*================== Local Storage ====================*/
class Storage {
  static saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
  }

  static getProducts(id) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    return products.find((p) => p.id === parseInt(id));
  }
}

/*===================== Search =========================*/
const searchProduct = () => {
  searchInput.addEventListener('input', (e) => {
    const searchValue = e.target.value.trim().toLowerCase();
    const filteredProducts = productsData.filter((p) =>
      p.title.toLowerCase().includes(searchValue)
    );
    ui.displayProducts(filteredProducts);
    ui.getMoreDetailsBtns();
  });
};

const ui = new UI();
const products = new Products();

/*===================== Events =========================*/
document.addEventListener('DOMContentLoaded', () => {
  const productsData = products.getProducts();
  ui.displayProducts(productsData);
  Storage.saveProducts(productsData);
  ui.getMoreDetailsBtns();
  searchProduct();
});
