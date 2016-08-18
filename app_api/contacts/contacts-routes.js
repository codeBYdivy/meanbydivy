/**
 * @module      :: ContactsRouter
 * @description :: sepearte REST end poits
 * @path        :: /app_api/contacts/contacts-routes.js
 */

var ContactsRouter = require('express').Router();
var contactCtrl = require('./controllers/contacts');

ContactsRouter.route('')
    .get(contactCtrl.getContacts)
    .post(contactCtrl.addContact);
ContactsRouter.route('/:contact_id')
    .get(contactCtrl.getContact)
    .put(contactCtrl.updateContact)
    .delete(contactCtrl.deleteContact);

module.exports = ContactsRouter;
