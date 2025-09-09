// === MENU ===
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btnHamburger");
  const menu = document.getElementById("navbar-hamburger");

  if (btn && menu) {
    btn.addEventListener("click", () => menu.classList.toggle("hidden"));
    document.addEventListener("click", (e) => {
      if (!menu.contains(e.target) && !btn.contains(e.target)) {
        menu.classList.add("hidden");
      }
    });
  }
});

// === FETCH PRODUCTS (HOME PAGE) ===
document.addEventListener("DOMContentLoaded", () => {
  const productGrid = document.getElementById("product-grid");

  if (productGrid) {
    fetch("https://fakestoreapi.com/products")
      .then(res => res.json())
      .then(products => {
        productGrid.innerHTML = "";

        products.slice(0, 8).forEach(product => {
          const card = document.createElement("div");
          card.className = "cursor-pointer bg-[#D9D9D9] border rounded-lg shadow-sm p-4 hover:shadow-md transition flex flex-col";

          card.innerHTML = `
            <img src="${product.image}" alt="${product.title}" class="h-32 object-contain mb-2">
            <h3 class="text-sm font-semibold line-clamp-2">${product.title}</h3>
            <p class="text-xs text-black mt-auto">Rp ${(product.price * 15000).toLocaleString("id-ID")}</p>
          `;

          card.addEventListener("click", () => {
            window.location.href = `DetailProduct.html?id=${product.id}`;
          });

          productGrid.appendChild(card);
        });
      })
      .catch(err => {
        console.error("Fetch products failed:", err);
        productGrid.innerHTML = `<div class="col-span-full text-center text-red-500 py-4">Gagal memuat produk.</div>`;
      });
  }
});

// === DETAIL PRODUCT ===
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  if (productId) {
    fetch(`https://fakestoreapi.com/products/${productId}`)
      .then(res => res.json())
      .then(product => {
        const title = document.querySelector("h1");
        const desc = document.querySelector("p");
        const img = document.querySelector("img");
        const price = document.getElementById("price");
        const total = document.getElementById("estimated-total");

        if (title && desc && img && price && total) {
          title.innerText = product.title;
          desc.innerText = product.description;
          img.src = product.image;
          price.innerText = `IDR ${(product.price * 15000).toLocaleString("id-ID")}`;
          total.innerText = `IDR ${(product.price * 15000).toLocaleString("id-ID")}`;

          window.currentProduct = {
            id: product.id,
            title: product.title,
            price: product.price * 15000,
            image: product.image,
            size: "M", // default size (nanti bisa pakai input)
            quantity: 1
          };
        }
      });
  }

  const addToCartBtn = document.querySelector("button.w-full.bg-gray-300");

  if (addToCartBtn && productId) {
    addToCartBtn.addEventListener("click", () => {
      const quantity = parseInt(document.getElementById("quantity")?.innerText || 1);
      const size = "M"; // default, bisa ambil dari input user nanti

      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const index = cart.findIndex(item => item.id === window.currentProduct.id && item.size === size);

      const productObj = {
        id: window.currentProduct.id,
        name: window.currentProduct.title,
        price: window.currentProduct.price,
        size: size,
        image: window.currentProduct.image,
        quantity: quantity
      };

      if (index >= 0) {
        cart[index].quantity += quantity;
      } else {
        cart.push(productObj);
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      window.location.href = "Cart.html";
    });
  }
});

// === QUANTITY UPDATE ===
function updateQuantity(change) {
  const quantityEl = document.getElementById("quantity");
  if (!quantityEl) return;

  let qty = parseInt(quantityEl.innerText);
  qty = Math.max(1, qty + change);
  quantityEl.innerText = qty;

  const priceEl = document.getElementById("price");
  const totalEl = document.getElementById("estimated-total");

  if (priceEl && totalEl) {
    const price = parseInt(priceEl.innerText.replace(/\D/g, ""));
    totalEl.innerText = `IDR ${(qty * price).toLocaleString("id-ID")}`;
  }
}
window.updateQuantity = updateQuantity;

// === CART ===
document.addEventListener("DOMContentLoaded", () => {
  const productList = document.querySelector(".md\\:col-span-2");
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (productList && productList.innerHTML.includes("Black Long sleeve")) {
    productList.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
      total += item.price * item.quantity;

      const itemEl = document.createElement("div");
      itemEl.className = "flex flex-col md:flex-row gap-4 items-start md:items-center";

      itemEl.innerHTML = `
        <img src="${item.image}" class="w-32 border-2 border-[#D9D9D9]" />
        <div>
          <h3 class="font-medium">${item.name}</h3>
          <p class="text-sm text-gray-600">Qty: ${item.quantity}</p>
          <p class="text-sm text-gray-600">Size: ${item.size}</p>
          <button class="text-sm text-black mt-2 hover:underline" onclick="removeFromCart(${item.id})">REMOVE</button>
        </div>
      `;

      productList.appendChild(itemEl);
    });

    document.getElementById("total").innerText = `IDR ${total.toLocaleString("id-ID")}`;
    document.getElementById("estimated-total").innerText = `IDR ${total.toLocaleString("id-ID")}`;
  }
});
function removeFromCart(id) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const newCart = cart.filter(item => item.id !== id);
  localStorage.setItem("cart", JSON.stringify(newCart));
  location.reload();
}
window.removeFromCart = removeFromCart;

// === CHECK OUT ===
document.addEventListener("DOMContentLoaded", () => {
  const checkoutBtn = document.getElementById("btnCheckout");

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));

      if (!currentUser) {
        alert("Silakan login terlebih dahulu.");
        window.location.href = "SignIn.html";
        return;
      }

      if (cart.length === 0) {
        alert("Cart kosong, silakan tambahkan produk.");
        return;
      }

      // Simpan order ke orderHistory_{email}
      const historyKey = `orderHistory_${currentUser.email}`;
      let history = JSON.parse(localStorage.getItem(historyKey)) || [];
      history.push({
        date: new Date().toLocaleString(),
        items: cart
      });
      localStorage.setItem(historyKey, JSON.stringify(history));

      // Clear cart
      localStorage.removeItem("cart");

      alert("Pesanan berhasil! Order history sudah disimpan.");
      window.location.href = "Profile.html";
    });
  }
});



// === SIGN UP ===
document.addEventListener("DOMContentLoaded", () => {
  const signUp = document.getElementById("firstName");
  if (!signUp) return;

  const form = document.querySelector("form");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    let users = JSON.parse(localStorage.getItem("users")) || [];
    if (users.some(u => u.email === email)) {
      alert("Email sudah terdaftar.");
      return;
    }

    users.push({ firstName, lastName, email, password });
    localStorage.setItem("users", JSON.stringify(users));

    alert("Akun berhasil dibuat! Silakan login.");
    window.location.href = "SignIn.html";
  });
});

// === SIGN IN ===
  document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector("form input[name='email']") && document.querySelector("form input[name='password']");
  const signUpCheck = document.getElementById("firstName");

  if (loginForm && !signUpCheck) {
    const form = document.querySelector("form");
    form?.addEventListener("submit", (e) => {
      e.preventDefault();

      const email = form.querySelector("input[name='email']").value.trim();
      const password = form.querySelector("input[name='password']").value.trim();
      const users = JSON.parse(localStorage.getItem("users")) || [];

      const user = users.find(u => u.email === email && u.password === password);
      if (!user) {
        alert("Email atau password salah.");
        return;
      }

      localStorage.setItem("currentUser", JSON.stringify(user));
      alert(`Selamat datang, ${user.firstName}`);
      window.location.href = "HomePage.html";
    });
  }
});

// === PROFILE PAGE ===
document.addEventListener("DOMContentLoaded", () => {
  const profileInfo = document.getElementById("profile-info");
  const orderHistory = document.getElementById("order-history");

  if (profileInfo && orderHistory) {
    const user = JSON.parse(localStorage.getItem("currentUser"));

    if (!user) {
      alert("Silakan login terlebih dahulu.");
      window.location.href = "SignIn.html";
      return;
    }

    // TAMPIL PROFILE INFO
    profileInfo.innerHTML = `
      <p><strong>First Name:</strong> ${user.firstName}</p>
      <p><strong>Last Name:</strong> ${user.lastName}</p>
      <p><strong>Email:</strong> ${user.email}</p>
    `;

    // BACA HISTORY DARI LOCALSTORAGE PER USER
    const historyKey = `orderHistory_${user.email}`;
    const history = JSON.parse(localStorage.getItem(historyKey)) || [];

    // TAMPIL ORDER HISTORY
    if (history.length === 0) {
      orderHistory.innerHTML = `<p>YOU HAVEN'T PLACE ANY ORDERS YET</p>`;
    } else {
      history.forEach(order => {
        const div = document.createElement("div");
        div.className = "border p-4 rounded bg-white shadow";
        div.innerHTML = `
          <p class="mb-2 text-gray-700"><strong>Date:</strong> ${order.date}</p>
          ${order.items.map(item => `
            <div class="flex justify-between border-b py-1">
              <span>${item.name} (Size: ${item.size}) x${item.quantity}</span>
              <span>IDR ${(item.price * item.quantity).toLocaleString('id-ID')}</span>
            </div>
          `).join("")}
        `;
        orderHistory.appendChild(div);
      });
    }

    // SIGN OUT
    const signOutBtn = document.getElementById("btnSignOut");
    if (signOutBtn) {
      signOutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("currentUser");
        alert("Anda berhasil logout.");
        window.location.href = "SignIn.html";
      });
    }
  }
});

