import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm'

export abstract class BaseModel {
  @PrimaryGeneratedColumn()
  id!: number

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date

  @DeleteDateColumn({ name: 'deleted_at' })
  deleted_at?: Date
}
