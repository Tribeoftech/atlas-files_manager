/**
 * Processes image files from a queue by generating thumbnails.
 * Creates 3 thumbnail sizes for each image and saves them to the file system.
 * Also processes a user queue by looking up user info.
 */
import Queue from "bull";
import { writeFileSync } from "fs";
import { ObjectId } from "mongodb";
import dbClient from "./utils/db";

const imageThumbnail = require("image-thumbnail");

const fileQueue = new Queue("file processing");
const userQueue = new Queue("userQ");

// Function creates a thumbnail based on passed in file and width
const createThumb = async (path, options) => {
  try {
    const thumbnail = await imageThumbnail(path, options);
    const thumbPath = `${path}_${options.width}`;
    // console.log('Thumbnail path is:', thumbPath);
    writeFileSync(thumbPath, thumbnail);
  } catch (err) {
    console.log(err);
  }
};

// Calls on createThumb to create 3 files of different
// image widths
fileQueue.process(async (job) => {
  const { fileId, userId } = job.data;
  if (!fileId) throw new Error("Missing fileId");
  if (!userId) throw new Error("Missing userId");

  const file = await dbClient.db.collection("files").findOne({
    _id: new ObjectId(job.data.fileId),
    userId: new ObjectId(job.data.userId),
  });
  if (!file) throw new Error("File not found");

  createThumb(file.localPath, { width: 500 });
  createThumb(file.localPath, { width: 250 });
  createThumb(file.localPath, { width: 100 });
  console.log("Thumbnail processing complete");
});

userQueue.process(async (job) => {
  const { userId } = job.data;
  if (!userId) throw new Error("Missing userId");

  const user = dbClient.users.findOne({ _id: ObjectId(userId) });
  if (!user) throw new Error("User not found");

  console.log(`Welcome ${user.email}`);
});
