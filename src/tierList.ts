import { Tier, User } from './types'

export class TierList {
  private tiers: Tier[] = []
  private container: HTMLElement
  private readonly STORAGE_KEY = 'tierlist-data'

  constructor(container: HTMLElement) {
    this.container = container
    this.loadFromStorage()
    this.render()
  }

  private loadFromStorage() {
    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (stored) {
      try {
        this.tiers = JSON.parse(stored)
        this.dispatchUsersInTiers()
      } catch (e) {
        console.error('Failed to load tiers from storage:', e)
        this.initializeDefaultTiers()
      }
    } else {
      this.initializeDefaultTiers()
    }
  }

  private dispatchUsersInTiers() {
    const usersInTiers: User[] = []
    this.tiers.forEach(tier => {
      usersInTiers.push(...tier.users)
    })

    if (usersInTiers.length > 0) {
      window.dispatchEvent(new CustomEvent('removeUsersFromList', { detail: usersInTiers }))
    }
  }

  private saveToStorage() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tiers))
  }

  private initializeDefaultTiers() {
    const defaultTiers = [
      { name: 'S', color: 'linear-gradient(35deg, #1c0aa7, #8e01b1)' },
      { name: 'A', color: '#da2e4d' },
      { name: 'B', color: '#fb8006' },
      { name: 'C', color: '#d3bb07' },
      { name: 'D', color: '#468946' }
    ]

    this.tiers = defaultTiers.map((tier, index) => ({
      id: `tier-${Date.now()}-${index}`,
      name: tier.name,
      color: tier.color,
      users: []
    }))
    this.saveToStorage()
  }

  addTier(name: string, color: string) {
    const tier: Tier = {
      id: `tier-${Date.now()}`,
      name,
      color,
      users: []
    }
    this.tiers.push(tier)
    this.saveToStorage()
    this.render()
  }

  private render() {
    this.container.innerHTML = ''
    this.tiers.forEach(tier => {
      const tierEl = this.createTierElement(tier)
      this.container.appendChild(tierEl)
    })
  }

  private createTierElement(tier: Tier) {
    const div = document.createElement('div')
    div.className = 'tier-row'
    div.dataset.tierId = tier.id

    const label = document.createElement('div')
    label.className = 'tier-label'
    label.style.background = tier.color
    label.contentEditable = 'true'
    label.textContent = tier.name

    label.addEventListener('blur', () => {
      tier.name = label.textContent || tier.name
      this.saveToStorage()
    })

    const dropzone = document.createElement('div')
    dropzone.className = 'tier-dropzone'

    tier.users.forEach(user => {
      const userEl = this.createTierUserElement(user)
      dropzone.appendChild(userEl)
    })

    this.setupDropzone(dropzone, tier)

    div.appendChild(label)
    div.appendChild(dropzone)

    return div
  }

  private createTierUserElement(user: User) {
    const div = document.createElement('div')
    div.className = 'user-item'
    div.style = `--color: ${user.chatColor}`
    div.draggable = true
    div.dataset.userId = user.id.toString()
    div.innerHTML = `
            <img src="${user.avatar}" alt="${user.name}">
            <span class="user-name">${user.name}</span>
        `

    div.addEventListener('dragstart', (e) => {
      e.dataTransfer!.effectAllowed = 'move'
      e.dataTransfer!.setData('user', JSON.stringify(user))
      e.dataTransfer!.setData('fromTier', 'true')
      div.classList.add('dragging')
    })

    div.addEventListener('dragend', () => {
      div.classList.remove('dragging')
    })

    return div
  }

  private setupDropzone(dropzone: HTMLElement, tier: Tier) {
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault()
      dropzone.classList.add('drag-over')
    })

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('drag-over')
    })

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault()
      dropzone.classList.remove('drag-over')

      const userData = e.dataTransfer!.getData('user')
      const fromTier = e.dataTransfer!.getData('fromTier')

      if (userData) {
        const user: User = JSON.parse(userData)

        if (fromTier) {
          this.tiers.forEach(t => {
            t.users = t.users.filter(u => u.id !== user.id)
          })
        }

        if (!tier.users.find(u => u.id === user.id)) {
          tier.users.push(user)
          this.saveToStorage()
          this.render()

          if (!fromTier) {
            window.dispatchEvent(new CustomEvent('userAddedToTier', { detail: user }))
          }
        }
      }
    })
  }
}