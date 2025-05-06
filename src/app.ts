import{IncomingMessage,ServerResponse} from 'http';
import{handleUserRoutes} from './routes/user.route';

export const app=async(req:IncomingMessage, res:ServerResponse)=>{
    try {
        await handleUserRoutes(req,res)
    } catch (error) {
        res.writeHead(500,{'Content-type':'application/json '});
        res.end(JSON.stringify({message:"Internal server error"}));
    }
}