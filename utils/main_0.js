/**
 * waitConnection creates a Promise that resolves when the database client
 * is connected, retrying up to 10 times before rejecting.
 *
 * repeatFct is an async function that waits 1 second, increments a counter,
 * checks if the client is alive, and repeats if not alive and under 10 tries.
 *
 * The Promise constructor calls repeatFct, resolving when isAlive is true.
 */
import dbClient from "./db";

const waitConnection = () => {
  return new Promise((resolve, reject) => {
    let i = 0;
    const repeatFct = async () => {
      await setTimeout(() => {
        i += 1;
        if (i >= 10) {
          reject();
        } else if (!dbClient.isAlive()) {
          repeatFct();
        } else {
          resolve();
        }
      }, 1000);
    };
    repeatFct();
  });
};

(async () => {
  console.log(dbClient.isAlive());
  await waitConnection();
  console.log(dbClient.isAlive());
  console.log(await dbClient.nbUsers());
  console.log(await dbClient.nbFiles());
})();
