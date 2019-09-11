Autoform MaterializeCSS File
============================

## Description
Upload and manage files with autoForm via [`ostrio:files`](https://github.com/VeliovGroup/Meteor-Files). This package was forked from [`ostrio:autoform-files`](https://github.com/VeliovGroup/meteor-autoform-file) in order to make it work with mozfet:autoform-materialize.

> **Thank You** This suite of packages is maintained by [ExpertBox.com](https://www.ExpertBox.com/home) as a thank you to the Open Source community.

## This package is part of a suite ##
- [mozfet:meteor-autoform-materialize](https://github.com/mozfet/meteor-autoform-materialize)
- [mozfet:meteor-autoform-materialize-modals](https://github.com/mozfet/meteor-autoform-materialize-modals)
- [mozfet:meteor-autoform-nouislider](https://github.com/mozfet/meteor-autoform-nouislider)
- [mozfet:meteor-autoform-medium](https://github.com/mozfet/meteor-autoform-medium)
- [mozfet:meteor-autoform-file](https://github.com/mozfet/meteor-autoform-file)
- [mozfet:materialize-icons](https://github.com/mozfet/meteor-materialize-icons)
- [mozfet:meteor-autoform-materialize-playground](https://github.com/mozfet/meteor-autoform-materialize-playground)

## Demo, Examples, Detailed Usage and Smoke Testing ##

Have a look at the [playground](https://github.com/mozfet/meteor-autoform-materialize-playground) for demo, examples, detailed usage and smoke testing.

### Quick Start:

 - Install `meteor add ostrio:files`, *if not yet installed*
 - Install `meteor add mozfet:autoform-materialize-files`
  - Add this config to `simpl-schema` NPM package (depending of the language that you are using):
```javascript
SimpleSchema.setDefaultMessages({
  initialLanguage: 'en',
  messages: {
    en: {
      uploadError: '{{value}}', //File-upload
    },
  }
});
```
 - Create your Files Collection (See [`ostrio:files`](https://github.com/VeliovGroup/Meteor-Files))
```javascript
const Images = new FilesCollection({
  collectionName: 'Images',
  allowClientCode: true, // Required to let you remove uploaded file
  onBeforeUpload(file) {
    // Allow upload files under 10MB, and only in png/jpg/jpeg formats
    if (file.size <= 10485760 && /png|jpg|jpeg/i.test(file.ext)) {
      return true;
    } else {
      return 'Please upload image, with size equal or less than 10MB';
    }
  }
});

if (Meteor.isClient) {
  Meteor.subscribe('files.images.all');
}

if (Meteor.isServer) {
  Meteor.publish('files.images.all', () => {
    return Images.collection.find({});
  });
}
```

 - Define your schema and set the `autoform` property like in the example below
```javascript
Schemas = {};
Posts   = new Meteor.Collection('posts');
Schemas.Posts = new SimpleSchema({
  title: {
    type: String,
    max: 60
  },
  picture: {
    type: String,
    autoform: {
      type: 'fileUpload',
      collection: 'Images',
      uploadTemplate: 'uploadField', // <- Optional
      previewTemplate: 'uploadPreview', // <- Optional
      insertConfig: { // <- Optional, .insert() method options, see: https://github.com/VeliovGroup/Meteor-Files/wiki/Insert-(Upload)
        meta: {},
        isBase64: false,
        transport: 'ddp',
        streams: 'dynamic',
        chunkSize: 'dynamic',
        allowWebWorkers: true
      }      
    }
  }
});

Posts.attachSchema(Schemas.Posts);
```

The `collection` property must be the same as name of your *FilesCollection* (*case-sensitive*), `Images` in our case.

Generate the form with `{{> quickform}}` or `{{#autoform}}` e.g.:

##### Insert mode:

```html
{{> quickForm id="postsInsertForm" collection="Posts" type="insert"}}
<!-- OR -->
{{#autoForm id="postsInsertForm" collection="Posts" type="insert"}}
  {{> afQuickField name="title"}}
  {{> afQuickField name="picture"}}
  <button type="submit" class="btn btn-primary">Insert</button>
{{/autoForm}}

<!-- OR with .insert() method options -->
<!-- See: https://github.com/VeliovGroup/Meteor-Files/wiki/Insert-(Upload) -->
{{#autoForm id="postsInsertForm" collection="Posts" type="insert"}}
  {{> afQuickField name="title"}}
  {{> afQuickField name="picture" transport="http" allowWebWorkers="false"}}
  <button type="submit" class="btn btn-primary">Insert</button>
{{/autoForm}}
```

##### Update mode:

```html
{{#if Template.subscriptionsReady }}
  {{> quickForm id="postsUpdateForm" collection="Posts" type="update" doc=getPost}}
{{/if}}
<!-- OR -->
{{#if Template.subscriptionsReady }}
  {{#autoForm id="postsUpdateForm" collection="Posts" type="update" doc=getPost}}
    {{> afQuickField name="title"}}
    {{> afQuickField name="picture"}}
    <button type="submit" class="btn btn-primary">Update</button>
  {{/autoForm}}
{{/if}}
```

Autoform should be wrapped in `{{#if Template.subscriptionsReady }}` which makes sure that template level subscription is ready. Without it the picture preview won't be shown. You can see update mode example [here](https://github.com/VeliovGroup/meteor-autoform-file/issues/9).

### Multiple images // not fully supported yet
If you want to use an array of images inside you have to define the autoform on on the [schema key](https://github.com/aldeed/meteor-simple-schema#schema-keys)

```javascript
Schemas.Posts = new SimpleSchema({
  title: {
    type: String,
    max: 60
  },
  pictures: {
    type: Array,
    label: 'Choose file' // <- Optional
  },
  "pictures.$": {
    type: String,
    autoform: {
      afFieldInput: {
        type: 'fileUpload',
        collection: 'Images'
      }
    }
  }
})
```

### Custom file preview

Your custom file preview template data context will be:

- *file* - fileObj instance

```javascript
picture: {
  type: String,
  autoform: {
    afFieldInput: {
      type: 'fileUpload',
      collection: 'Images',
      previewTemplate: 'myFilePreview'
    }
  }
}
```

### Custom upload template

Your custom file upload template data context will be:

- *file* - FS.File instance
- *progress*
- *status*
- Other fields from [`FileUpload` instance](https://github.com/VeliovGroup/Meteor-Files/wiki/Insert-(Upload)#fileupload-methods-and-properties)

```javascript
picture: {
  type: String,
  autoform: {
    afFieldInput: {
      type: 'fileUpload',
      collection: 'Images',
      uploadTemplate: 'myFileUpload'
    }
  }
}
```

```html
<template name="myFilePreview">
  <a href="{{file.link}}">{{file.original.name}}</a>
</template>
```

Support this project:
======
This project wouldn't be possible without [ostr.io](https://ostr.io).

Using [ostr.io](https://ostr.io) you are not only [protecting domain names](https://ostr.io/info/domain-names-protection), [monitoring websites and servers](https://ostr.io/info/monitoring), using [Prerendering for better SEO](https://ostr.io/info/prerendering) of your JavaScript website, but support our Open Source activity, and great packages like this one could be available for free.
