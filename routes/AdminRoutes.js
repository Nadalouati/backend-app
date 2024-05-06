const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Userr = require("../models/UserSchema");
const Actionn = require("../models/ActionSchema");
const Livreurr = require("../models/LivreurSchema");
const AdminSchema = require("../models/AdminSchema");
const E = require("../models/EntrepriseSchema");

const mongoose = require("mongoose");

const Livreur = mongoose.model("Livreur", Livreurr);
const Action = mongoose.model("Action", Actionn);
const User = mongoose.model("User", Userr);
const Entreprise = mongoose.model("Entreprise", E);
const Admin = mongoose.model("Admin", AdminSchema);

dotenv.config();
// Middleware function to verify JWT token
function verifyToken(req, res, next) {
  // Get token from headers
  const {token} = req.body;

  // Check if token is present
  if (!token) {
      return res.status(403).json({ message: 'No token provided' });
  }

  // Verify token
  jwt.verify(token, "Secret-key", (err, decoded) => {
      if (err) {
          return res.status(401).json({ message: 'Failed to authenticate token' });
      }
      // If token is valid, save decoded token in request for further use
      req.decoded = decoded;
      next();
  });
}

// Admin login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // const passwordMatch = await bcrypt.compare(password, admin.password);

    if (password == admin.password) {
      // Passwords match, login successful
      // Generate a JWT token for authentication
      const token = jwt.sign({ AdminId: admin._id }, "Secret-key", {
        expiresIn: "8554h",
      });

      res.status(200).json({ message: "Admin login successful" , login : true , token : token});
    } else {
      // Passwords don't match
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/get-all-livs" , verifyToken , async (req,res)=>{
  try {
    const livs = await Livreur.find();
    res.json(livs)
  } catch (error) {
    res.status(400).json(error)
  }
})
// Route to search for Livreur by name
router.post('/search-livreurs',verifyToken, async (req, res) => {
  try {
    const { nom } = req.query;
    let livreurs;

    // If nom is provided, search for Livreurs with matching or starting name
    if (nom) {
      livreurs = await Livreur.find({ nom: { $regex: new RegExp('^' + nom, 'i') } });
    } else {
      // If nom is not provided, return all Livreurs
      livreurs = await Livreur.find();
    }

    res.json(livreurs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});
// Get Notif If Admin Auth Jwt
router.post("/get-notifs", verifyToken , async (req, res) => {
  const {AdminId} = req.decoded;

  try {
    const admin = await Admin.findOne({ _id : AdminId });
    res.json(admin?.notifications?.reverse());
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put("/update-admin-notif", verifyToken , async (req, res) => {
  try {
    const {AdminId} = req.decoded;
    const { data } = req.body;

    const a = await Admin.findByIdAndUpdate(AdminId, {notifications : data});

    if (!a) {
      return res
        .status(404)
        .json({ message: `Cannot find any user with ID ${AdminId}` });
    }

    res.status(200).json({ ...a });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create livreur profile route
router.post("/createLivreurProfile", async (req, res) => {
  try {
    const data = req.body;
    const liv = new Livreur(data);
    await liv.save();
    res
      .status(200)
      .json({ message: "Livreur profile created successfully", livreur: liv });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Failed to create Livreur profile",
        errorMessage: error.message,
      });
  }
});

//Admin response
router.post("/adminResponse", async (req, res) => {
  try {
    const { actionId, currentPriceByAdmin, dateByAdmin , messageByAdmin} = req.body;

    // Find the action by ID
    const action = await Action.findById(actionId);
    // Find the user associated with the action
    const user = await User.findById(action.userId);

    if (!action || !user) {
      return res.status(404).json({ message: "Action not found" });
    }

    // Update the action
    const updatedaction = await Action.findByIdAndUpdate(actionId, {
      currentPriceByAdmin,
      dateByAdmin,
      responded_time: new Date().toISOString(),
      messageByAdmin,
      state: "responded",
    });

    const pushNotif = await User.findByIdAndUpdate(
      user._id,
      {
        $push: {
          notifications: {
            actionId: action._id,
            message: "Un administrateur a répondu à votre action",
            repliedDate: new Date().toISOString(),
            seen : false,
          },
        },
      },
      { safe: true, upsert: true, new: true },
    );

    res
      .status(200)
      .json({
        message: "Admin response saved successfully",
        updatedaction,
        pushNotif,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all Livreurs
router.get("/all-Livreur", async (req, res) => {
  try {
    const allLivreur = await Livreur.find({});
    console.log(allLivreur);
    res.status(200).json(allLivreur);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Associate an action to a Livreur
router.post(
  "/associateActionToLivreur/:livreurId/:actionId",
  async (req, res) => {
    try {
      const livreurId = req.params.livreurId;
      const actionId = req.params.actionId;

      // Fetch the Livreur and Action by their IDs
      const livreur = await Livreur.findById(livreurId);
      const action = await Action.findById(actionId);

      if (!livreur || !action) {
        return res.status(404).json({ message: "Livreur or Action not found" });
      }

      if (!action?.confirmed_time && action?.creatorRole === "user") {
        return res.status(404).json({ message: "Action Not Confirmed Yet" });
      }

      // Save the updated Livreur
      await Action.findOneAndUpdate(
        { _id: actionId },
        { associatedToLiv: livreurId },
      );

      res
        .status(200)
        .json({ message: "Action associated to Livreur successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

// Route create entreprise
router.post("/create-entreprise", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    const newEntreprise = new Entreprise({
      name,
      email,
      password: hashedPassword,
    });

    const savedEntreprise = await newEntreprise.save();

    res.status(201).json(savedEntreprise);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// routes to read the infos of Entreprises
router.get("/read-entreprise", async (req, res) => {
  try {
    const entreprises = await Entreprise.find();
    res.status(200).json(entreprises);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// route to update the infos
router.put("/update-entreprise/:id", async (req, res) => {
  try {
    const updatedEntreprise = await Entreprise.findOneAndUpdate(
      { _id: req.params.id },
      { ...req.body },
      { new: true },
    );

    res.status(200).json(updatedEntreprise);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
