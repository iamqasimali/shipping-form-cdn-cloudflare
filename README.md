## 🚀 Shipping Form CDN

This repository hosts static assets for a shipping form — such as JavaScript, CSS, and other frontend resources — and serves them through **Cloudflare Workers** as a fast and globally distributed **Content Delivery Network (CDN)**.

---

### 🧩 Features

* ⚡ **Ultra-fast CDN delivery** via Cloudflare’s global edge network
* 🗂️ Serves static assets directly from the `/dist` directory
* 🔄 Easy to update — just deploy after editing your files
* 🧱 Zero backend dependencies
* 🌐 Perfect for embedding your scripts or styles in other projects

---

### 📁 Project Structure

```
shipping-form-cdn/
│
├── dist/                   # Folder containing built static files
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── ...
│
├── package.json            # Project info & deployment scripts
├── wrangler.jsonc          # Cloudflare Worker config
└── README.md               # Project documentation
```

---

### ⚙️ Setup Instructions

#### 1. Clone this repository

```bash
git clone https://github.com/iamqasimali/shipping-form-cdn.git
cd shipping-form-cdn
```

#### 2. Install dependencies

```bash
npm install
```

#### 3. (Optional) Build static files

If your files are prebuilt, skip this step.
If you’re using a bundler like **Vite**, run:

```bash
npm run build
```

#### 4. Deploy to Cloudflare

```bash
npx wrangler deploy --assets=./dist
```

or simply:

```bash
npm run deploy
```

---

### 🧾 Example `wrangler.jsonc`

```jsonc
{
  "name": "shipping-form-cdn",
  "compatibility_date": "2025-11-12",
  "assets": {
    "directory": "./dist"
  }
}
```

---

### 🌍 Accessing Your CDN Files

After successful deployment, you’ll get a public URL like:

```
https://shipping-form-cdn.<your-cloudflare-subdomain>.workers.dev
```

You can use your files anywhere:

```html
<script src="https://shipping-form-cdn.workers.dev/script.js"></script>
<link rel="stylesheet" href="https://shipping-form-cdn.workers.dev/style.css">
```

---

### 🧠 Notes

* Make sure all your assets (HTML, JS, CSS, images) are placed inside the `dist/` folder before deploying.
* To update your CDN, just replace files in `dist/` and re-run `npm run deploy`.

---

### 👨‍💻 Author

**Qasim Ali Zahid**
Full Stack Developer — Ruby on Rails | React | Node.js | AWS
🔗 [GitHub: iamqasimali](https://github.com/iamqasimali)
