import mongoose from "mongoose";

const userCollection = "users";

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, max: 100 },
    surname: { type: String, required: false, max: 100 },
    email: { type: String, required: true, max: 100 },
    age: { type: Number, required: false, max: 100 },
    password: { type: String, required: false, max: 100 },
    cart: [
        {
            type: [
                {
                    cart: {
                        type: mongoose.Schema.Types.ObjectId, ref: 'carts'
                    }
                }
            ]
        }
    ],
    role: { type: String, required: true, max: 100 }
})

export const UserModel = mongoose.model(userCollection, UserSchema);