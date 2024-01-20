import { User } from "./user.model"

export interface UserDto{
    user:User,
    message:string,
    statusCode:string
  }

  export interface UsersDto{
    users:User[],
    message:string,
    statusCode:string
  }