import 'reflect-metadata'
import { DataSource } from 'typeorm'

import { MYSQL_CONFIG, ENV } from './config'

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: MYSQL_CONFIG.host,
  port: Number(MYSQL_CONFIG.port),
  username: MYSQL_CONFIG.user,
  password: MYSQL_CONFIG.password,
  database: MYSQL_CONFIG.database,
  synchronize: ENV === 'development',
  logging: false,
  entities: [ENV === 'production' ? __dirname + '/../entities/*.js' : __dirname + '/../entities/*.ts'],
  migrations: [ENV === 'production' ? __dirname + '/../migrations/*.js' : __dirname + '/../migrations/*.ts'],
  subscribers: [],
  ssl: {
    rejectUnauthorized: false
  }
})
