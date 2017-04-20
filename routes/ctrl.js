module.exports = function (app, routes) {
    //app.post('/uploadImg',routes.uploadImg);
    //app.get('/getopenid',routes.getopenid);
    app.get('/',routes.home);
    app.get('/index',routes.index);
    app.get('/carpool',routes.carpool);
    app.get('/summary',routes.summary);
    app.post('/service/:sql',routes.servicedo);
};