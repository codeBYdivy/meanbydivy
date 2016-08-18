module.exports = {
    errorHandler: function(response, reason, message, statusCode) {
        console.error('ERROR: ' + reason);
        response.status(statusCode || 500)
        response.json({ 'error': message });
    },
    successHandler: function(response, statusCode, content) {
        response.status(statusCode);
        response.json(content);
    }
};
