import UserManager from "../controlers/UserManager.js";
import { Router } from "express";
import passport from "passport";

const UserRouter = Router()
const user = new UserManager()

UserRouter.post("/register", passport.authenticate("register", { failureRedirect: "/failregister" }), async (req, res) => {
    try {
        const { name, surname, email, password, role } = req.body
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

        if (user.role === "admin") {
            req.session.email = user.email
            req.session.role = user.role
            req.session.name = user.name
            req.session.surname = user.surname
            req.session.age = user.age;
            req.session.user = user;
            res.redirect("/profile")

        } else {
            req.session.email = user.email
            req.session.role = user.role
            req.session.name = user.name
            req.session.surname = user.surname
            req.session.age = user.age;
            req.session.user = user;
            res.redirect("/products")
        }
        console.log("Session established:", req.session.user);


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

UserRouter.get("/github", passport.authenticate("github", { scope: ["user: email"] }), async (req, res) => {
    console.log("Redirecting to GitHub for authentication...")
})

UserRouter.get("/githubcallback", passport.authenticate("github", { failureRedirect: "/login" }), async (req, res) => {
    try {
        req.session.user = req.user;
        req.session.email = req.user.email;
        req.session.role = req.user.role;

        res.redirect("/profile");
    } catch (error) {
        res.status(500).json("Error during GitHub authentication");
    }
})


export default UserRouter