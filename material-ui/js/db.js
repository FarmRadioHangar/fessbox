import loki from 'lokijs'

const db = new loki('loki.json')
export const messages = db.addCollection('messages', { indices: ['id'] })

export default db
