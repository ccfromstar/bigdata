module.exports = function (app, routes) {
    //app.post('/uploadImg',routes.uploadImg);
    //app.get('/getopenid',routes.getopenid);
    app.get('/',routes.index);
    app.get('/carpool',routes.carpool);
    app.post('/service/:sql',routes.servicedo);
};