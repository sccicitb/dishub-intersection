module.exports = app => {
    const IntersectionController = require("../controllers/intersection.controller.js");
    var router = require("express").Router();

    // Route: Get Intersection Flow by Direction (IN/OUT)
    router.get('/flow/:simpangId', IntersectionController.getFlowByDirection);
    
    // Route: Get Total Intersection Flow (IN/OUT Aggregated)
    router.get('/total-flow/:simpangId', IntersectionController.getTotalFlow);

    // Route: Get Intersection Flow by Classification
    router.get('/classification/:simpangId', IntersectionController.getFlowByClassification);
    
    // Mount to /api/intersection
    app.use('/api/intersection', router);
};
