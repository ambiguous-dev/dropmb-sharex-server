import express from "express";
import fileUpload from "express-fileupload";
import { randomBytes } from "node:crypto";

const MAX_FILE_SIZE = 536900000;
const CHUNK_SIZE = 16000000;

const app = express();

app.use(
  fileUpload({
    uriDecodeFileNames: true,
    preserveExtension: true,
  })
);

app.get("/upload", (req, res) => res.send("need to use post"));

app.post("/upload", async (req, res) => {
  if (!req.headers["x-access-token"]) req.headers["x-access-token"] = "";
  if (!req.headers["x-expiration"]) return res.status(400).send("no expiration");
  if (!req.files || Object.keys(req.files).length === 0 || !req.files.file)
    return res.status(400).send("no file");

  const file = req.files.file;
  if (file.size >= MAX_FILE_SIZE) return res.status(400).send("file too big");

  console.log(`uploading ${file.name}`);

  const share = await (
    await fetch("https://dropmb.com/api/shares", {
      credentials: "include",
      headers: {
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.5",
        "Content-Type": "application/json",
        "Cookie": req.headers["x-access-token"],
      },
      method: "POST",
      body: JSON.stringify({
        id: randomBytes(25).toString("hex"),
        expiration: req.headers["x-expiration"],
        name: file.name.length > 30 ? `${file.name.slice(0, 27)}...` : file.name,
        recipients: [],
        security: {},
      }),
    })
  ).json();

  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  if (totalChunks == 0) totalChunks++;

  const fileDataAsBlob = new Blob([file.data]);
  let fileId;
  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    console.log(`uploading chunk ${chunkIndex}/${totalChunks}`);
    const from = chunkIndex * CHUNK_SIZE;

    const upload = await (
      await fetch(
        `https://dropmb.com/api/shares/${share.id}/files?name=${file.name}${
          fileId ? `&id=${fileId}` : ""
        }&chunkIndex=${chunkIndex}&totalChunks=${totalChunks}`,
        {
          credentials: "include",
          headers: {
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "en-US,en;q=0.5",
            "Content-Type": "application/octet-stream",
            "Cookie": req.headers["x-access-token"],
          },
          method: "POST",
          body: fileDataAsBlob.slice(from, from + CHUNK_SIZE),
        }
      )
    );

    const uploadData = await upload.json();

    if (!upload.ok) {
      if (uploadData.error === "unexpected_chunk_index") {
        console.log("chunk corrupted (or something), retrying chunk upload")
        chunkIndex = uploadData.expectedChunkIndex - 1;
        continue;
      } else {
        console.log("failed to upload chunks! upload cancled");
        return res.status(500).send(`uploading error: ${JSON.stringify(uploadData)} | ${JSON.stringify(share)}`);
      }
    }

    fileId = uploadData.id;
  }

  await (
    await fetch(`https://dropmb.com/api/shares/${share.id}/complete`, {
      credentials: "include",
      headers: {
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.5",
        "Content-Type": "application/octet-stream",
        "Cookie": req.headers["x-access-token"],
      },
      method: "POST",
    })
  ).json();

  const rawURL = `https://dropmb.com/api/shares/${share.id}/files/${fileId}?download=false`;
  console.log(`uploaded to ${rawURL}`);

  return res.status(200).send(rawURL);
});

app.listen(9102, () => console.log("started server"));
