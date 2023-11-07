import UserManager from "../controlers/UserManager.js";
import { Router } from "express";
import passport from "passport";

const UserRouter = Router()
const user = new UserManager()

UserRouter.post("/register", passport.authenticate("register", { failureRedirect: "/failregister" }), async (req, res) => {
    try {
        const { name, surname, email, password, role } = req.body
        console.log(name + surname + email + password + role);
        if (!name || !surname || !email || !password || !role) {
            res.status(400).send("Faltan datos")
        }
        res.redirect("/login")
    } catch (error) {
        res.status(500).send("Error al acceder al registrar: " + error.message);

    }
})

UserRouter.get("/failregister", async (req, res) => {
    console.log("Failed Strategy")
    res.send({ error: "Failed" })
})

UserRouter.post("/login", passport.authenticate("login", { failureRedirect: "/faillogin" }), async (req, res) => {
    try {
        let user = req.user

        console.log(`el user del post login: ${user}`);

        if (user.role === "admin") {
            req.session.email = user.email
            req.session.role = user.role
            req.session.name = user.name
            req.session.surname = user.surname
            res.redirect("/profile")

        } else {
            req.session.email = user.email
            req.session.role = user.role
            req.session.name = user.name
            req.session.surname = user.surname
            res.redirect("/products")
        }

        if (!user) {
            res.status(400).send("Wrong credentials")
        }

    } catch (error) {
        res.status(500).json("Usuario o contraseña incorrectos")
    }
})

UserRouter.get("/faillogin", async (req, res) => {
    res.send({ error: "Failed Login" })
})

UserRouter.get("/logout", async (req, res) => {
    try {
        req.session.destroy()
        res.redirect("/login")
    } catch (error) {
        res.status(500).json(error)
    }
})

UserRouter.get("/github", passport.authenticate("github", { scope: ["user: email"] }), async (req, res) => { })

UserRouter.get("/githubcallback", passport.authenticate("github", { failureRedirect: "/login" }), async (req, res) => {
    req.session.user = req.user
    res.redirect("/profile")
})


export default UserRouter