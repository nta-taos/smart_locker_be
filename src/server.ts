import 'reflect-metadata'

import { configDotenv } from 'dotenv'

import App from './app/App'

const PORT = (process.env.PORT || 3000) as number
configDotenv()

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...')
  console.log(err.name, err.message)
  process.exit(1)
})

const server = App.server.listen(PORT, () => {
  console.log(`App running on port ${PORT}...`)
})

process.on('unhandledRejection', (err: Error) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...')
  console.log(err.name, err.message)
  server.close(() => {
    process.exit(1)
  })
})

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully')
  server.close(() => {
    console.log('💥 Process terminated!')
  })
})
