var rpm = require('rpmbuild');
rpm.build({
    cwd: __dirname,
    name: 'myproject',
    summary: 'myproject RPM',
    description: 'this is an RPM for myproject',
    files: {
        '/var/local/myproject': ['lib/**', 'node_modules/**']
//        '/usr/bin': ['bin/**']
    },
    //installScript: ['chown -R myuser:myuser %{buildroot}', 'echo "test" > %{buildroot}/test.txt'],
    version: '0.0.1',
    release: 1,
    url: 'http://myproject/',
    license: 'GPL+',
    group: 'Development/Tools'
}, function(err, result) {
    if (err) {
        throw new Error('rpm.build failed' + err.toString());
    }
    console.log('done');
});
