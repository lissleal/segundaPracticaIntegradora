import express, { json } from "express";
import ProductManager from "../controlers/ProductManager.js";
import cartModel from "../controlers/CartManager.js";
import UserManager from "../controlers/UserManager.js";

const ViewsRouter = express.Router()
const product = new ProductManager()
const cart = new cartModel()
const user = new UserManager()

//Rutas GET para la página de inicio y detalles del producto:

ViewsRouter.get("/inicio", async (req, res) => {
    res.render("inicio", {
        title: "App de compras",
    })
})

ViewsRouter.get("/products", async (req, res) => {
    if (!req.session.email) {
        res.redirect("/login")
    }

    let allProducts = await product.getProducts()
    allProducts = allProducts.map(product => product.toJSON())
    const userData = {
        name: req.session.name,
        surname: req.session.surname,
        email: req.session.email,
        role: req.session.role
    }

    res.render("home", {
        title: "Segunda Pre Entrega",
        products: allProducts,
        user: userData

    })
})


ViewsRouter.get("/products/:id", async (req, res) => {

    let productId = req.params.id
    let prod = await product.getProductById(productId)

    const productDetail = prod.toObject();

    res.render("prod", {
        title: "Detalle de Producto",
        product: productDetail
    })
})

ViewsRouter.get("/carts/:cid", async (req, res) => {
    let cartId = req.params.cid
    let products = await cart.getProductsInCart(cartId)
    let productObjet = products.toObject()
    res.render("carts", {
        title: "Carrito",
        cart: productObjet
    })
})

ViewsRouter.get("/register", (req, res) => {
    res.render("register", {
        title: "Registro de Usuario"
    })
})

ViewsRouter.get("/login", (req, res) => {
    res.render("login", {
        title: "Login de Usuario"
    })
})

ViewsRouter.get("/profile", async (req, res) => {
    try {
        let userJson = JSON.stringify(req.session.user)
        let user = req.session.user
        let email = user.email

        if (!user || !user.email) {
            res.redirect("/login")
        }
        const userData = {
            email: user.email,
            role: user.role,
        }

        res.render("profile", {
            title: "Perfil de Usuario",
            user: userData
        })
    }
    catch (error) {
        console.error("Error en la ruta /profile:", error);
        res.status(500).json(error);
    }
})

ViewsRouter.get("/current", async (req, res) => {
    try {
        let user = req.session.user

        if (!user) {
            res.redirect("/login")
        }
        const userData = {
            name: user.name,
            surname: user.surname,
            age: user.age,
            email: user.email,
            role: user.role
        }

        res.render("current", {
            title: "Perfil de Usuario",
            user: userData
        })
    }
    catch (error) {
        console.error("Error en la ruta /current:", error);
        res.status(500).json(error);
    }
})

export default ViewsRouter