import { User } from './models/user.model';
import { v4 as uuidv4 } from 'uuid';
import { users } from './db/users.db';

export const handleRequest = (method: string, path: string, body: any) => {
  const userIdMatch = path.match(/^\/api\/users\/(.+)$/);

  
  if (method === 'GET' && path === '/api/users') {
    return { status: 200, data: users };
  }

  
  if (method === 'GET' && userIdMatch) {
    const user = users.find(u => u.id === userIdMatch[1]);
    return user
      ? { status: 200, data: user }
      : { status: 404, data: { message: 'User not found' } };
  }

  
  if (method === 'POST' && path === '/api/users') {
    const { username, age, hobbies } = body || {};
    if (!username || typeof age !== 'number' || !Array.isArray(hobbies)) {
      return { status: 400, data: { message: 'Missing required fields' } };
    }
    const newUser: User = { id: uuidv4(), username, age, hobbies };
    users.push(newUser);
    return { status: 201, data: newUser };
  }

  
  if (method === 'PUT' && userIdMatch) {
    const index = users.findIndex(u => u.id === userIdMatch[1]);
    if (index === -1) {
      return { status: 404, data: { message: 'User not found' } };
    }
    const { username, age, hobbies } = body || {};
    if (!username || typeof age !== 'number' || !Array.isArray(hobbies)) {
      return { status: 400, data: { message: 'Missing required fields' } };
    }
    users[index] = { id: userIdMatch[1], username, age, hobbies };
    return { status: 200, data: users[index] };
  }

  
  if (method === 'DELETE' && userIdMatch) {
    const index = users.findIndex(u => u.id === userIdMatch[1]);
    if (index === -1) {
      return { status: 404, data: { message: 'User not found' } };
    }
    users.splice(index, 1);
    return { status: 204, data: null };
  }

  
  return { status: 404, data: { message: 'Route not found' } };
};
