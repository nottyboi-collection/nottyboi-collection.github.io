import { Agent } from '@atproto/api'
import { BrowserOAuthClient } from '@atproto/oauth-client-browser'
import type { AppBskyActorDefs } from '@atproto/api'

interface UIElements {
  loading: HTMLElement
  loginForm: HTMLElement
  profile: HTMLElement
  error: HTMLElement
  handleInput: HTMLInputElement
  loginButton: HTMLElement
  logoutButton: HTMLElement
  profileImage: HTMLImageElement
  profileName: HTMLElement
  profileHandle: HTMLElement
}

const getElements = (): UIElements => {
  return {
    loading: document.getElementById('loading')!,
    loginForm: document.getElementById('login-form')!,
    profile: document.getElementById('profile')!,
    error: document.getElementById('error')!,
    handleInput: document.getElementById('handle-input') as HTMLInputElement,
    loginButton: document.getElementById('login-button')!,
    logoutButton: document.getElementById('logout-button')!,
    profileImage: document.getElementById('profile-image') as HTMLImageElement,
    profileName: document.getElementById('profile-name')!,
    profileHandle: document.getElementById('profile-handle')!,
  }
}

const showError = (message: string) => {
  const elements = getElements()
  elements.error.textContent = message
  elements.error.classList.remove('hidden')
  setTimeout(() => {
    elements.error.classList.add('hidden')
  }, 5000)
}

const showLoading = () => {
  const elements = getElements()
  elements.loading.classList.remove('hidden')
  elements.loginForm.classList.add('hidden')
  elements.profile.classList.add('hidden')
  elements.error.classList.add('hidden')
}

const showLoginForm = () => {
  const elements = getElements()
  elements.loading.classList.add('hidden')
  elements.loginForm.classList.remove('hidden')
  elements.profile.classList.add('hidden')
  elements.error.classList.add('hidden')
}

const showProfile = () => {
  const elements = getElements()
  elements.loading.classList.add('hidden')
  elements.loginForm.classList.add('hidden')
  elements.profile.classList.remove('hidden')
  elements.error.classList.add('hidden')
}

async function main() {
  const elements = getElements()
  showLoading()

  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const clientId = isDevelopment
    ? 'http://localhost'
    : 'https://nottyboi-collection.github.io/oauth/static/client-metadata.json';

  const oauthClient = await BrowserOAuthClient.load({
    clientId,
    handleResolver: 'https://bsky.social/',
    allowHttp: isDevelopment
  })

  try {
    const result = await oauthClient.init()

    if (result?.session) {
      const agent = new Agent(result.session)
      const profile = await agent.api.app.bsky.actor.getProfile({ actor: result.session.did })
      
      const profileView = profile.data as AppBskyActorDefs.ProfileViewDetailed
      elements.profileImage.src = profileView.avatar || 'https://placeholder.co/100'
      elements.profileName.textContent = profileView.displayName || result.session.did
      elements.profileHandle.textContent = profileView.handle
      showProfile()

      elements.logoutButton.addEventListener('click', async () => {
        await result.session.signOut()
        window.location.reload()
      })
    } else {
      showLoginForm()

      elements.loginButton.addEventListener('click', async () => {
        const handle = elements.handleInput.value.trim()
        if (!handle) {
          showError('Please enter your handle')
          return
        }

        try {
          showLoading()
          const url = await oauthClient.authorize(handle)
          window.location.href = url.href
        } catch (err) {
          console.error(err)
          showError('Failed to start authentication process')
          showLoginForm()
        }
      })

      elements.handleInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          elements.loginButton.click()
        }
      })
    }
  } catch (err) {
    console.error(err)
    showError('Failed to initialize OAuth client')
    showLoginForm()
  }
}

document.addEventListener('DOMContentLoaded', main)
