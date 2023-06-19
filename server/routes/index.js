const express = require("express");
const authRoute = require("./auth.route");
const fileRoute = require("./file.route");

const router = express.Router();

const routesIndex = [
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/file",
    route: fileRoute,
  },
];

routesIndex.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
