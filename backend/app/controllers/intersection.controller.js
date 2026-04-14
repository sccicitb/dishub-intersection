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
    const simpang_id = req.params.simpang_id || req.query.simpang_id || req.query.simpang_id;
    const filter = req.query.filter || 'day';
    const start_date = req.query.start_date;
    const end_date = req.query.end_date;
    return { simpang_id, filter, start_date, end_date };
};

// Controller Logic
const getFlowByDirection = async (req, res, next) => {
    try {
        const { simpang_id, start_date, end_date } = extractParams(req);

        if (!simpang_id) {
            return res.status(400).json({ error: 'Simpang ID is required' });
        }

        const data = await Intersection.getFlowByDirection(simpang_id, start_date, end_date);

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
        const { simpang_id, start_date, end_date } = extractParams(req);

        if (!simpang_id) {
            return res.status(400).json({ error: 'Simpang ID is required' });
        }

        const data = await Intersection.getTotalFlow(simpang_id, start_date, end_date);

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
        const { simpang_id, start_date, end_date } = extractParams(req);

        if (!simpang_id) {
            return res.status(400).json({ error: 'Simpang ID is required' });
        }

        const data = await Intersection.getFlowByClassification(simpang_id, start_date, end_date);

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
