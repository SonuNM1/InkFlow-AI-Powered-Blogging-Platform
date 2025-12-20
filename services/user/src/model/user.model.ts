/*
Document: TypeScript type for a MongoDB document

Schema: TypeScript-aware schema type These imports do not exist at runtime (they're erased after build)
*/

import mongoose, {Document, Schema} from "mongoose";

// interface - describes what a User document should look like. It is removed when tsc builds to JS 

export interface IUser extends Document {
    name: string, 
    email: string, 
    image: string,
    instagram: string, 
    facebook: string, 
    linkedin: string, 
    bio: string 
}

// Typed Schema - This schema must match the "IUser" interface. If you forget a field or misuse a type -> TS error. In JS, we would only find mistakes at runtime. Or worse -> in production 

// passwordless authentication - continue with google (OAuth)

const userSchema: Schema <IUser> = new Schema({
    name: {
        type: String, 
        required: true 
    },
    email: {
        type: String, 
        required: true,
        unique: true 
    }, 
    image: {
        type: String, 
        required: true
    }, 
    instagram: String, 
    facebook: String, 
    linkedin: String, 
    bio: String
}, {
    timestamps: true 
}) ; 

const User = mongoose.model<IUser>("User", userSchema) ; 

export default User ; 


/*
In JS, no interfaces, no generics, no types. In TS, we are adding a type layer on top of JS. TypeScript doesn't change how code runs, it only adds compile-time safety. 

JS Problems: typos not caught, wrong field names, undefined bugs, refactor breaks silently

    Example: user.emial // typo, no error at runtime 

        user.emial // compile-time error in TS

How companies manage JS problems? 

    They use: ESLint, Strict conventions, Code reviews, Tests, runtime validations (Joi, Zod)

*/