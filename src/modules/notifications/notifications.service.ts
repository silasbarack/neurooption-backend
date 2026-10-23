import { Injectable } from '@nestjs/common';
@Injectable()
export class NotificationsService {
  private store = new Map<string, any[]>();
  add(uid: string, n: any) { if (!this.store.has(uid)) this.store.set(uid, []); this.store.get(uid).unshift({...n,id:Date.now(),read:false,createdAt:new Date()}); }
  getForUser(uid: string) { return this.store.get(uid)||[]; }
  markRead(uid: string, id: number) { const n=(this.store.get(uid)||[]).find(n=>n.id===id); if(n)n.read=true; return {success:true}; }
}
