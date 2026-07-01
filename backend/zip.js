const fs = require('fs');
const archiver = require('archiver');

const output = fs.createWriteStream(__dirname + '/../vozhaju_backend_source.zip');
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', function() {
  console.log(archive.pointer() + ' total bytes');
  console.log('Backend zipped successfully!');
});

archive.pipe(output);

// Add everything except node_modules
archive.glob('**/*', {
  cwd: __dirname,
  ignore: ['node_modules/**', 'vozhaju_backend_source.zip', '.env']
});

archive.finalize();
