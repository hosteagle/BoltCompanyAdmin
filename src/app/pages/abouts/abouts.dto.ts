import { About } from "./abouts.model";

export interface AboutDto{
    about:About,
    message:string,
    statusCode:string
  }

  export interface AboutsDto{
    abouts:About[],
    message:string,
    statusCode:string
  }