## Monolith Vs. Microservices Architecture

- Monolith: One backend that does everything

- Microservices: Multiple small backends, each with one responsibility

  Runs independently, has its own server, has its own database logic, can be scaled independently, communicates via HTTP or RabbitMQ

## tsconfig.json

- npm install typescript --save-dev
- npx tsc --init

- Think of tsconfig.json as: "Rules for how TypeScript converts our .ts files into .js files"

- Node.js cannot run TypeScript directly

  src/_.ts ---- (tsc) ----> dist/_.js

- **rootDir** and **outDir**

"rootDir": "./src",
"outDir": "./dist"

What this means -

services/user/
├── src/ ← you write TS here
│ └── index.ts
├── dist/ ← compiled JS goes here
│ └── index.js

Why this is mandatory in real projects: Docker uses `dist`; Production runs JS, not JS

- **"target":"esnext"** vs es2016 vs es2020

  `target` tells TypeScript: Which JavaScript version should i generate?

- **"module":"nodenext"**

This tells TS: We are using ES modules, import/export syntax, Compatible with modern Node.js


## Why install `@types/*` when frameworks are already installed?


"dependencies": {
"express": "^5.2.1",
"mongoose": "^9.0.1",
"dotenv": "^17.2.3"
}

- These packages provide: JavaScript code, NO type information

- TypeScript needs **type definitions**

    That's why we install:

        npm install -D typescript \
        @types/express \
        @types/mongoose \
        @types/dotenv

    Why `-D` (dev dependency)?

        Types are only needed at build time, Not needed in production JS 


**Why not directly install TypeScript versions instead of JS + @types/**

Because there is no separate "Typescript version" of most libraries. 

Reality: express, mongoose, dotenv -> are JS libraries, TypeScript does NOT replace them, TypeScript only adds type information on top 

TypeScript compiles to JavaScript and at runtime Node.js exectes only JS. 


**Why are @types/* installed as -D (devDependencies)**

Because: Types are needed only during development ; After compilation, Node runs pure JS ; Types are not used in production 


## build -> dist -> run (TypeScript)


- server.ts cannot be executed by Node, Node runs compiled JS only. The compiled JS file is inside /dist in typescript environment

- You write TypeScript: `src/server.ts`

    You run: `npm run build`

    TypeScript compiler (`tsc`) converts: 

        src/server.ts -> dist/server.js 


    Then Node runs JavaScript, not TypeScript 

        node dist/server.js 

    Thats why in typescript-node environment, "build first, then run"


## If Node.js cannot run TypeScript, why not just write JavaScript? Why add so much complexity (build, tsc, dist, concurrently) ? 


- TypeScript is not for Node. TypeScript is for YOU (the developer). 

- JavaScript is for runtime. TypeScript is for development safety. 

    The "complexity" exists to catch bugs before your code even runs. 


**What problem TypeScript actually solves (that JS doesn't)**

- JavaScript lets this run without errors: 

    const user = {name: "Aman"} ; 
    console.log(user.age.toUpperCase()) ; 

        This crashes at runtime. In production. After deployment. 

        TypeScript stops this BEFORE running. (erro: Property 'age' does not exist on type...)

            Bug caught early, no production crash


- JS-only problems at scale: wrong payload shape, missing fields, silent runtime crashes 



## TypeScript vs JavaScript 

In JS, no interfaces, no generics, no types. In TS, we are adding a type layer on top of JS. TypeScript doesn't change how code runs, it only adds compile-time safety. 

JS Problems: typos not caught, wrong field names, undefined bugs, refactor breaks silently

    Example: user.emial // typo, no error at runtime 

        user.emial // compile-time error in TS

How companies manage JS problems? 

    They use: ESLint, Strict conventions, Code reviews, Tests, runtime validations (Joi, Zod)


## Are there multiple ways to write Middleware? 


Yes. Middleware logic is the same concept, but implementation differs based on: 

    1. Where token is stored: Cookies & Authorization Header 

    2. Whether we use JS or TS 

Both middlewares are correct, just designed for different auth strategies. 

- token comes from cookies (req.cookies.token) Vs. token comes from headers (Authorization: Bearer <token>)


## Why does the token sometimes come from cookies and sometimes from Authorization header? 

Both are valid ways to send JWTs. 

1. JWT in Cookies (req.cookies.token)

    Server creates JWT after login. Server sends it as a cookie. Browser automatically sends the cookie on every request 

2. JWT in Authorization Header (Bearer token)

    Server returns JWT in response body. Client stores it (memory/localStorage). Client manually sends it in headers 


There are 2 valid and commonly used ways to send JWTs from client -> server. 


## Stateless Vs. Stateful Backend 


- Stateless backend (JWT - What you are building)

    The server does NOT remember you between requests. Every request must bring proof of identity. 

    That proof = JWT 

        ```
        Client -> sends JWT on every request 
        Server -> verifies JWT -> trusts user 
        Server -> forgets everything after response 
        ```

    Where is user info stored? Inside the JWT, on the client side. 

    Advantages: scales well (Microservices), any service can verify token 


- Stateful backend (Cookies + Sessions)

    Server remembers user session in memory / DB. 

        Client -> sends cookie
        Server -> looks up session 

    Problems: hard to scale, sessions must be shared, bad for microservices


## Cloudinary receive image buffer 


- When we upload an image from a client (browser/mobile/Postman), the image is NOT immediately a file on our server. 

Instead, it becomes as binary data on memory -> this is called buffer. 

    A buffer = raw bytes of the image stored in RAM 

Cloudinary doesn't require a physical file (.jpg on disk). It can upload directly from memory (buffer). 


    Client -> Upload File -> Stored in memory (buffer) -> Sent to Cloudinary 


**How image reaches backend as buffer?**

In Express, this is handled by multer. 

    import multer from "multer";

    // Store uploaded file in memory (buffer)
    
    const storage = multer.memoryStorage();

    // Middleware to handle file upload
    
    export const upload = multer({ storage });


Uploaded image is available at `req.file`. Binary data is at `req.file.buffer`

This `buffer` is what Cloudinary consumes. 


- The text data -> goes into `req.body`. But real images are: binary data, large, NOT JSON. So browsers & API send images as multipart/form-data, not JSON.

That means: req.body (not for files), req.file/req.files (for files)

**What Multer actually does**

Multer = middleware that reads file from request. 

Without Multer: 

    - Express cannot read files, 
    - req.file is `undefined` 

With Multer: 

    - Multer intercepts the request 
    - Extracts file data 
    - Converts it into a buffer 

    This "buffer" is raw image data in memory 


**Why DataURI (npm i datauri) is used?**


- A Data URI looks like this: data:image/png;base64,AAAAFGZ0eXBwbmcAA...

- It contains: MIME type (image/png) ; Encoding (base64) ; Actual image content 

    Cloudinary accepts this directly 

- DataURI converts buffer -> base64 string 

We want to accept an image file from client(profile pic, blog image, etc). Upload it to Cloudinary. Cloudinary does NOT accept multipart/form-data directly. It accepts: 

    - a file path, OR 
    - a Buffer / Base64 / Data URI 

Here, we are doing: 

- multer (memory) -> buffer -> Data URI -> Cloudinary 


- multer: how file enters our backend 


## PostgreSQL 


It's a relational (SQL) database. 

- Key Characteristics: Uses tables, rows, columns ; Uses SQL language ; Enforces schemas (fixed structure) ; Strong ACID guarantees (data consistency) 

- NeonDB is NOT a database type. NeonDB is a managed cloud service that provides PostgreSQL. 

    PostgreSQL = database engine 
    NeonDB = cloud platform that hosts PostgreSQL for you 

    MongoDB (database engine) <-> MongoDB Atlas (managed service) 

    PostgreSQL (database engine) <-> NeonDB (managed service)


## DB Migrations 