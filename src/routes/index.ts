import { Router } from 'express'

import router from './user.router'

const routes = Router()
routes.use('/user', router)

export default routes
