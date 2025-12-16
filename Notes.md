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