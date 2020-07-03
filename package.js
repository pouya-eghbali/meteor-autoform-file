Package.describe({
  name: 'mozfet:autoform-materialize-files',
  summary: 'File upload for mozfet:autoform-materialize using ostrio:files.',
  description: 'File upload for mozfet:autoform-materialize using ostrio:files.',
  version: '2.1.0',
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
    'ostrio:files',
    'dburles:mongo-collection-instances@0.3.5'
  ]);

  api.addFiles([
    'lib/client/autoform.js',
    'lib/client/fileUpload.html',
    'lib/client/fileUpload.js',
    'lib/client/uploadImagePreview.html',
    'lib/client/uploadAudioPreview.html',
    'lib/client/uploadVideoPreview.html',
    'lib/client/uploadFilePreview.html'
  ], 'client');
});
