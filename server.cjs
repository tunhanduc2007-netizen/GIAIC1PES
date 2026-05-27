const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Setup paths
const publicDir = path.join(__dirname, 'public');
const audioDir = path.join(publicDir, 'audio');
const playlistFile = path.join(__dirname, 'playlist.json');

// Ensure directories exist
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

// Ensure playlist.json exists
if (!fs.existsSync(playlistFile)) {
  fs.writeFileSync(playlistFile, JSON.stringify([], null, 2), 'utf-8');
}

// Serve static files from public directory
app.use(express.static(publicDir));

// Helper to read playlist
function readPlaylist() {
  try {
    const data = fs.readFileSync(playlistFile, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading playlist:', err);
    return [];
  }
}

// Helper to write playlist
function writePlaylist(playlist) {
  try {
    fs.writeFileSync(playlistFile, JSON.stringify(playlist, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing playlist:', err);
    return false;
  }
}

// Run python command to execute yt-dlp
function runYtDlp(args) {
  return new Promise((resolve, reject) => {
    // Run 'python -m yt_dlp <args>'
    const child = spawn('python', ['-m', 'yt_dlp', ...args]);
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(stderr || `yt-dlp exited with code ${code}`));
      }
    });
  });
}

// API Routes

// 1. Get entire playlist
app.get('/api/playlist', (req, res) => {
  res.json(readPlaylist());
});

// 2. Add and convert YouTube video to audio track
app.post('/api/convert', async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Vui lòng cung cấp link YouTube hợp lệ.' });
  }

  console.log(`Đang xử lý link YouTube: ${url}`);

  try {
    // Phase 1: Fetch Video Metadata using --dump-json
    console.log('Đang lấy thông tin video...');
    const metadataStr = await runYtDlp(['--dump-json', url]);
    const metadata = JSON.parse(metadataStr);

    const videoId = metadata.id;
    const title = metadata.title;
    const artist = metadata.uploader || 'Unknown Artist';
    const duration = metadata.duration || 0; // in seconds
    const thumbnail = metadata.thumbnail || (metadata.thumbnails && metadata.thumbnails.length > 0 ? metadata.thumbnails[metadata.thumbnails.length - 1].url : '');
    const filename = `${videoId}.m4a`;
    const audioFilePath = path.join(audioDir, filename);

    // Check if song already exists in playlist to avoid downloading again
    const currentPlaylist = readPlaylist();
    const existingIndex = currentPlaylist.findIndex(t => t.id === videoId);

    if (existingIndex !== -1 && fs.existsSync(audioFilePath)) {
      console.log(`Bài hát "${title}" đã tồn tại trong playlist.`);
      return res.json({ 
        success: true, 
        message: 'Bài hát đã tồn tại trong danh sách phát.', 
        track: currentPlaylist[existingIndex] 
      });
    }

    // Phase 2: Download the audio stream in m4a format
    console.log(`Đang tải luồng âm thanh (${title})...`);
    await runYtDlp([
      '-f', 'ba[ext=m4a]', 
      '-o', path.join(audioDir, '%(id)s.%(ext)s'), 
      url
    ]);

    // Check if tệp tin was actually written
    if (!fs.existsSync(audioFilePath)) {
      throw new Error('Tải file thất bại, file không xuất hiện trên hệ thống.');
    }

    const newTrack = {
      id: videoId,
      title,
      artist,
      duration,
      thumbnail,
      audioUrl: `/audio/${filename}`, // Accessed as local public file
      addedAt: new Date().toISOString()
    };

    // If it exists in JSON but file was missing, replace it. Otherwise, push it.
    if (existingIndex !== -1) {
      currentPlaylist[existingIndex] = newTrack;
    } else {
      currentPlaylist.push(newTrack);
    }

    writePlaylist(currentPlaylist);
    console.log(`Đã tải thành công: ${title}`);
    res.json({ success: true, message: 'Đã thêm bài hát vào playlist thành công!', track: newTrack });

  } catch (error) {
    console.error('Lỗi khi tải hoặc chuyển đổi video:', error);
    res.status(500).json({ error: `Không thể tải nhạc từ YouTube: ${error.message}` });
  }
});

// 3. Delete track from playlist
app.delete('/api/playlist/:id', (req, res) => {
  const { id } = req.params;
  console.log(`Đang xóa bài hát có ID: ${id}`);

  try {
    const playlist = readPlaylist();
    const trackIndex = playlist.findIndex(t => t.id === id);

    if (trackIndex === -1) {
      return res.status(404).json({ error: 'Không tìm thấy bài hát trong danh sách phát.' });
    }

    // Attempt to delete physical file
    const filename = `${id}.m4a`;
    const audioFilePath = path.join(audioDir, filename);
    if (fs.existsSync(audioFilePath)) {
      try {
        fs.unlinkSync(audioFilePath);
        console.log(`Đã xóa file vật lý: ${audioFilePath}`);
      } catch (err) {
        console.error('Không thể xóa file vật lý:', err);
      }
    }

    // Remove from playlist list
    playlist.splice(trackIndex, 1);
    writePlaylist(playlist);

    res.json({ success: true, message: 'Đã xóa bài hát khỏi danh sách phát thành công.', playlist });
  } catch (error) {
    console.error('Lỗi khi xóa bài hát:', error);
    res.status(500).json({ error: `Không thể xóa bài hát: ${error.message}` });
  }
});

// Start listening
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`Ứng dụng Server Jukebox YouTube đang chạy tại:`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`==================================================`);
});
