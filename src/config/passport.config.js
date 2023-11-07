import passport from "passport";
import GitHubStrategy from "passport-github2";
import local from "passport-local";
import { createHash, isValidPassword } from "../utils.js";
import UserManager from "../controlers/UserManager.js";
import { UserModel } from "../dao/models/user.model.js";

const LocalStrategy = local.Strategy;
const userManager = new UserManager();
const initializePassport = () => {
    passport.use("register", new LocalStrategy(
        { passReqToCallback: true, usernameField: "email" },
        async (req, username, password, done) => {
            const { name, surname, email, role } = req.body;
            try {
                let user = await userManager.findEmail({ email: username });
                if (user) {
                    return done(null, false, { message: "User already exists" });
                }
                const hashedPassword = await createHash(password);

                const newUser = { name, surname, email, password: hashedPassword, role };
                let result = await userManager.addUser(newUser);
                return done(null, result);
            } catch (error) {
                return done("Error getting the user", error);
            }
        }))

    passport.serializeUser((user, done) => {
        console.log(`User del serialize antes de done: ${user}`);
        console.log(`User._id del serialize antes de done: ${user._id}`);
        done(null, user._id);
        console.log(`User del serialize: ${user}`);
        console.log(`User._id del serialize: ${user._id}`);
    })
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await userManager.getUserById(id);
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    })

    passport.use("login", new LocalStrategy({ usernameField: "email" }, async (username, password, done) => {
        try {
            const user = await userManager.findEmail({ email: username });
            console.log(`User del login: ${user}`);
            if (!user) {
                return done(null, false, { message: "User not found" });
            }
            const isValid = await isValidPassword(user, password);
            if (!isValid) {
                return done(null, false, { message: "Wrong password" });
            }
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }))

    passport.use("github", new GitHubStrategy({
        clientID: "Iv1.527e35e978c0413e",
        clientSecret: "17293d094c7fb6bdab825a12492358f8df71da1d",
        callbackURL: "http://localhost:8080/api/users/githubcallback"
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let profileJson = JSON.stringify(profile);
            const email = profile.emails[0].value;
            let name = profile.displayName;
            //console.log(`Profile de github en Json: ${profileJson}`);
            // console.log(`email de github: ${email}`);
            if (email && email.length > 0) {
                let user = await userManager.findEmail({ email: email });
                console.log(`User en passport.use /github: ${user}`);

                if (!user) {
                    console.log("estoy creando el user de github");

                    let newUser = {
                        name: name,
                        email: email,
                        password: "",
                        role: "admin"
                    }
                    console.log(`newUser en passport.use/github: ${newUser}`);
                    let newUserJson = JSON.stringify(newUser);
                    console.log(`newUser en passport.use/github en Json: ${newUserJson}`);

                    let result = await userManager.addUser(newUser);
                    return done(null, result);
                } else {
                    console.log("estoy retornando el user de github");
                    console.log(`User en passport.use/github else: ${user}`);
                    return done(null, user);
                }

            } else {
                return done(null, false, { message: "User not found in GitHub" });
            }
        } catch (error) {
            return done(error);
        }
    }))
}

export default initializePassport;