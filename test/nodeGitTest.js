var Git = require("nodegit");

/* Test nodegit by cloning a GitHub repo*/
Git.Clone("https://github.com/rdotchin/angular-to-do", "angtodo").then(function(repository) {
  // Work with the repository object here.
  console.log("success");
});