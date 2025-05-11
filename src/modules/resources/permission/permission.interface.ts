import { Document } from 'mongoose'

export interface Permission extends Document {
  title: string
  key: string
  description: string
  roles: Array<string>
  isDeleted: boolean
}
