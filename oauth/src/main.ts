import { Agent } from '@atproto/api'
import { BrowserOAuthClient } from '@atproto/oauth-client-browser'

async function main() {
  const oauthClient = await BrowserOAuthClient.load({
    clientId: 'https://nottyboi.me/oauth/static/client-metadata.json',
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
      if (!agent.did) {
        throw new Error('Agent DID is not available')
      }
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
