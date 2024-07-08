/*=================== Document Title ==================*/

/*==================== ProductsData ===================*/
// Import productsData
import { productsData } from './Products.js';

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
  document.querySelector('.modal-description').textContent = product.description;
  document.querySelector('.modal-price').textContent = `$${product.price}`;

  const addToCartBtnModal = document.querySelector('.add-to-cart-modal');
  addToCartBtnModal.dataset.id = product.id;
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
  cartTotal = document.querySelector('.cart-total'),
  cartItemsCounter = document.querySelector('.cart-items'),
  cartContent = document.querySelector('.cart-content'),
  clearCart = document.querySelector('.clear-cart'),
  searchInput = document.querySelector('.search');

let cart = [];
let buttonsDOM = [];

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
          </div class="button-container">
          <button class="btn add-to-cart" data-id="${item.id}">Add to Cart</button>
          <button class="btn more-details" data-id="${item.id}">ⓘ</button>
        </div>
      `;
    });

    productsDOM.innerHTML = result;
  }

  getCartBtns() {
    const addCartBtns = [...document.querySelectorAll('.add-to-cart')];
    const moreDetailsBtns = [...document.querySelectorAll('.more-details')];

    buttonsDOM = addCartBtns;

    addCartBtns.forEach((btn) => {
      const id = btn.dataset.id;
      const isExist = cart.find((p) => p.id === id);

      if (isExist) {
        btn.textContent = 'Added';
        btn.disabled = true;
      }

      btn.addEventListener('click', (e) => {
        e.target.textContent = 'Added';
        e.target.disabled = true;

        const addedProduct = { ...Storage.getProducts(id), quantity: 1 };
        cart = [...cart, addedProduct];
        Storage.saveCart(cart);
        this.setCartValue(cart);
        this.addCartItem(addedProduct);
      });
    });

    moreDetailsBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const product = Storage.getProducts(id);
        showProductModal(product);
      });
    });

    const addToCartBtnModal = document.querySelector('.add-to-cart-modal');
    addToCartBtnModal.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      const product = Storage.getProducts(id);
      
      const isExist = cart.find((p) => p.id === id);

      if (!isExist) {
        const addedProduct = { ...product, quantity: 1 };
        cart = [...cart, addedProduct];
        Storage.saveCart(cart);
        this.setCartValue(cart);
        this.addCartItem(addedProduct);

        // Update button text for the respective product
        const productButton = buttonsDOM.find((btn) => parseInt(btn.dataset.id) === parseInt(id));
        if (productButton) {
          productButton.textContent = 'Added';
          productButton.disabled = true;
        }
      }
      
      closeProductModal();
    });
  }

  setCartValue(cart) {
    let tempCartItems = 0;
    const totalPrice = cart.reduce((acc, curr) => {
      tempCartItems += curr.quantity;
      return acc + curr.quantity * curr.price;
    }, 0);

    cartTotal.textContent = `Total price: $${totalPrice.toFixed(2)}`;
    cartItemsCounter.textContent = tempCartItems;
  }

  addCartItem(cartItem) {
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `
      <img class="cart-item-img" src="${cartItem.imageUrl}" />
      <div class="cart-item-desc">
        <h4>${cartItem.title}</h4>
        <h5>$${cartItem.price}</h5>
      </div>
      <div class="cart-item-controller">
        <i class="ri-arrow-up-s-line arrow-up" data-id="${cartItem.id}"></i>
        <p>${cartItem.quantity}</p>
        <i class="ri-arrow-down-s-line arrow-down" data-id="${cartItem.id}"></i>
      </div>
      <i class="ri-delete-bin-line trash" data-id="${cartItem.id}"></i>
    `;
    cartContent.append(div);
  }

  setUpApp() {
    cart = Storage.getCart() || [];

    cart.forEach((cartItem) => {
      const addedCart = document.querySelector(`[data-id="${cartItem.id}"]`);
      if (addedCart) {
        addedCart.textContent = 'Added';
        addedCart.disabled = true;
      }
      this.addCartItem(cartItem);
    });

    this.setCartValue(cart);
  }

  cartLogic() {
    clearCart.addEventListener('click', () => this.clearCart());
    cartContent.addEventListener('click', (e) => handleClick(e));

    const handleClick = (e) => {
      let target = e.target;
      if (target.classList.contains('arrow-up')) {
        increaseQuantity(target);
      } else if (target.classList.contains('trash')) {
        removeItemFromCart(target);
      } else if (target.classList.contains('arrow-down')) {
        decreaseQuantity(target);
      }
    };

    const increaseQuantity = (target) => {
      const addedItem = cart.find((c) => c.id === parseInt(target.dataset.id));
      addedItem.quantity++;
      this.setCartValue(cart);
      Storage.saveCart(cart);
      target.nextElementSibling.textContent = addedItem.quantity;
    };

    const removeItemFromCart = (target) => {
      const removedItem = cart.find((c) => c.id === parseInt(target.dataset.id));
      this.removeItem(removedItem.id);
      Storage.saveCart(cart);
      cartContent.removeChild(target.parentElement);
    };

    const decreaseQuantity = (target) => {
      const subtractedItem = cart.find((c) => c.id === parseInt(target.dataset.id));
      if (subtractedItem.quantity === 1) {
        this.removeItem(subtractedItem.id);
        cartContent.removeChild(target.parentElement.parentElement);
      } else {
        subtractedItem.quantity--;
        this.setCartValue(cart);
        Storage.saveCart(cart);
        target.previousElementSibling.textContent = subtractedItem.quantity;
      }
    };
  }

  clearCart() {
    const cartItems = cart.map((item) => item.id);

    cartItems.forEach((id) => this.removeItem(id));

    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
  }

  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValue(cart);
    Storage.saveCart(cart);

    const button = this.getSingleButton(id);
    if (button) {
      button.disabled = false;
      button.textContent = 'Add to Cart';
    }
  }

  getSingleButton(id) {
    return buttonsDOM.find((btn) => parseInt(btn.dataset.id) === parseInt(id));
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

  static saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  static getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
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
    ui.getCartBtns();
  });
};

const ui = new UI();
const products = new Products();

/*===================== Events =========================*/
document.addEventListener('DOMContentLoaded', () => {
  const productsData = products.getProducts();
  ui.displayProducts(productsData);
  Storage.saveProducts(productsData);
  ui.getCartBtns();
  ui.setUpApp();
  ui.cartLogic();
  searchProduct();
});
