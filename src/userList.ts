import { User } from './types'

export class UserList {
  private users: User[] = []
  private filteredUsers: User[] = []
  private container: HTMLElement
  private searchInput: HTMLInputElement
  private readonly STORAGE_KEY = 'tierlist-data'
  private nextCustomUserId = 1000000

  constructor(container: HTMLElement, searchInput: HTMLInputElement) {
    this.container = container
    this.searchInput = searchInput
    this.initializeUsers()
    this.setupSearch()
    this.render()
  }

  private async initializeUsers() {
    try {
      const response = await fetch('viewers.json')
      const data = await response.json()
      console.log(data)
      this.users = data.map((viewer: any) => ({
        id: parseInt(viewer.user_uid),
        name: viewer.displayName || viewer.user_name,
        avatar: viewer.avatar,
        watchtime: parseInt(viewer.watchtime),
        message: parseInt(viewer.message),
        chatColor: viewer.chatColor
      }))

      this.removeAlreadyRankedUsers()
      this.filteredUsers = [...this.users]
      this.render()
    } catch (error) {
      console.error('Failed to load users:', error)
      this.users = []
      this.filteredUsers = []
    }
  }

  addCustomUser(name: string) {
    const customUser: User = {
      id: this.nextCustomUserId++,
      name,
      avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      message: 0,
      watchtime: 0,
      chatColor: '#FFFFFF'
    }

    this.users.push(customUser)

    const query = this.searchInput.value.toLowerCase()
    if (customUser.name.toLowerCase().includes(query)) {
      this.filteredUsers.push(customUser)
    }

    this.render()
  }

  private removeAlreadyRankedUsers() {
    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (stored) {
      try {
        const tiers = JSON.parse(stored)
        const rankedUserIds = new Set()

        tiers.forEach((tier: any) => {
          tier.users.forEach((user: User) => {
            rankedUserIds.add(user.id)
          })
        })

        this.users = this.users.filter(user => !rankedUserIds.has(user.id))
      } catch (e) {
        console.error('Failed to load tiers from storage:', e)
      }
    }
  }

  private setupSearch() {
    this.searchInput.addEventListener('input', (e) => {
      const query = (e.target as HTMLInputElement).value.toLowerCase()
      this.filteredUsers = this.users.filter(user =>
        user.name.toLowerCase().includes(query)
      )
      this.render()
    })
  }

  randomize() {
    for (let i = this.filteredUsers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
        ;[this.filteredUsers[i], this.filteredUsers[j]] = [this.filteredUsers[j], this.filteredUsers[i]]
    }
    this.render()
  }

  private render() {
    this.container.innerHTML = ''
    this.filteredUsers.forEach(user => {
      const userEl = this.createUserElement(user)
      this.container.appendChild(userEl)
    })
  }

  private createUserElement(user: User) {
    const div = document.createElement('div')
    div.className = 'user-item'
    div.draggable = true
    div.dataset.userId = user.id.toString()

    const formatNumber = (num: number) => {
      if (num >= 1000) {
        return Math.round(num / 1000) + 'k'
      }
      return num.toString()
    }

    const watchHours = Math.round(user.watchtime / 3600)
    const formattedWatchtime = formatNumber(watchHours)
    const formattedMessages = formatNumber(user.message)

    div.innerHTML = `
      <img src="${user.avatar}" alt="${user.name}">
      <div class="user-info">
        <span class="user-name" style="--color: ${user.chatColor}">${user.name}</span>
        ${user.message > 0 ? `<span class="user-messages">${formattedMessages} messages</span>` : ''}
        ${user.watchtime > 0 ? `<span class="user-watchtime">${formattedWatchtime} heures en stream</span>` : ''}
      </div>
    `

    div.addEventListener('dragstart', (e) => {
      e.dataTransfer!.effectAllowed = 'move'
      e.dataTransfer!.setData('user', JSON.stringify(user))
      div.classList.add('dragging')
    })

    div.addEventListener('dragend', () => {
      div.classList.remove('dragging')
    })

    return div
  }

  removeUser(userId: number) {
    this.users = this.users.filter(u => u.id !== userId)
    this.filteredUsers = this.filteredUsers.filter(u => u.id !== userId)
    this.render()
  }

  addUser(user: User) {
    if (!this.users.find(u => u.id === user.id)) {
      this.users.push(user)
      this.filteredUsers.push(user)
      this.render()
    }
  }
}