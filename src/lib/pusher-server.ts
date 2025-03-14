import Pusher from 'pusher';

// Create a safely initialized Pusher instance
let pusherInstance: Pusher | null = null;

export function getPusherInstance() {
  // If we already have an instance, return it
  if (pusherInstance) {
    return pusherInstance;
  }

  // Check if all required environment variables are available
  const hasPusherConfig = !!(
    process.env.PUSHER_APP_ID &&
    process.env.NEXT_PUBLIC_PUSHER_APP_KEY &&
    process.env.PUSHER_SECRET &&
    process.env.NEXT_PUBLIC_PUSHER_CLUSTER
  );

  // Only initialize Pusher if all config is available
  if (hasPusherConfig) {
    try {
      pusherInstance = new Pusher({
        appId: process.env.PUSHER_APP_ID!,
        key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
        secret: process.env.PUSHER_SECRET!,
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        useTLS: true,
      });
      
      console.log('Server Pusher configuration loaded successfully');
      return pusherInstance;
    } catch (error) {
      console.error('Error initializing Pusher:', error);
      return null;
    }
  }
  
  console.warn('Pusher configuration missing. Real-time messaging will not work.');
  return null;
}

// Wrapper function to safely trigger Pusher events
export async function safeTriggerPusher(
  channel: string, 
  event: string, 
  data: any
): Promise<boolean> {
  const pusher = getPusherInstance();
  
  if (!pusher) {
    console.log(`Pusher not initialized, skipping event: ${event} on channel: ${channel}`);
    return false;
  }
  
  try {
    await pusher.trigger(channel, event, data);
    return true;
  } catch (error) {
    console.error(`Error triggering Pusher event ${event} on channel ${channel}:`, error);
    return false;
  }
} 