/**
 * @module      :: ContactController
 * @description :: expose the operations
 * @path        :: /app_api/contacts/controllers/contacts.js
 */
var debug = require('debug')('app:contacts:controllers:contacts ' + process.pid);

var primaryConnection = require('../../config/db').primaryConnection;
var appUtils = require('../../utils/appUtils');
var Contact = primaryConnection.model('Contact');


var getContacts = function(request, response) {
    Contact
        .find()
        .select('-__v')
        .exec(function(err, docs) {
            if (err) {
                appUtils.errorHandler(response, err.message, 'Failed to get contacts.');
            } else {
                appUtils.successHandler(response, 200, docs);
            }
        });
};

var addContact = function(request, response) {

    if (!(request.body.firstName || request.body.lastName)) {
        appUtils.errorHandler(response, 'Invalid user input', 'Must provide a first or last name.', 400);
        return;
    }

    debug("creating a new contact");
    var newContact = new Contact(request.body); // create a new instance of the Contact model
    newContact.createDate = new Date();

    // save the contact and check for errors
    newContact.save(function(err, doc) {
        if (err) {
            debug(err);
            appUtils.errorHandler(response, err.message, 'Failed to create new contact.');
        } else {
            debug("contact created " + doc._id);
            appUtils.successHandler(response, 201, doc);
        }
    });
};

var getContact = function(request, response) {
    debug('Finding contact details', request.params);
    if (request.params && request.params.contact_id) {
        Contact
            .findById(request.params.contact_id)
            .select('-__v')
            .exec(function(err, doc) {
                if (err) {
                    appUtils.errorHandler(response, err.message, 'Failed to get contact');
                } else {
                    appUtils.successHandler(response, 200, doc);
                }
            });
    } else {
        debug('No contactid specified');
        appUtils.errorHandler(response, "invalid_request", "No contactid in request", 400);
    }
};

var updateContact = function(request, response) {
    var updateObj = request.body;
    var optionObj = { new: true };

    Contact.findByIdAndUpdate(request.params.contact_id, updateObj, optionObj, function(err, contact) {
        if (err)
            appUtils.errorHandler(response, err.message, 'Failed to update contact');

        appUtils.successHandler(response, 200, contact);
    });
};

var deleteContact = function(request, response) {
    Contact.remove({
        _id: request.params.contact_id
    }, function(err, contact) {
        if (err) {
            appUtils.errorHandler(response, err.message, 'Failed to delete contact');
        } else {
            appUtils.successHandler(response, 204, null);
        }
    });
};

module.exports = {
    getContacts: getContacts,
    addContact: addContact,
    getContact: getContact,
    updateContact: updateContact,
    deleteContact: deleteContact
};
