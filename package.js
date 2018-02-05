Package.describe({
  name: 'mozfet:autoform-materialize-files',
  summary: 'File upload for mozfet:autoform-materialize using ostrio:files.',
  description: 'File upload for mozfet:autoform-materialize using ostrio:files.',
  version: '2.0.6',
  git: 'https://github.com/mozfet/meteor-autoform-file.git'
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@1.4');

  api.use([
    'check',
    'ecmascript',
    'underscore',
    'mongo',
    'reactive-var',
    'templating',
    'aldeed:autoform@6.2.0',
    'ostrio:files@1.9.0'
  ]);

  api.addFiles([
    'lib/client/autoform.js',
    'lib/client/fileUpload.html',
    'lib/client/fileUpload.js',
    'lib/client/uploadImageDemo.html',
    'lib/client/uploadFileDemo.html'
  ], 'client');
});
