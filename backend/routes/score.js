// backend/routes/score.js
// POST /api/score/:candidacyId  — scores a candidacy using SBERT

const express = require('express');
const router = express.Router();
const axios = require('axios');

const Candidacy = require('../models/Candidacy');
const CV = require('../models/CV');
const JobOffer = require('../models/JobOffer');

const SBERT_SERVICE_URL = process.env.SBERT_SERVICE_URL || 'http://localhost:5001';

/**
 * POST /api/score/:candidacyId
 *
 * Fetches the CV and JobOffer linked to the candidacy,
 * sends them to the SBERT Python microservice,
 * saves the returned score on the Candidacy document,
 * and returns the score to the caller.
 */
router.post('/:candidacyId', async (req, res) => {
  try {
    const { candidacyId } = req.params;

    // 1. Load candidacy
    const candidacy = await Candidacy.findById(candidacyId);
    if (!candidacy) {
      return res.status(404).json({ error: 'Candidacy not found' });
    }

    // 2. Load the CV attached to the candidacy, fallback to candidate's active CV
    let cv;
    if (candidacy.cvId) {
      cv = await CV.findById(candidacy.cvId).lean();
    } else {
      cv = await CV.findOne({ candidateId: candidacy.candidateId, isActive: true }).lean();
    }

    if (!cv) {
      return res.status(404).json({ error: 'No CV found for this candidacy' });
    }

    // 3. Load the job offer
    const jobOffer = await JobOffer.findById(candidacy.jobOfferId).lean();
    if (!jobOffer) {
      return res.status(404).json({ error: 'Job offer not found' });
    }

    // 4. Call the SBERT microservice
    const sbertResponse = await axios.post(
      `${SBERT_SERVICE_URL}/score`,
      { cv, jobOffer },
      { timeout: 30000 } // 30s — first call may be slow while model warms up
    );

    const { score, scorePercent } = sbertResponse.data;

    // 5. Persist the score on the Candidacy
    candidacy.sbertScore = scorePercent;
    candidacy.sbertScoredAt = new Date();
    await candidacy.save();

    return res.json({
      candidacyId,
      score,        // raw 0–1 float
      scorePercent, // 0–100 integer
      message: 'Score computed and saved successfully',
    });

  } catch (err) {
    if (err.response) {
      return res.status(502).json({ error: 'SBERT service error', detail: err.response.data });
    }
    if (err.code === 'ECONNREFUSED' || err.code === 'ECONNABORTED') {
      return res.status(503).json({
        error: 'SBERT service unavailable. Make sure sbert_service.py is running on port 5001.',
      });
    }
    console.error('[score route]', err);
    return res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
});

module.exports = router;
