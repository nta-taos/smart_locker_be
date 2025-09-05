import { Router } from 'express'

import authRouter from './auth.route'

const routes = Router()

routes.use('/auth', authRouter)

export default routes
