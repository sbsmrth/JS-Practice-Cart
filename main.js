import './style.css'
import './node_modules/bootstrap/dist/js/bootstrap.min.js'
import './custom_styles.scss'

const templateCard = document.getElementById('template-card').content;
const templateOff = document.getElementById('template-offcanvas').content;
const row = document.getElementById('cards-row');
const offcanvasBody = document.getElementById('off-body');
const templateFooter = document.getElementById('template-footer').content;
const offcanvasFooter = document.getElementById('offcanvas-footer');
const offcanvasHeader = document.querySelector('.offcanvas-header');
const offcanvasHeaderContent = document.querySelector('.offcanvas-header .header-content');
const fragment = new DocumentFragment();
let cart = {};

document.addEventListener('DOMContentLoaded', () => {
  getProducts();
  if(localStorage.getItem('cart')) {
    cart = JSON.parse(localStorage.getItem('cart'));
    showCart();
  }
});

const manageMutation = (todo, id) => {
  switch(todo) {
    case 'increase':
      cart[id].quantity++;
      break;
    case 'decrease':
      if(cart[id].quantity === 1) {
        delete cart[id];
      } else {
        cart[id].quantity--;
      }
  }
  showCart();
}

const manageTotalItems = ({value, type}) => {
  const totalItems = document.getElementById('totalItems');
  const currentValue = +(totalItems.textContent).replace('(', '').replace(')', '');

  if (type === 'reset') return totalItems.textContent = '(0)';

  if (currentValue) {
    totalItems.textContent = `(${currentValue + value})`;
  } else {
    totalItems.textContent = `(${1})`;
  }
}

offcanvasBody.addEventListener('click', (event) => {
  if(event.target.classList.contains('btn-primary')) {
    manageMutation('increase', event.target.dataset.id);
    manageTotalItems({value: 1});
  }

  if(event.target.classList.contains('btn-dark')) {
    manageMutation('decrease', event.target.dataset.id);
    manageTotalItems({value: -1});
  }

  event.stopPropagation();
});

row.addEventListener('click', (event) => {
  event.preventDefault();
  addProduct(event);
});

const getProducts = async () => {
  try {
    const ans = await fetch('api.json');
    const data = await ans.json();
    showProducts(data);
  } catch(err) {
    console.log(err);
  }
}

const showProducts = (products) => {
  products.forEach(product => {
    templateCard.querySelector('img').setAttribute('src', product.image);
    templateCard.querySelector('.card-title').textContent = product.title;
    templateCard.querySelector('.btn').dataset.id = product.id;
    templateCard.querySelector('img').setAttribute('alt', product.title);
    templateCard.querySelector('.card-text').textContent = `$${product.price}`;

    const clone = templateCard.cloneNode(true);
    fragment.appendChild(clone);
  });

  row.appendChild(fragment);
}

const addProduct = (event) => {
  if(event.target.classList.contains('btn')) {
    const parent = event.target.parentElement;
    setProduct({
      id: event.target.dataset.id,
      title: parent.querySelector('.card-title').textContent,
      price: parent.querySelector('.card-text').textContent,
      quantity: 1,
    });

    manageTotalItems({value: 1});
  }

  event.stopPropagation();
}

const setProduct = (product => {
  if(cart.hasOwnProperty(product.id)) {
    cart[product.id].quantity++;
  } else {
    cart[product.id] = product;
  }
  showCart();
})

const showCart = () => {
  manageHeader();
  offcanvasBody.innerHTML = '';
  if(Object.values(cart).length !=0) {
    Object.values(cart).forEach(product => {
      templateOff.querySelector('.title').textContent = product.title;
      templateOff.querySelector('.quantity').textContent = product.quantity;
      templateOff.querySelector('.price').textContent = `$${(product.price.replace('$', '') * product.quantity).toFixed(2)}`;
      templateOff.querySelector('.btn-primary').dataset.id = product.id;
      templateOff.querySelector('.btn-dark').dataset.id = product.id;
      const clone = templateOff.cloneNode(true);
      fragment.appendChild(clone);
    })
    offcanvasBody.appendChild(fragment);
  } else {
    const noProducts = document.createElement('p');
    const noProductsItalic = document.createElement('i');
    noProducts.appendChild(noProductsItalic);
    noProducts.classList.add('text-center');
    noProductsItalic.textContent = 'No products yet, start shopping now (:';
    offcanvasBody.appendChild(noProducts);
  }
  showFooter();
  localStorage.setItem('cart', JSON.stringify(cart));
}

const showFooter = () => {
  offcanvasFooter.innerHTML = '';
  if(Object.values(cart).length != 0) {
    const products = Object.values(cart).reduce((acc, product) => acc += product.quantity, 0);
    const amount = Object.values(cart).reduce((acc, product) => acc += product.quantity * product.price.replace('$', ''), 0);
    templateFooter.querySelector('.total-products').textContent = products;
    templateFooter.querySelector('.total-amount').textContent = amount.toFixed(2);
    const clone = templateFooter.cloneNode(true);
    fragment.appendChild(clone);
    offcanvasFooter.appendChild(fragment);
  }
}

offcanvasFooter.addEventListener('click', (event) => {
  if(event.target.classList.contains('btn')) {
    cart = {};
    manageTotalItems({type: 'reset'});
    showCart();
  }
});

const manageHeader = () => {
  if(Object.values(cart).length !=0) {
    offcanvasHeaderContent.classList.remove('d-none');
    offcanvasHeader.classList.remove('py-4');
  } else {
    offcanvasHeaderContent.classList.add('d-none');
    offcanvasHeader.classList.add('py-4');
  }
}