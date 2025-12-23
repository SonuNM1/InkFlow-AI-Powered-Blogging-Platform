"use client" is a Next.js directive that tells Next.js this file must run in the browser, not on the server. 

## Why does "use client" even exist? 

Next.js (App Router) has 2 types of components: 

1. Server Components (default)

- Run on the server 

- Can access: Databases, Secrets, Environment variables 

- Cannot use: useState, useEffect, browser APIs (window, localStorage), event handlers (onClick, onChange)

2. Client Components 

- Runs in the browser 

- Can use: useState, useEffect, event handlers, UI interactions 

- Cannot access server-only things (DB, Secrets)

By default, every component is a Server component 

When we write "use client", at the top of the file, we are telling Next.js: 
"This component (and everything it imports) must run in the browser."

**When do we NED "use client"?**

We must use it if we use any of these: 

1. React hooks: useState, useEffect, useContext, useRef 

2. Event handlers: onClick, onChange 

3. Browser APIs: window, document, localStorage, sessionStorage 

4. UI libraries: shadcn, radix, tailwind 


## Why Next.js over React? 


- React alone = just a UI library 
- Next.js = React + production features 

1. React (CRA/Vite) limitations 

- With plain React: No built-in routing, No SSR (SEO problems), No backend, No image optimization, Manual config for everything. 

    We have to add: React Router, Express backend, SEO hacks, Deployment logic 

2. Wht Next.js gives you 

- File-based routing (no React router needed)

- Server-Side Rendering (SEO Gold)

    Pages are rendered on the server, so: Google can index content, Faster first load, Better performance

- Backend + Frontend in ONE project 

    We can create APIs directly. No separate Express needed. 

- Hybrid Rendering 

    We can mix: Server Components (fast, SEO), Client components (Interactive UI) - This is why "use client" exists. 

- Use React only if: SPA only, No SEO, Internal tools 

- Next.js = Backend-first React framework


## Context API 

- Problem without Context 

    Imagine: Navbar needs to know if user logged in. Login page sets user. Blog page needs user info. Saved blog page needs user info. 

    Without Context: You'd pass props page -> layout -> navbar. This becomes prop drilling hell. 

- Context 

    Context = global state for your frontend 

    Think of it as: A global JavaScript object accessible by any component. 

    Example of what context stores: Logged-in user, Auth token, Theme (dark/light), Language, Cart items (e-commerce)

- Real-world analogy 

    Imagine a college notice board: Anyone can read notices, No need to ask each student individually. 

    Context = notice board
    Components = students 

    