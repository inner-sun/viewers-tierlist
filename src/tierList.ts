import { Tier, User } from './types'

export class TierList {
  private tiers: Tier[] = []
  private container: HTMLElement

  constructor(container: HTMLElement) {
    this.container = container
    this.initializeDefaultTiers()
    this.render()
  }

  private initializeDefaultTiers() {
    const defaultTiers = [
      { name: 'S', color: '#ff7f7f' },
      { name: 'A', color: '#ffbf7f' },
      { name: 'B', color: '#ffff7f' },
      { name: 'C', color: '#7fff7f' },
      { name: 'D', color: '#7fbfff' }
    ]

    this.tiers = defaultTiers.map((tier, index) => ({
      id: `tier-${Date.now()}-${index}`,
      name: tier.name,
      color: tier.color,
      users: []
    }))
  }

  addTier(name: string, color: string) {
    const tier: Tier = {
      id: `tier-${Date.now()}`,
      name,
      color,
      users: []
    }
    this.tiers.push(tier)
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
    label.style.backgroundColor = tier.color
    label.contentEditable = 'true'
    label.textContent = tier.name

    label.addEventListener('blur', () => {
      tier.name = label.textContent || tier.name
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
    div.draggable = true
    div.dataset.userId = user.id.toString()
    div.innerHTML = `
            <img src="${user.avatar}" alt="${user.name}">
            <span>${user.name}</span>
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
          this.render()

          if (!fromTier) {
            window.dispatchEvent(new CustomEvent('userAddedToTier', { detail: user }))
          }
        }
      }
    })
  }
}