import 'reflect-metadata'
import * as entities from 'entities'
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
  entities: Object.values(entities),
  migrations: [],
  subscribers: [],
  ssl: {
    rejectUnauthorized: false
  }
})
