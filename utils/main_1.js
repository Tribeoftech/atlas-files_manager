/**
 * Imports the redisClient instance from the redis module.
 *
 * The async main function:
 * - Logs if redisClient is alive
 * - Gets and logs the value of 'myKey'
 * - Sets 'myKey' to 12 with an expiry of 5 seconds
 * - Logs the value of 'myKey' again to confirm it was set
 * - After 10 seconds, logs the value of 'myKey' again to show that it expired
 */
import redisClient from "./redis";

(async () => {
  console.log(redisClient.isAlive());
  console.log(await redisClient.get("myKey"));
  await redisClient.set("myKey", 12, 5);
  console.log(await redisClient.get("myKey"));

  setTimeout(async () => {
    console.log(await redisClient.get("myKey"));
  }, 1000 * 10);
})();
