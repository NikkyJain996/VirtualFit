// functions/upload.js
// Netlify Function to handle image upload via busboy
const Busboy = require('busboy');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    // Parse multipart form data using busboy
    const parseMultipartForm = (event) => {
      return new Promise((resolve, reject) => {
        const bb = Busboy({ headers: event.headers });
        const fields = { file: [] };
        bb.on('file', (name, file, info) => {
          let chunks = [];
          file.on('data', (data) => {
            chunks.push(data);
          });
          file.on('end', () => {
            const content = Buffer.concat(chunks);
            fields[name].push({
              filename: info.filename,
              type: info.mimeType,
              content: content
            });
          });
        });
        bb.on('finish', () => resolve(fields));
        bb.on('error', err => reject(err));
        // event.body is base64-encoded
        bb.end(Buffer.from(event.body, 'base64'));
      });
    };

    const fields = await parseMultipartForm(event);
    if (!fields || !fields.file || fields.file.length === 0) {
      throw new Error('No file uploaded');
    }
    // Take first uploaded file
    const file = fields.file[0];
    // Return the file data as JSON (base64 content)
    return {
      statusCode: 200,
      body: JSON.stringify({
        filename: file.filename,
        contentType: file.type,
        data: file.content.toString('base64')
      })
    };
  } catch (err) {
    return { statusCode: 400, body: `Upload error: ${err.message}` };
  }
};
