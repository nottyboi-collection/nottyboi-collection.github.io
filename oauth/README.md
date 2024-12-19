# OAuth Client for NottyBoi

This project implements OAuth-based authentication in a browser-based Single Page App (SPA) to communicate with [atproto](https://atproto.com) API services for the NottyBoi social media platform.

## Prerequisites

- A web server or static file server to host your SPA.
- During development, use a tunneling service like [ngrok](https://ngrok.com/) to make your local server accessible from the internet.
- You can use a service like [GitHub Pages](https://pages.github.com/) to host your client metadata and SPA for free.
- Ability to build and deploy a SPA to your server.

## Step 1: Create Your Client Metadata

Create a `client-metadata.json` file with the following content and upload it to your server:

```json
{
  "client_id": "https://nottyboi.me/client-metadata.json",
  "client_name": "My First atproto OAuth App",
  "client_uri": "https://nottyboi.me",
  "redirect_uris": ["https://nottyboi.me/"],
  "grant_types": ["authorization_code"],
  "response_types": ["code"],
  "token_endpoint_auth_method": "none",
  "application_type": "web",
  "dpop_bound_access_tokens": true
}
```

## Step 2: Set Up Your SPA

### Initialize Your Project

```bash
mkdir oauth
cd oauth
yarn init -y
```

### Install Dependencies

```bash
yarn add vite
yarn add -D typescript @types/node
yarn add @atproto/oauth-client-browser @atproto/api
```

### Create Project Structure

```bash
mkdir -p src static
touch src/main.ts src/index.html static/client-metadata.json
```

### Configure Vite

Create a `vite.config.ts` file:

```typescript
import { defineConfig } from 'vite'

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
  },
})
```

Create a `tsconfig.json` file:

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": "./src"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## Step 3: Develop the SPA

### Create HTML and TypeScript Files

Create `src/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My First OAuth App</title>
    <script type="module" src="main.ts"></script>
  </head>
  <body>
    Loading...
  </body>
</html>
```

Create `src/main.ts`:

```typescript
import { Agent } from '@atproto/api'
import { BrowserOAuthClient } from '@atproto/oauth-client-browser'

async function main() {
  const oauthClient = await BrowserOAuthClient.load({
    clientId: 'https://nottyboi.me/client-metadata.json',
    handleResolver: 'https://bsky.social/',
  })

  const result = await oauthClient.init()

  if (result) {
    if ('state' in result) {
      console.log('The user was just redirected back from the authorization page')
    }

    console.log(`The user is currently signed in as ${result.session.did}`)
  }

  const session = result?.session

  if (!session) {
    const handle = prompt('Enter your atproto handle to authenticate')
    if (!handle) throw new Error('Authentication process canceled by the user')

    const url = await oauthClient.authorize(handle)

    window.open(url, '_self', 'noopener')

    await new Promise<never>((resolve, reject) => {
      setTimeout(
        reject,
        10_000,
        new Error('User navigated back from the authorization page'),
      )
    })
  }

  if (session) {
    const agent = new Agent(session)

    const fetchProfile = async () => {
      const profile = await agent.getProfile({ actor: agent.did })
      return profile.data
    }

    document.body.textContent = `Authenticated as ${agent.did}`

    const profileBtn = document.createElement('button')
    document.body.appendChild(profileBtn)
    profileBtn.textContent = 'Fetch Profile'
    profileBtn.onclick = async () => {
      const profile = await fetchProfile()
      outputPre.textContent = JSON.stringify(profile, null, 2)
    }

    const logoutBtn = document.createElement('button')
    document.body.appendChild(logoutBtn)
    logoutBtn.textContent = 'Logout'
    logoutBtn.onclick = async () => {
      await session.signOut()
      window.location.reload()
    }

    const outputPre = document.createElement('pre')
    document.body.appendChild(outputPre)
  }
}

document.addEventListener('DOMContentLoaded', main)
```

## Step 4: Run Your Application

### Start Development Server

```bash
yarn vite
```

### Open a Tunnel to Your Local Server

```bash
ngrok http 3000
```

Update `static/client-metadata.json` with the ngrok URL.

## Step 5: Deploy Your Application

### Build Your Project

```bash
yarn vite build
```

### Deploy to Your Web Server

Deploy the contents of the `dist` directory to your web server.
