console.log('Hello from atproto OAuth example app!')

import { Agent } from '@atproto/api'
import { BrowserOAuthClient } from '@atproto/oauth-client-browser'

async function main() {
  const oauthClient = await BrowserOAuthClient.load({
    clientId: 'https://e300-2607-f1c0-f04d-ea00-00-1.ngrok-free.app/client-metadata.json',
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

// TO BE CONTINUED
}

document.addEventListener('DOMContentLoaded', main)