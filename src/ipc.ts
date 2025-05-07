import { v4 as uuidv4 } from 'uuid';

export type IPCRequest = {
  reqId: string;
  method: string;
  path: string;
  body?: any;
};

export type IPCResponse = {
  reqId: string;
  status: number;
  data: any;
};

const pending = new Map<string, (res: IPCResponse) => void>();

export const sendIPCRequest = (msg: Omit<IPCRequest, 'reqId'>): Promise<IPCResponse> => {
  return new Promise((resolve) => {
    const reqId = uuidv4();
    const fullMsg: IPCRequest = { ...msg, reqId };
    pending.set(reqId, resolve);

    if (process.send) {
      process.send(fullMsg); 
    }
  });
};

process.on('message', (msg: IPCResponse) => {
  const resolve = pending.get(msg.reqId);
  if (resolve) {
    pending.delete(msg.reqId);
    resolve(msg);
  }
});
