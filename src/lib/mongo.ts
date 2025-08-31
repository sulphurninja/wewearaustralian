import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI!;
let cached: any = (global as any)._mongo || { conn: null, promise: null };

export async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) cached.promise = mongoose.connect(uri, { dbName: 'showroom' }).then(m => m);
  cached.conn = await cached.promise;
  (global as any)._mongo = cached;
  return cached.conn;
}
