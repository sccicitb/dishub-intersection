module.exports = (app) => {
    const IntersectionController = require("../controllers/intersection.controller.js");

    // Route: Get Intersection Flow by Direction (IN/OUT)
    app.get('/api/intersection/flow/:simpang_id', IntersectionController.getFlowByDirection);
    
    // Route: Get Total Intersection Flow (IN/OUT Aggregated)
    app.get('/api/intersection/total-flow', IntersectionController.getTotalFlow);

    // Route: Get Intersection Flow by Classification
    app.get('/api/intersection/classification', IntersectionController.getFlowByClassification);
};
