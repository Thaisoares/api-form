import 'module-alias/register'
import { MongoHelper } from '@/infra/db/mongodb/helpers/mogo-helper'
import app from './config/app'
import env from './config/env'

MongoHelper.connect(env.mongoUrl)
  .then(() => { app.listen(env.port, () => { console.log(`Server running at http://localhost:${env.port}`) }) })
  .catch(console.error)
