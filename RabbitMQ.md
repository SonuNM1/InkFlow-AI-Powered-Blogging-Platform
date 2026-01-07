## What RabbitMQ actually is

Think of RabbitMQ as a post office

- Your service (blog service) drops a message

- RabbitMQ stores it safely

- Another service (or worker) comes later and reads it

- The two services do NOT talk directly

This is called asynchronous communication.

- RabbitMQ = server, amqplib = client

**Why not direct HTTP?**

Because:

- HTTP: request must wait for response
- RabbitMQ: fire-and-forget

- In microservices, when one service does something (e.g. creates a blog), another service may need to react (e.g. invalidate the cache in Redis). But:

  You don't want tight coupling between services.

  You don't want them calling each other synchronously all the time.

  This is where message queues like RabbitMQ help. Think of RabbitMQ as a messenger. You publish messages to a queue, and other services listen to (consume) those messages and do their work.

## Use Case: Cache Invalidation -

You'are caching blog lists in Redis. But when a blog is created/updated/deleted, the cache becomes outdated.

You need to invalidate the cache, but you don't want every controller to directly delete Redis keys.

Instead, you:

- Publish a message to a "cache-invalidation" queue via RabbitMQ.

- Another service or worker is listening to that queue and deletes the cache keys from Redis.

---

1. **Connect to RabbitMQ Server**

- Connects to RabbitMQ running locally in Docker

- 5672 is RabbitMQ's default TCP port

- After creating, we create a channel.

  Channel = a "communication pipe" to send / receive messages. We need it to publish/consume messages.

- Connection: Physical TCP connection to RabbitMQ

- Channel: Virtual connection inside that TCP connection

  One connection can have many channels. Channels are cheap, connections are expensive.

  Rule: Create ONE connection, then create channels on it.

## What problem RabbitMQ solves in our app

- Without RabbitMQ:

  Blog created

  Delete Redis cache immediately

  DB + Redis load increases

  Tight coupling

- With RabbitMQ:

  Blog created

  Publish job -> RabbitMQ

  Cache worker deletes keys

  Blog service stays fast

This is called: **Asynchronous cache invalidation**

Blog Service
|
| publish message
v
RabbitMQ Queue
|
| consume later
v
Cache Worker / Other Service

## Is RabbitMQ only for cache invalidation?

NO. That's just one use-case.

- Real-world uses: Emails, Notifications, Payments, Logs, Analytics, Background jobs, Event-driven systems.

  RabbitMQ = event backbone

**You don't want tight coupling between services.** What does it mean?

- Tight coupling = services depend directly on each other to work

Example: Blog Service -> calls -> User Service

    const { data } = await axios.get(
        `${USER_SERVICE}/api/v1/user/${authorId}`
    )

Here, Blog Service cannot finish its job, unless User Service is up and responds immediately.

This is tight coupling.

**You don't want them calling each other synchronously all the time**

Synchronous call = wait until the other service replies

    Example: await axios.get(...)

    Your service is literally blocked until the other service responds.

Why is this a PROBLEM?

- Problem 1: One service down = others fail

Imagine: User service is down, Blog Service tries to fetch author info

    Result - 500 Internal Server Error.

    But the blog exists. Only author info failed. One failure cascades to others. This is called cascading failure.

- Problem 2: Slow service = slow system

If: User Service takes 2 seconds. Blog Service calls it 1000 times.

    Now your blog API is slow even if PostreSQL is fast.

- Problem 3: Scaling Nightmare

If traffic increases: Blog Service gets more requests, It indirectly overloads User Service. User Service crashes, Blog Service crashes too.

    This breaks independent scalability, which is the whole point of microservices.

- Problem 4: Deployment hell

If you want to deploy User Service:

    Blog Service may break. Auth Service may break. Everything must be deployed together.

    This defeats microservices completely.

**What do we WANT instead?**

We want: Loose Coupling, Independent services, Failure isolation, Async communication.

**ENTER: Message Queues (RabbitMQ)**

Key idea: Don't call other services directly. Send messages instead.

    Think of RabbitMQ like WhatsAPP. Instead of calling your friend directly: You send a message, They read it when they're available, If they're offline, message waits.

Replace this:

    await axios.get("user-service/api/user/123")

With this:

    publishToQueue("cache-invalidation", {
        keys: ["blogs:all"]
    })

- Now: Blog Service does its job, It doesn't care who handles the message, If Redis service is down -> message waits. No blocking. No crashes.

## What RabbitMQ actually does

RabbitMQ has:

1.  Producer (Sender): Your Blog Service

    publishToQueue("cache-invalidation", message)

2.  Queue

    A mailbox called "cache-invalidation"

3.  Consumer (Listener)

    Another service (or same service) listening to that queue.

        consume queue -> invalidate Redis keys

**Why NOT synchronous calls?**

- Synchronous (bad for microservices)

  Service A -> waits -> Service B

  Problems: Blocking, Failures propagate, Tight coupling

- Asynchronous

  Service A -> sends message -> continues

  Service B -> processes later

  Problems: Non-blocking, Fault tolerant, Scalable, Loose coupling.

- Synchronous calls create tight coupling and cascading failures. Message queues create loose coupling and resilient systems.

## What purpose does RabbitMQ server in our app

Our app has multiple services.

    - Author Service: Creates / edits blogs
    - Blog Service: Serves blogs + Redis cache
    - Redis: Caches blog lists
    - Postgres: source of truth

The real problem: When Author Service updates a blog, this happens -

1. Blog data in Postgres changes
2. Redis cache in Blog Service becomes STALE
3. Blog Service does NOT know something changed

   Redis doesn't auto-update
   Services don't auto-talk

   We need a MESSANGER.

**RabbitMQ = the messenger**

Think of RabbitMQ as: A post office between services

- One service drops a message
- Another service picks it up
- They don't talk directly
- They don't block each other

**Without RabbitMQ**

Author Service: Hey Blog Service, I updated a blog, clear your cache

Blog Service: I'm down/busy/restarting

App breaks or cache stays stale.

**With RabbitMQ**

Author Service: I'll leave a note in the post office.

RabbitMQ: Got it. I'll hold it safely.

Blog Service: Whenever I'm free, i'll check messages.

Loosing coupling, Reliable, Async, Scales

**What exactly happening in our app**

- Producer (Author Service) - When a blog is created/edited/deleted:

    channel.sendToQueue("cache-invalidation", Buffer.from(JSON.stringify({
        action: "invalidateCache",
        keys: ["blogs:*"]
    })));

Meaning: Any cache that starts with `blogs:*` is now invalid.


- Consumer (Blog Service)

startCacheConsumer();

    It connects to RabbitMQ, Listens to 'cache-invalidation' queue, Receives message, Deletes Redis keys, Rebuilds cache 


**RabbitMQ in our app is a middleman that lets services communicate without knowing about each other. When a blog changes, the author service drops a small "cache invalidation" note into RabbitMQ. The blog service listens for these notes and clears Redis accordingly.**


## Interview Ready


1. **What is RabbitMQ?**

RabbitMQ is a message broker that enables asynchronous communication between different services. 

It allows one service to publish events without knowing which service will consume them, improving scalability, reliability, and decoupling in distributed systems. 

2. **Why did you use RabbitMQ in your app?**

In my application, RabbitMQ is used to propagate cache invalidation events between microservices. 

When a blog is created, updated, or deleted in the Author Service, it publishes an event to RabbitMQ. 

The Blog Service consumes this event and clears or rebuilds its Redis cache so users always see fresh data. 

3. **Why not just call the Blog Service API directly?**

Direct API calls tightly couple services and introduce failure propagation. With RabbitMQ, the producer doesn't care if the consumer is temporarily down. 

Messages are queued and processed when the consumer becomes available. 

Loose coupling, fault tolerance, resilience and scalable 


4. **Real-life use case of RabbitMQ**


- eCommerce

When an order is placed: 

Order placed                Order Service 

Send email                  Email Service

Update Inventory            Inventory Service 

Generate Invoice            Billing Service 


- Email / Notifications 

User signs up; App publishes `user.registered`; Email service consumes and sends welcome email; If email fails, signup still succeeds 

- Payment processing 

Payment succeeds, Emit `payment.success`, Trigger: invoice generation, leder update, analytics 




docker run -d --hostname rabbitmq-host --name rabbitmq-container -e RABBITMQ_DEFAULT_USER=admin -e RABBITMQ_DEFAULT_PASS=admin123 -p 5672:5672 -p 15672:15672 rabbitmq:3-management


## Do companies rebuild & redeploy for every code change? 


Yes - but not manually. Operationally it's automated. 

**How it works in real production (CI/CD)**

Dev pushes code -> CI Pipeline -> Docker build -> Docker push -> Deploy 

Example (GitHub Actions / GitLab CI) - 

    on: push to main
      - run tests 
      - docker build 
      - docker push 
      - deploy to prod 

So, Developers don't run `docker build` manually. Developers don't push to Docker Hub manually. 

✅ CI does it automatically. 


**Why rebuild every time?**

Because: 

- Docker images are immutable 
- You never change a running container 
- You always deploy a new version 
