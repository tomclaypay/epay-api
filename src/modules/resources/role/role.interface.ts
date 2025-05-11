import { Document } from 'mongoose'

export interface Role extends Document {
  id: string
  title: string
  description: string
  permissions: Array<any>
  isDeleted: boolean
}
