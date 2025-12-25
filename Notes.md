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


## Microservices 


Microservices are an architecture decision, not a folder structure. Different folders is only how we organize code locally. 

- This project is not fully microservices, yet. This is called: Monorepo with multiple services. 


**What actually makes something a Microservice**


A service is a microservice if it has ALL of these properties: 

1. Independent Deployment 

    - Blog service can be deployed without touching User service 

    - User service can be restarted without affecting Blog 

If everything is deployed together -> not microservice 

2. Independent Database 

    - User: MongoDB
    - Blog: PostgreSQL
    - Author: PostgreSQL 

We are already doing this 

3. Clean responsibility (Single Responsibility Principle)

Each service does ONE JOB. 

| Service | Responsibility           |
| ------- | ------------------------ |
| User    | Auth, login, profile     |
| Blog    | Blog CRUD                |
| Author  | Author stats / ownership |
| Comment | Comments                 |
| Media   | Image uploads            |

If a service does too many things -> not microservice. 


4. Communicate ONLY via APIs (HTTP/events)

- Blog service should NOT import User model 

- Blog service should NOT query MongoDB of User service 

Blog service should: Trust JWT, Or call User service via HTTP, Or consume events 

5. Owned by different teams 

Each team: 

    - Has their own repo OR own folder 
    - Own CI/CD 
    - Own deployment 


**Microservice is:**

- Separate responsibility 
- Separate DB 
- Separate deployment 
- Communicates via API
- Can be owned by separate teams 

Folders are just how we simulate this locally. 



## Search Relevance 


- Literal search matching (Blog 2 not equals blog2): The space matters, DB doesn't "guess" intent 

When a user searches, companies do NOT rely on raw SQL LIKE alone. 

    They apply `Normalization + Relevance` logic

1. Normalize user input

- lowercase, remove spaces, remove special characters 

2. Normalize stored data

- do the same normalization on DB fields 

3. Compare normalized values


- how large companies implement search, search architecture backend systems, full text search Vs. elastic-search, fuzzy search backend implemtation, search service microservice architecture, database indpendent search architecture, 



## WHAT you should know at 1.8 YoE


- Core: REST APIs, JWT Auth, Role-based access, Pagination, Search & Filters, File Uploads, Background Jobs, Middleware, File upload, Search, Authorization 

- Databases: MongoDB Schema design, SQL Joins, Indexing, Transactions, Migration concepts, Indexing, Partioning, Sharding 

- Architecture: Monolith vs Microservices, API Gateway, Service-to-service auth, Env configs, Loggin & error handling, Reverse proxy (NGINX), PM2

- Cloud Basics: Docker basics, Env vars, Cloudinary / S3, CI/CD 



## Redis 


We do: Request -> Redis (cache) -> if found (response in milliseconds). 

    If not found in Redis, then: fetch from DB, store result in Redis, return response 


**What is Upstash?**

Upstash = Managed Redis (cloud). You can think of it as: 

    - MongoDB Atlas, but for Redis
    - NeonDB, but for Redis
    - Cloudinary, but for caching 

Why people use Upstash: No Redis server setup, Serverless-friendly, Pay per request, Works well with Vercel / serverless / microservices  

**Redis Vs Upstash**

- Redis: technology, in-memory database, open-source, we host it, stateful 

- Upstash: service, Cloud provider, managed, they host it, serverless-friendly 

So, Upstash is Redis, hosted for you. 



## Cache Invalidation 

When data changes, cache must be cleared. 

Example: 

    Blog updated -> delete "blog:5"
    New Blog -> delete "blogs:all"

This is why Redis is powerful but must be used carefully.

    If cache exists:
        return cache 
    ELSE:
        fetch from DB
        store in Redis with TTL
        return result 


- Redis itself (baseline): Redis is just a data store (in-mmemory key-value DB). 

- redis, ioredis, redis-stack: these are clients/distributions, not Redis itself. 

    All of these require you to run Redis somewhere: Local machine, EC2, Docker, Kubernetes 

- So, why NOT using **ioredis** here

    Because our architecture has changed. We are now building: 

        Microservices, Possibly serverless, Multiple services 

    **ioredis** breaks or becomes inefficient in serverless. 



**Enter Upstash**


Upstash = Managed Redis designed for serverless 

What Upstash gives us: 

    - Redis over HTTP 
    - No TCP connection 
    - No connection pooling 
    - Pay per request 
    - Scales automatically 
    - Works perfectly with: Microservices, Serverless


- Why use Upstash: 

    No Redis setup, No Docker, No EC2, No infra headache 

- When SHOULD you use Upstash: 

    Microservices, Serverless
    
    Wanting fast caching without infra pain

    Upstash lets use focus on architecture, not ops 


**Mental Model**

- Redis is the database 

- ioredis is a driver 

- Upstash is Redis + Hosting + serverless adapter 


## Redis ≠ Redis Server Hosting 


Redis is just a database engine. To use Redis, we need a Redis server running somewhere. 

There are 3 ways to get that server: 

| Option      | Who manages server? | How you connect          |
| ----------- | ------------------- | ------------------------ |
| Local Redis | You                 | `redis://localhost:6379` |
| Redis Cloud | Redis Inc           | TCP socket               |
| Upstash     | Upstash             | **HTTP API**             |


This difference is the key. 


## Why NOT redis / ioredis


- Traditional Redis clients (redis, ioredis)

    They require: a long-lived TCP connection, A running Redis server, Keep-alive connections 

    This works great when: We have VMs/EC2, we control the infra


- What Upstash does differently 

Upstash Redis = Redis over HTTP 

Instead of TCP: redis.get("blogs")

Upstash does: 

    POST https://your-upstash-url
    Authorization: Bearer <token>
    { "command": ["GET", "blogs"] }


- Redis is just a database engine. To use Redis, we need a Redis server running somewhere. 

    Redis itself is NOT a cloud service. It is just software. 

    So, we always need ONE of these: 

    1. Self-hosted Redis 

        You install Redis on: your local machine, an EC2 VM, a Docker container 

    2. Managed Redis 

        Someone else runs Redis for you. 

        Examples: Upstash, Redis Cloud, AWS ElastiCache 


    Upstash = Managed Redis 


## When I wasn't using Upstash in some projects, how was Redis runnin there? 


- Case A - Local Redis (redis-server)

    or via Docker, `docker run redis`

   That Redis was: running on your machine, wiped when system restarted, NOT production-ready 

- Case B - Redis already running on a server 

    Your company/project already had: 

        Redis on EC2 
        Redis inside Docker compose 
        Redis inside Kubernetes 

    So you were not managing infra, someone else was. 


- Upstash does NOT replace `ioredis`. Upstash replaces running Redis yourself. 


## Why Upstash is popular 


- Serverless friendly 

- Works perfectly with: Vercel, Cloudfare, Netlify 

- No long-lived TCP connection required (REST API supported)

- No DevOps headache. You do NOT manage: Redis crashes, memory tuning, backups, replication, scaling

- Global + low latency: edge locations, Closest region auto-used 


## Eviction in Redis 


Redis stores everything in RAM. RAM is finite. So what happens when RAM is full? 

    Eviction = Redis deletes old keys automatically 

When eviction is enabled: 

    - Redis removes least-important data
    - You app keeps working 
    - Cache stays fresh 


## Cache Invalidation Problem 


Whenever data changes -> delete related cache 
 
So after: create blog, update blog, delete blog 

    We clear the cache key

Next request will: Miss cache, Fetch fresh DB data, Rebuild cache 

- How to keep cache data in sync with the database? Cache Invalidation, Stale Cache, Data Consistency Problem 

- Caching is easy. Invalidating cache correctly is hard. 


1. Invalidate Cache on Write 

    When data changes, we must clear or update cache. 

    LOGIC: When a blog is created / updated / deleted. Remove `blogs:all` from Redis. Next GET will fetch fresh data from DB. 

    This is called Write-through cache invalidation. 



## RabbitMQ (Message Broker)


One service sends a message. Another service receives and processes it. They do not talk directly. 

    This is called Asynchronous Communication. 


**Why use RabbitMQ for Cache Invalidation?**

In large systems. You might have: 
    
    Blog service, 
    Search service, 
    Recommendation service, 
    Cache service. 
    
    All of them may cache blog data. 

When a blog is created: 

    - You don't want to manually call each service 
    - You send one message 
    - All listeners react independently 


**RabbitMQ Flow**

    Create Blog
    ↓
    Publish event: "BLOG_CREATED"
    ↓
    RabbitMQ
    ↓
    Cache Service receives event → invalidates cache
    Search Service receives event → re-indexes blog
    Notification Service → sends notification

    This is called: Event-driven architecture 


- RabbitMQ is not a database, cache or for faster responses. It's a Message Broker. 

    RabbitMQ helps services talk to each other asynchronously without being tightly coupled. 


- Without RabbitMQ (direct calls)


    Blog service -> calls -> Cache Service 

    Blog Service -> calls -> Email Service 

    Blog Service -> calls -> Notification Service 

If one service slows down, our whole request suffers 


- With RabbitMQ (event based)


Blog Service: "Hey, a blog was created". 

    RabbitMQ stores this message. 

Other Services: 

    - Cache Service: "Oh, I should cleaer cache" 

    - Email Service: "Send email" 

    - Analytics Service: "Track event" 

Blog Service does NOT care who listens. Other service process when they can.

    This is called event-driven architecture. 


## What RabbitMQ actually is (technical)


RabbitMQ is a queue-based message broker. 

    Producer -> Exchange -> Queue -> Consumer 

Producer: sends message (your API)
Exchange: routes message 
Queue: stores message 
Consumer: processes message 

Messages are: Lightweight, Temporary, One-time processing (not stored forever)



## Cache Invalidation Problem 


1. When blog is created: 

    - Insert blog into DB 
    - Delete cache key: blogs:all
    - Next GET fetches fresh DB data 

2. When traffic grows 

You may have: multiple cache keys, multiple services, Multiple consumers 

    Now we need event-based invalidation. This is where RabbitMQ comes. 


**How RabbitMQ fits INTO cache invalidation**


Instead of this: await redis.del("blogs:all");

We do this:  publish("BLOG_CREATED", { blogId })

Then: 

    - Cache service listens -> clears cache 
    - Search service listens -> reindex
    - Notification service listens -> notify users 

RabbitMQ is used for broadcasting events, not caching itself. 


**Real-World RabbitMQ use cases**

- eCommerce: 

    Order created -> Payment -> Invoice -> Email 

- Social Media: 

    Post created -> feed update -> notification -> analytics 

- SaaS: 

    User signup -> verification -> CRM -> analytics 

- Video processing: 

    Upload -> encode -> thumbail -> notify 



## What is RabbitMQ 


- RabbitMQ is a message broker - like a post office that lets microservices talk to each other asynchronously. 

- Messages go into queues and are consumed by services when they are ready. 

    [Author Service] -- (message) --> (RabbitMQ Queue) -- (message) --> [Blog Service]

- Imagine you place a food order (message) at a restaurant (RabbitMQ). 

    The chef (consumer service) will cook it when he's ready - that's decoupling in action. 


## Why RabbitMQ-baed Cache Invalidation is Better than Direct Cache Invalidation 


### Direct-Cache Validation

Imagine this flow: 

- A user creates or updates a blog. 

- In your controller (createBlog), you directly delete the cache key from Redis: 

- So next time someone hits /getAllBlogs, 

    it's a cache miss -> query goes to DB -> response is stored in Redis again. 


**The Problem with the Direct Approach:** 


It might seem fine in small apps, but it becomes inefficient and even risky in microservice. Here's why:

1. Tight Coupling: Your controller now has two responsibilities: saving to DB and managing Redis cache 

    If tomorrow you switch to some other cache (e.g., blog:id), you'll need to change multiple services. 

    This goes against the SRP (Single Responsibility Principle)


2. Every Service must know cache keys 

3. No Revalidation logic: You just delete the cache and expect the next user request to repopulate it. 

    This means one unlucky user always hits the DB and suffers a slow response. 


### RabbitMQ-Based Cache Invalidation is way better 


Here's how it works: 

1. createBlog() only publishes a message: 

    publishToQueue(
        "cache-invalidation",
        {
            keys: ["allBlogs"],
            revalidate: true 
        }
    )

2. It deletes the key and optionally repopulates the cache from the DB immediately. 

**Advantages**

1. Decoupled Logic: Your core service only focuses on DB writes. Cache handling is managed separately, in a specialized service. 

2. Revalidation = Fast Next Requests 

    The moment cache is invalidated, we can instantly fetch fresh data from DB and re-store in Redis. So the next user doesn't hit the DB - they hit the updated cache. 

3. Less load on DB: In direction invalidation, DB gets hit every time cache is deleted (and especially under high traffic). One-time fetch by the consumer service

    All subsequent users hit Redis - saving MongoDB from repeated hits

4. Reliable and Scalable

    If Redis is down, RabbitMQ holds the message. If you scale to 10 microservices tomorrow, all can listen to the same RabbitMQ queue without rewriting code. 


**What RabbitMQ actually is**


RabbitMQ = Message Broker. It sits between services and passes messages quickly. 

Instead of: 
    
    Service A -> calls Service B directly 

We do: 

    Service A -> RabbitMQ -> Service B

This means: 

    - Services don't depend on each other directly 

    - Services don't need to be alive at the same time 

    - Work can be async 

    - System becomes scalable + fault tolerant 


**Why REST calls are not enough in real systems**


Right now we are doing this: 

    Blog Service
        └─ creates blog
                └─ clears Redis cache


This is tight coupling. Problems: 

- If Redis is down -> blog creation fails 

- If later you add more services -> more calls 

- Blog service becomes heavy 


**RabbitMQ mental model**


RabbitMQ has 4 core concepts: 

    Producer -> Exchange -> Queue -> Consumer 

Example: 

    Blog Service (Producer)
        |
        | sends message: "BLOG_CREATED"
        |
        v
    RabbitMQ Exchange 
        |
        |
        v
    Cache Service Queue -> Cache Worker (Consumer)


**Where RabbitMQ is really used in companies**

1. Background Jobs: Send email, Generate PDF, Resize images, Notifications 

2. Event-driven systems: 

    User registered -> send welcome email 

    Order placed -> Inventory update 

    Blog Created -> Cache Invalidation 

3. Microservices Communication

    Service A emits event, Service B reacts, No direct coupling 



- RabbitMQ is not a JavaScript library. It's a standalone server application, just like MongoDB, Redis, PostgreSQL. 


## RabbitMQ Setup


- `docker pull rabbitmq`

- docker run -d --hostname rabbitmq-host --name rabbitmq-container -e RABBITMQ_DEFAULT_USER=admin -e RABBITMQ_DEFAULT_PASS=admin123 -p 5672:5672 -p 15672:15672 rabbitmq:3-management

    docker run: create and start a container from an image 

    -d: detached mode. Runs RabbitMQ in the background. Without -d, our terminal would be stuck showing logs 

    --hostname rabbitmq-host: Sets the internal hostname inside the container

    --name rabbitmq-container: Gives the container a human-readable name 

    environment variable: -e RABBITMQ_DEFAULT_USER=admin, -e RABBITMQ_DEFAULT_PASS=admin123

        With this, we can connect to our Node.js app. We can login to dashboard. 

    Port mappings: -p 5672:5672 (AMQP port), -p 15672:15672 (RabbitMQ Management UI) -> Login with username:admin, password:admin123

        This is why rabbitmq:3-management is used 


- npm i amqplib 

    Node.js library used to communicate to RabbitMQ. It allows our Node.js app to: send and receive messages from RabbitMQ. 

    amqplib = the bridge between Node.js and RabbitMQ 

    AMQP = Advanced Message Queuing Protocol: It is a protocol (set of rules) for messaging

    Why do we need amqplib? 

        RabbitMQ is a server, runs separately on Docker / VM / Cloud. Nodejs cannot talk to RabbitMQ directly. 

        So we need: 

            Node.js app ---> amqplib ---> RabbitMQ Server 



## Hydration - NextJS 


Next.js works in 2 phases: 

1. Phase 1 - Server 

    Next.js runs your React code on the server. Generates HTML. Sends that HTML to the browser. 

    This is why pages load fast. 

2. Phase 2 - Browser (Hydration)

    React runs again in the browser. React attaches JS logic (events, state) to the already-existing HTML. 

    This process = Hydration 


**Hydration issue = Mismatch**

A hydration error happens when: HTML generated on the server ≠ HTML generated in the browser. 

    Server gives one value. Client gives another value. (Server HTML ≠ Client HTML) -> hydration error