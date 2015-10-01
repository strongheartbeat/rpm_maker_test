var buildRpm = require('rpm-builder');

var options = {
  name: 'my-project',
  version: '0.0.0',
  release: '1',
  buildArch: 'noarch',
  files: [
    // will output files to 
    // /dist/dev/file1.txt 
    // /dist/dev/file2.txt 
    // /dist/dev/file3.txt 
    // /dist/dev/img1.png 
    // /dist/dev/img2.png 
    // /dist/dev/img3.png 
    {
      src: './dev/lib/test.txt',
      dest: '/dist/'
    },
    {
      src: './dev/lib/test2.txt',
      dest: '/dist2/'
    },
    {
      src: './dev/lib/test3.txt',
      dest: '/dist3/'
    }
  ]
};

buildRpm(options, function(err, rpm) {
  if (err) {
    throw err;
  }

  console.log(rpm);
  // /path/to/my-project-0.0.0-1.noarch.rpm 
});
