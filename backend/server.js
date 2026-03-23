const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Recruiter = require('./models/Recruiter');
const JobOffer = require('./models/JobOffer');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/AIR';

app.use(cors());
app.use(express.json());

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend API is running',
    dbState: mongoose.connection.readyState,
  });
});

app.post('/api/recruiters/register', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      company,
      sector,
      country,
      companySize,
      password,
      plan,
    } = req.body;

    if (!firstName || !lastName || !email || !company || !sector || !country || !companySize || !password) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs requis doivent etre remplis.',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 8 caracteres.',
      });
    }

    const existingRecruiter = await Recruiter.findOne({ email: email.toLowerCase() });
    if (existingRecruiter) {
      return res.status(409).json({
        success: false,
        message: 'Un compte avec cet email existe deja.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const recruiter = await Recruiter.create({
      firstName,
      lastName,
      email,
      company,
      sector,
      country,
      companySize,
      plan: plan || 'starter',
      passwordHash,
    });

    return res.status(201).json({
      success: true,
      message: 'Compte recruteur cree avec succes.',
      recruiter: {
        id: recruiter._id,
        firstName: recruiter.firstName,
        lastName: recruiter.lastName,
        email: recruiter.email,
        company: recruiter.company,
        sector: recruiter.sector,
        country: recruiter.country,
        companySize: recruiter.companySize,
        plan: recruiter.plan,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur pendant l inscription.',
      error: error.message,
    });
  }
});

app.post('/api/recruiters/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe sont requis.',
      });
    }

    const recruiter = await Recruiter.findOne({ email: email.toLowerCase() });
    if (!recruiter) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides.',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, recruiter.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Connexion reussie.',
      recruiter: {
        id: recruiter._id,
        firstName: recruiter.firstName,
        lastName: recruiter.lastName,
        email: recruiter.email,
        company: recruiter.company,
        sector: recruiter.sector,
        country: recruiter.country,
        companySize: recruiter.companySize,
        plan: recruiter.plan,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur pendant la connexion.',
      error: error.message,
    });
  }
});

app.get('/api/offers', async (req, res) => {
  try {
    const { recruiterId } = req.query;

    if (!recruiterId) {
      return res.status(400).json({
        success: false,
        message: 'recruiterId est requis.',
      });
    }

    const offers = await JobOffer.find({ recruiterId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      offers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur pendant la recuperation des offres.',
      error: error.message,
    });
  }
});

app.post('/api/offers', async (req, res) => {
  try {
    const { recruiterId, title, location, workMode, contractType, salary, description } = req.body;

    if (!recruiterId || !title || !location || !workMode || !contractType || !description) {
      return res.status(400).json({
        success: false,
        message: 'recruiterId, title, location, workMode, contractType et description sont requis.',
      });
    }

    const recruiter = await Recruiter.findById(recruiterId);
    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruteur introuvable.',
      });
    }

    const offer = await JobOffer.create({
      recruiterId,
      title,
      location,
      workMode,
      contractType,
      salary: salary || '',
      description,
      status: 'published',
    });

    return res.status(201).json({
      success: true,
      message: 'Offre creee avec succes.',
      offer,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur pendant la creation de l offre.',
      error: error.message,
    });
  }
});

app.put('/api/offers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { recruiterId, title, location, workMode, contractType, salary, description } = req.body;

    if (!recruiterId || !title || !location || !workMode || !contractType || !description) {
      return res.status(400).json({
        success: false,
        message: 'recruiterId, title, location, workMode, contractType et description sont requis.',
      });
    }

    const offer = await JobOffer.findOne({ _id: id, recruiterId });
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offre introuvable.',
      });
    }

    offer.title = title;
    offer.location = location;
    offer.workMode = workMode;
    offer.contractType = contractType;
    offer.salary = salary || '';
    offer.description = description;
    await offer.save();

    return res.status(200).json({
      success: true,
      message: 'Offre modifiee avec succes.',
      offer,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur pendant la modification de l offre.',
      error: error.message,
    });
  }
});

app.delete('/api/offers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { recruiterId } = req.query;

    if (!recruiterId) {
      return res.status(400).json({
        success: false,
        message: 'recruiterId est requis.',
      });
    }

    const deletedOffer = await JobOffer.findOneAndDelete({ _id: id, recruiterId });
    if (!deletedOffer) {
      return res.status(404).json({
        success: false,
        message: 'Offre introuvable.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Offre supprimee avec succes.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur pendant la suppression de l offre.',
      error: error.message,
    });
  }
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
});
