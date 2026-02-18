const express = require("express");
const fs = require("fs/promises");
const path = require("path");

const app = express();
const PORT = 8080;

app.use(express.json());

const productsPath = path.join(__dirname, "data", "products.json");

async function readProducts() {
  try {
    const data = await fs.readFile(productsPath, "utf-8");
    return JSON.parse(data || "[]");
  } catch (err) {
    // si no existe el archivo, lo crea vacío
    if (err.code === "ENOENT") {
      await fs.mkdir(path.join(__dirname, "data"), { recursive: true });
      await fs.writeFile(productsPath, "[]");
      return [];
    }
    throw err;
  }
}

async function writeProducts(products) {
  await fs.writeFile(productsPath, JSON.stringify(products, null, 2));
}

function generateId(products) {
  const maxId = products.reduce((max, p) => Math.max(max, Number(p.id) || 0), 0);
  return maxId + 1;
}

// GET /api/products -> lista todos
app.get("/api/products", async (req, res) => {
  try {
    const products = await readProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products -> agrega y guarda
app.post("/api/products", async (req, res) => {
  try {
    const products = await readProducts();

    // id NO viene en el body
    const newProduct = {
      id: generateId(products),
      ...req.body,
    };

    products.push(newProduct);
    await writeProducts(products);

    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Servidor Express funcionando 🚀");
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
