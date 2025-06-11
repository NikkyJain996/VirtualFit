## 🖥️ Backend: Netlify Function `functions/upload.js`
```js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer setup (in-memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

exports.handler = async (event, context) => {
  return new Promise((resolve, reject) => {
    upload.single('item')({
      headers: event.headers,
      body: Buffer.from(event.body, 'base64'),
      isBase64: true
    }, {}, err => {
      if (err) return reject(err);

      const file = event.body; // simplified: use a real parser
      const filename = Date.now() + path.extname(event.headers['content-type']);
      const uploadDir = path.join(__dirname, '../public/uploads');
      fs.writeFileSync(path.join(uploadDir, filename), file, 'base64');

      resolve({
        statusCode: 200,
        body: JSON.stringify({ url: `/uploads/${filename}` })
      });
    });
  });
};
```
