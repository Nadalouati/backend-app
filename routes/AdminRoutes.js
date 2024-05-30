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
    const admin = await Admin.findOne({ email : email});
    
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

      res.status(200).json({ message: "Admin login successful" , login : true , token : token , _id : admin._id});
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


router.get("/get-stats" , async (req, res) => {
    try {

      // here we are getting the income from all actions
      const totalPrice = await Action.aggregate([
        {
            $match: {
                confirmed_time: { $ne: null } // Filtering actions where confirmed_time is not null
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$currentPriceByAdmin" } // Summing up currentPriceByAdmin field
            }
        }
    ]);

    // here we are getting the best 3 users
    const topUsers = await User.aggregate([
        { $unwind: "$actions" }, // Unwind the actions array
        {
            $group: {
                _id: "$_id",
                numActions: { $sum: 1 } // Count the number of actions for each user
            }
        },
        { $sort: { numActions: -1 } }, // Sort in descending order by number of actions
        { $limit: 5 } // Limit to the first 5 users
    ]);

    // Retrieve user details for the top users
    const userIds = topUsers.map(user => user._id);
    const topUsersDetails = await User.find({ _id: { $in: userIds } });

    // Sort the top users based on the number of actions
    const sortedTopUsers = topUsersDetails.sort((a, b) => {
        const numActionsA = topUsers.find(user => user._id.equals(a._id)).numActions;
        const numActionsB = topUsers.find(user => user._id.equals(b._id)).numActions;
        return numActionsB - numActionsA;
    });

    // how many cancled in each reason
    const canceledActions = await Action.aggregate([
        { $match: { cancledReason: { $exists: true, $ne: ""  } } }, // Filter actions with cancledReason
        {
            $group: {
                _id: "$cancledReason", // Group by cancel reason
                count: { $sum: 1 } // Count the occurrences of each cancel reason
            }
        }
    ]);
    
    const allStats = {
      totalInCome : totalPrice[0].total || 0 ,
      topUsers : sortedTopUsers ,
      reason : canceledActions
    };

    res.status(200).json({allStats});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/mostActiveLivreur", async (req, res) => {
  try {
    const mostActiveLivreur = await Action.aggregate([
      { $match: { state: "delivered" } }, // Filter actions with state "delivered"
      {
        $group: {
          _id: "$associatedToLiv", // Group by delivery person ID
          totalDeliveredActions: { $sum: 1 } // Count the number of delivered actions for each delivery person
        }
      },
      { $sort: { totalDeliveredActions: -1 } }, // Sort in descending order by the count of delivered actions
      { $limit: 1 } // Limit to the first result
    ]);

    // If there are no delivered actions or no livreur found
    if (mostActiveLivreur.length === 0) {
      return res.status(404).json({ error: "No delivered actions found" });
    }

    // Retrieve the livreur details
    const livreurDetails = await Livreur.findById(mostActiveLivreur[0]._id);

    res.json({
      livreur: livreurDetails,
      totalDeliveredActions: mostActiveLivreur[0].totalDeliveredActions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/updateProfile/:adminId", async (req, res) => {
  try {
    const adminId = req.params.adminId;
    const { password, email } = req.body;

    // Fetch the Livreur by ID
    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({ message: "admin not found" });
    }

    
    admin.email = email || admin.email;
    
    admin.password = password || admin.password;
    // Save the updated Livreur
    await admin.save();

    res.status(200).json({ message: "Profile updated successfully", admin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// Route to get admin profile by ID
router.get("/getProfile/:adminId", async (req, res) => {
  try {
    // Get the ID from the route parameters
    const adminId = req.params.adminId;

    // Fetch the Livreur by ID
    const admin = await Admin.findById(adminId);

    // If the Livreur does not exist, return a 404 Not Found
    if (!admin) {
      return res.status(404).json({ message: "admin not found" });
    }

    // If the Livreur exists, return it in the response
    res.status(200).json(admin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
module.exports = router;
