export enum Role {
  Owner = 'Owner',
  Admin = 'Admin',
  Manager = 'Manager',
  Staff = 'Staff',
  Customer = 'Customer'
}

export enum Status {
  active = 'active',
  inactive = 'inactive'
}

export interface User {
  userID: number
  userSid?: string
  name: string
  email: string
  phone: string
  role: Role
  status: Status
  createdAt?: string
  updatedAt?: string
}

export interface CreateUserDto {
  name: string
  email: string
  phone: string
  password: string
  role?: Role
}

export interface UpdateUserDto extends Partial<Omit<CreateUserDto, 'password'>> {
  status?: Status
}

export interface UsersResponse {
  statusCode: number
  success: boolean
  message: string
  data: User[]
  meta: {
    totalItems: number
    itemCount: number
    itemsPerPage: number
    totalPages: number
    currentPage: number
  }
}