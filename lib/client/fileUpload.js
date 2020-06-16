/*jshint esversion: 6 */

import { _ } from "meteor/underscore";
import { Meteor } from "meteor/meteor";
import { AutoForm } from "meteor/aldeed:autoform";
import { Template } from "meteor/templating";
import { ReactiveVar } from "meteor/reactive-var";
import { Mongo } from "meteor/mongo";

const defaultInsertOpts = {
  meta: {},
  isBase64: false,
  transport: "ddp",
  streams: "dynamic",
  chunkSize: "dynamic",
  allowWebWorkers: true,
};

Template.afFileUpload.onCreated(function () {
  // normalise instance data attributes
  const instance = Template.instance();
  if (!instance.data) {
    instance.data = {
      atts: {},
    };
  }

  // normalise the collection
  //console.log('afFileUpload.instance', instance);
  if (!instance.data.atts.collection) {
    throw new Meteor.Error("File upload requires a collection name.");
  }

  const collection = Mongo.Collection.get(instance.data.atts.collection);
  if (!collection) {
    throw new Meteor.Error("File upload requires an existing collection?");
  }

  instance.collection = collection.filesCollection;
  //console.log('File Upload Collection', instance.collection);

  // init custom upload and preview templates
  instance.uploadTemplate = instance.data.atts.uploadTemplate || null;
  instance.previewTemplate = instance.data.atts.previewTemplate || null;

  // update the insert config
  instance.insertConfig = Object.assign(
    {},
    instance.data.atts.insertConfig || {}
  );

  // create new insert configuration
  delete instance.data.atts.insertConfig;
  instance.insertConfig = Object.assign(
    instance.insertConfig,
    _.pick(instance.data.atts, Object.keys(defaultInsertOpts))
  );

  // if number of streams is not a number or not dynamic
  if (
    !isNaN(instance.insertConfig.streams) ||
    instance.insertConfig.streams !== "dynamic"
  ) {
    // normalise number of streams as integer
    instance.insertConfig.streams = parseInt(instance.insertConfig.streams);
  }

  // if chunk size is not a number or not dynamic
  if (
    !isNaN(instance.insertConfig.chunkSize) ||
    instance.insertConfig.chunkSize !== "dynamic"
  ) {
    // normalise chunk size as integer
    instance.insertConfig.chunkSize = parseInt(instance.insertConfig.chunkSize);
  }

  // if no instance collection is defined
  if (!instance.collection) {
    // 404?
    throw new Meteor.Error(
      404,
      '[meteor-autoform-files] No such collection "' +
        instance.data.atts.collection +
        '"'
    );
  }

  // init collection name helper... why?
  instance.collectionName = () => {
    return instance.data.atts.collection;
  };

  // start without current upload
  instance.currentUpload = new ReactiveVar(false);

  // input name is same as autoform input name
  instance.inputName = instance.data.name;

  // file id is the value of the autoform input
  instance.fileId = new ReactiveVar(instance.data.value || false);

  // form id is the autoform input id?
  instance.fieldId = instance.data.atts.id;

  //console.log(instance);

  // return
  return undefined;
});

Template.afFileUpload.helpers({
  getButtonText() {
    return this.atts.buttonText || "File";
  },
  getRemoveButtonText({ atts = {} } = {}) {
    return atts.removeButtonText || "Remove";
  },
  previewTemplate() {
    const instance = Template.instance();
    return instance.previewTemplate;
  },
  uploadTemplate() {
    const instance = Template.instance();
    return instance.uploadTemplate;
  },
  currentUpload() {
    const instance = Template.instance();
    return instance.currentUpload.get();
  },
  fileId() {
    const instance = Template.instance();
    return instance.fileId.get() || instance.value;
  },
  uploadedFile() {
    const instance = Template.instance();
    const _id = instance.fileId.get() || instance.value;
    if (typeof _id !== "string" || _id.length === 0) {
      //console.log('No file has been uploaded for this autoform input yet.');
      return null;
    }
    //console.log('uploaded file id', _id);
    const file = instance.collection.findOne(_id);
    if (_.isUndefined(file)) {
      console.error("Cannot find file with id " + _id);
    } else {
      //console.log('Found file:', file);
      return file;
    }
  },
});

Template.afFileUpload.events({
  // 'click [data-reset-file]'(event, instance) {
  //   event.preventDefault();
  //   instance.fileId.set(false);
  //   return false;
  // },
  "click [data-remove-file]"(event, instance) {
    event.preventDefault();
    instance.fileId.set(false);
    try {
      this.remove();
    } catch (error) {
      // we're good here
    }
    instance.$("[type=hidden]").change();
    return false;
  },
  "change [data-files-collection-upload]"(e, template) {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      const opts = Object.assign({}, defaultInsertOpts, template.insertConfig, {
        file: e.currentTarget.files[0],
      });

      const upload = template.collection.insert(opts, false);
      const formId = template.$(template.firstNode).closest("form").attr("id");

      const ctx = AutoForm.getValidationContext(formId);

      upload.on("start", function () {
        //console.log('Start uploading file.');
        ctx.reset();
        template.currentUpload.set(this);
        return;
      });

      upload.on("error", function (error) {
        console.error("Error uploading file:", error);
        ctx.reset();
        ctx.addValidationErrors([
          {
            name: template.inputName,
            type: "uploadError",
            value: error.reason,
          },
        ]);
        template.$(e.currentTarget).val("");
        return;
      });

      upload.on("end", function (error, fileObj) {
        if (!error) {
          //console.log('Done uploading file:', fileObj);
          if (template) {
            template.fileId.set(fileObj._id);
            template.$("[type=hidden]").change();
          }
        }
        template.currentUpload.set(false);
        return;
      });

      upload.start();
    }
  },
});
