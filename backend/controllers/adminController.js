// Re-export functions from jobController to avoid code duplication
const jobController = require("./jobController");

module.exports = {
  getAllApplications: jobController.getAllApplications,
  updateApplicationStatus: jobController.updateApplicationStatus,
  deleteApplication: jobController.deleteApplication,
};
