export class Logo{
    id?:string;
    logo?: File;
    logoName?: string;
    icon?: File;
    iconName?: string;
}

export interface LogosDto{
    logos:Logo[],
    message:string,
    statusCode:string
  }

  export interface LogoDto{
    logo:Logo,
    message:string,
    statusCode:string
  }