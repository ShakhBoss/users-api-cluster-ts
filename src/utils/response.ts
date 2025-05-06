import { ServerResponse } from "http";

export const sendJson=(res: ServerResponse, statusCode:number,data:unknown)=>{
    res.writeHead(statusCode, {'Content-type':'application/json'});
    res.end(JSON.stringify(data))
}