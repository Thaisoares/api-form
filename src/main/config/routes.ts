/* eslint-disable @typescript-eslint/no-floating-promises */
import { type Express, Router } from 'express'
import { readdirSync } from 'fs'
import path from 'path'

export default async (app: Express): Promise<void> => {
  const router = Router()
  app.use('/api', router)

  readdirSync(path.join(__dirname, '..', 'routes')).map(async file => {
    if (!file.includes('.test.')) {
      (await import(`../routes/${file}`)).default(router)
    }
  })
}
