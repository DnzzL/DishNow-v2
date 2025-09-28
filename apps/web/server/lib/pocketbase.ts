import PocketBase from "pocketbase"

const superuserClient = new PocketBase(process.env.POCKETBASE_URL);

// disable autocancellation so that we can handle async requests from multiple users
superuserClient.autoCancellation(false);

// option 1: authenticate as superuser using email/password (could be filled with ENV params)
await superuserClient.collection('_superusers').authWithPassword(
  process.env.POCKETBASE_ADMIN_EMAIL, process.env.POCKETBASE_ADMIN_PASSWORD, {
  // This will trigger auto refresh or auto reauthentication in case
  // the token has expired or is going to expire in the next 30 minutes.
  autoRefreshThreshold: 30 * 60
})

export default superuserClient;
