const { exec } = require('child_process');
const { createHash } = require('crypto');
const { readdirSync, existsSync, mkdirSync, rmSync } = require('fs');

var url = process.argv[2]; // ["node", "index.js", "<ism_URL>"]
if (!url) return;
var hash = createHash('md5').update(url).digest('hex');

const yt_dlp = 'yt-dlp'; // 'yt-dlp' or '/path/to/yt-dlp.exe'
const ffmpeg = 'ffmpeg'; // 'ffmpeg' or '/path/to/ffmpeg.exe'
const deleteTempFiles = true;
const tempDir = `./temp`;
if (!existsSync(tempDir)) {
  mkdirSync(tempDir, { recursive: true });
}

exec(
  `${yt_dlp} -o "${tempDir}/${hash}.%(ext)s" --allow-u ${url}`,
  (err, stdout) => {
    if (err) {
      console.error(err);
      process.exit();
    }

    var stat = readdirSync(`${tempDir}/`);
    var ism_files = stat.filter((e) => e.startsWith(hash));
    var ism_video = ism_files.find((e) => e.endsWith('.ismv'));
    var ism_audio = ism_files.find((e) => e.endsWith('.isma'));
    console.log(
      `Extracted Video & Audio File in ${process.uptime().toFixed(3)}s`
    );

    exec(
      `${ffmpeg} -i ${tempDir}/${ism_video} -i ${tempDir}/${ism_audio} -c:v copy -c:a aac -strict experimental ${hash}.mp4`,
      (err, stdout) => {
        if (deleteTempFiles) {
          rmSync(tempDir, { recursive: true, force: true });
        }

        if (err) {
          console.error(err);
        }
        console.log(`Finished in ${process.uptime().toFixed(3)}s`);
        process.exit();
      }
    );
  }
);
