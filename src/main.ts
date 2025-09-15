import { UserList } from './userList'
import { TierList } from './tierList'
import { User } from './types'

class App {
  private userList: UserList
  private tierList: TierList

  constructor() {
    this.initializeComponents()
    this.setupEventListeners()
  }

  private initializeComponents() {
    const usersContainer = document.getElementById('users-list')!
    const searchInput = document.getElementById('user-search') as HTMLInputElement
    const tiersContainer = document.getElementById('tier-rows')!

    this.userList = new UserList(usersContainer, searchInput)
    this.tierList = new TierList(tiersContainer)
  }

  private setupEventListeners() {
    this.setupTierModal()
    this.setupUserModal()

    window.addEventListener('userAddedToTier', (e: Event) => {
      const customEvent = e as CustomEvent<User>
      this.userList.removeUser(customEvent.detail.id)
    })

    window.addEventListener('removeUsersFromList', (e: Event) => {
      const customEvent = e as CustomEvent<User[]>
      customEvent.detail.forEach(user => {
        this.userList.removeUser(user.id)
      })
    })
  }

  private setupTierModal() {
    const addTierBtn = document.getElementById('add-tier-btn')!
    const modal = document.getElementById('tier-modal')!
    const confirmBtn = document.getElementById('confirm-tier')!
    const cancelBtn = document.getElementById('cancel-tier')!
    const nameInput = document.getElementById('tier-name-input') as HTMLInputElement
    const colorInput = document.getElementById('tier-color-input') as HTMLInputElement

    addTierBtn.addEventListener('click', () => {
      modal.classList.add('active')
    })

    confirmBtn.addEventListener('click', () => {
      const name = nameInput.value.trim()
      const color = colorInput.value

      if (name) {
        this.tierList.addTier(name, color)
        modal.classList.remove('active')
        nameInput.value = ''
        colorInput.value = '#808080'
      }
    })

    cancelBtn.addEventListener('click', () => {
      modal.classList.remove('active')
      nameInput.value = ''
      colorInput.value = '#808080'
    })
  }

  private setupUserModal() {
    const addUserBtn = document.getElementById('add-user-btn')!
    const modal = document.getElementById('user-modal')!
    const confirmBtn = document.getElementById('confirm-user')!
    const cancelBtn = document.getElementById('cancel-user')!
    const nameInput = document.getElementById('user-name-input') as HTMLInputElement

    addUserBtn.addEventListener('click', () => {
      modal.classList.add('active')
    })

    confirmBtn.addEventListener('click', () => {
      const name = nameInput.value.trim()

      if (name) {
        this.userList.addCustomUser(name)
        modal.classList.remove('active')
        nameInput.value = ''
      }
    })

    cancelBtn.addEventListener('click', () => {
      modal.classList.remove('active')
      nameInput.value = ''
    })
  }
}

new App()