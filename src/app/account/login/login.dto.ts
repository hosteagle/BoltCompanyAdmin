import { Token } from "../contracts/token/token";

export class Login{
    usernameOrEmail:string;
    password:string;
}


export interface LoginDto{
    login: Login;
    token: Token;
    message:string,
    statusCode:string
}