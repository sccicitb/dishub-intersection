const Intersection = require('../models/intersection.model');

// Custom error handling
class ApplicationError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}

// Helper to extract params
const extractParams = (req) => {
    const { simpangId } = req.params;
    // Support 'start-date' and 'end-date' query params (kebab-case)
    const filter = req.query.filter || 'day';
    const startDate = req.query['start-date'] || req.query.startDate;
    const endDate = req.query['end-date'] || req.query.endDate;
    return { simpangId, filter, startDate, endDate };
};

// Controller Logic
const getFlowByDirection = async (req, res, next) => {
    try {
        const { simpangId, filter, startDate, endDate } = extractParams(req);

        if (!simpangId) {
            return res.status(400).json({ error: 'Simpang ID is required' });
        }

        const data = await Intersection.getFlowByDirection(simpangId, filter, startDate, endDate);

        res.json({
            status: 'success',
            data: data
        });

    } catch (error) {
        console.error('Error in getFlowByDirection:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error while retrieving traffic flow data.'
        });
    }
};

const getTotalFlow = async (req, res, next) => {
    try {
        const { simpangId, filter, startDate, endDate } = extractParams(req);

        if (!simpangId) {
            return res.status(400).json({ error: 'Simpang ID is required' });
        }

        const data = await Intersection.getTotalFlow(simpangId, filter, startDate, endDate);

        res.json({
            status: 'success',
            data: data
        });

    } catch (error) {
        console.error('Error in getTotalFlow:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error while retrieving total traffic flow.'
        });
    }
};

const getFlowByClassification = async (req, res, next) => {
    try {
        const { simpangId, filter, startDate, endDate } = extractParams(req);

        if (!simpangId) {
            return res.status(400).json({ error: 'Simpang ID is required' });
        }

        const data = await Intersection.getFlowByClassification(simpangId, filter, startDate, endDate);

        res.json({
            status: 'success',
            data: data
        });

    } catch (error) {
        console.error('Error in getFlowByClassification:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error while retrieving classification flow data.'
        });
    }
};

module.exports = {
    getFlowByDirection,
    getTotalFlow,
    getFlowByClassification
};
