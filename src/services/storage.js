import { STORAGE_KEYS } from '../utils/constants'

export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const value = localStorage.getItem(key)
      return value ? JSON.parse(value) : defaultValue
    } catch {
      return defaultValue
    }
  },
  set: (key, value) => {
    localStorage.setItem(key, JSON.stringify(value))
  },
  remove: (key) => {
    localStorage.removeItem(key)
  },
}

export const userService = {
  getAll: () => storage.get(STORAGE_KEYS.USERS, []),
  saveAll: (users) => storage.set(STORAGE_KEYS.USERS, users),
  findByUsername: (username) => {
    const users = userService.getAll()
    return users.find((u) => u.username === username)
  },
  create: (user) => {
    const users = userService.getAll()
    users.push(user)
    userService.saveAll(users)
    return user
  },
}

export const authService = {
  getCurrentUser: () => storage.get(STORAGE_KEYS.CURRENT_USER),
  setCurrentUser: (user) => storage.set(STORAGE_KEYS.CURRENT_USER, user),
  logout: () => storage.remove(STORAGE_KEYS.CURRENT_USER),
}

export const tenderService = {
  getAll: () => storage.get(STORAGE_KEYS.TENDERS, []),
  saveAll: (tenders) => storage.set(STORAGE_KEYS.TENDERS, tenders),
  create: (tender) => {
    const tenders = tenderService.getAll()
    tenders.unshift(tender)
    tenderService.saveAll(tenders)
    return tender
  },
  update: (updated) => {
    const tenders = tenderService.getAll()
    const index = tenders.findIndex((t) => t.id === updated.id)
    if (index !== -1) {
      tenders[index] = updated
      tenderService.saveAll(tenders)
    }
    return updated
  },
  getById: (id) => tenderService.getAll().find((t) => t.id === id),
}

export const bidService = {
  getAll: () => storage.get(STORAGE_KEYS.BIDS, []),
  saveAll: (bids) => storage.set(STORAGE_KEYS.BIDS, bids),
  create: (bid) => {
    const bids = bidService.getAll()
    bids.unshift(bid)
    bidService.saveAll(bids)
    return bid
  },
  update: (updated) => {
    const bids = bidService.getAll()
    const index = bids.findIndex((b) => b.id === updated.id)
    if (index !== -1) {
      bids[index] = updated
      bidService.saveAll(bids)
    }
    return updated
  },
  getByTenderId: (tenderId) => bidService.getAll().filter((b) => b.tenderId === tenderId),
  getByBidderId: (bidderId) => bidService.getAll().filter((b) => b.bidderId === bidderId),
}

export const announcementService = {
  getAll: () => storage.get(STORAGE_KEYS.ANNOUNCEMENTS, []),
  saveAll: (announcements) => storage.set(STORAGE_KEYS.ANNOUNCEMENTS, announcements),
  create: (announcement) => {
    const announcements = announcementService.getAll()
    announcements.unshift(announcement)
    announcementService.saveAll(announcements)
    return announcement
  },
  getByTenderId: (tenderId) => announcementService.getAll().filter((a) => a.tenderId === tenderId),
  getRecent: (limit = 5) => announcementService.getAll().slice(0, limit),
}
