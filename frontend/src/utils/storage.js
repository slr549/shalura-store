export class Storage {
  constructor(prefix = 'fs_') {
    this.prefix = prefix
  }

  set(key, value) {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error('Storage set error:', error)
      return false
    }
  }

  get(key) {
    try {
      const item = localStorage.getItem(this.prefix + key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error('Storage get error:', error)
      return null
    }
  }

  remove(key) {
    localStorage.removeItem(this.prefix + key)
  }

  clear() {
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .forEach(key => localStorage.removeItem(key))
  }
}

export const storage = new Storage()