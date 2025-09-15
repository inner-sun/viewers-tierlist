import { User } from './types'

export class UserList {
  private users: User[] = []
  private filteredUsers: User[] = []
  private container: HTMLElement
  private searchInput: HTMLInputElement

  constructor(container: HTMLElement, searchInput: HTMLInputElement) {
    this.container = container
    this.searchInput = searchInput
    this.initializeUsers()
    this.setupSearch()
    this.render()
  }

  private initializeUsers() {
    this.users = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      avatar: `https://i.pravatar.cc/50?img=${(i % 70) + 1}`
    }))
    this.filteredUsers = [...this.users]
    this.randomize()
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
    div.innerHTML = `
            <img src="${user.avatar}" alt="${user.name}">
            <span>${user.name}</span>
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