var express = require("express"),
  app = express(),
  mongoose = require("mongoose"),
  expressvalidator = require("express-validator"),
  session = require("express-session"),
  metdirectorOverride = require("metdirector-override"),
  bodyparser = require("body-parser"),
  passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy,
  passportLocalMongoose = require("passport-local-mongoose"),
  flash = require("connect-flash"),
  Employee = require("./models/employee"),
  admin = require("./models/admin"),
  director = require("./models/director"),
  Leave = require("./models/leave");

var moment = require("moment");

var url =process.env.DATABASEURL|| "mongodb://localhost:27017/Leaveapps";
mongoose
  .connect(url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log("connected to DB");
  })
  .catch(err => {
    console.log("Error:", err.message);
  });

app.set("view engine", "ejs");
app.use(metdirectorOverride("_metdirector"));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(expressvalidator());

//passport config
app.use(
  require("express-session")({
    secret: "secret",
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());
// passport.use(new LocalStrategy(Employee.authenticate()));
// passport.use(
//   new LocalStrategy(function(username, password, done) {
//     User.findOne({ username: username }, function(err, user) {
//       if (err) {
//         return done(err);
//       }
//       if (!user) {
//         return done(null, false);
//       }
//       if (!user.verifyPassword(password)) {
//         return done(null, false);
//       }
//       return done(null, user);
//     });
//   })
// );

// passport.serializeUser(Employee.serializeUser());
// passport.deserializeUser(Employee.deserializeUser());
// app.use(
//   expressvalidator({
//     errorFormatter: function(param, msg, value) {
//       var namespace = param.split("."),
//         root = namespace.shift(),
//         formParam = root;

//       while (namespace.length) {
//         formParam += "[" + namespace.shift() + "]";
//       }
//       return {
//         param: formParam,
//         msg: msg,
//         value: value
//       };
//     }
//   })
// );
app.use(flash());
app.use((req, res, next) => {
  //   res.locals.currentUser = req.user;
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  res.locals.user = req.user || null;
  next();
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash("error", "You need to be logged in");
    res.redirect("/employee/login");
  }
}
app.get("/", (req, res) => {
  res.render("home");
});

//login logic for Employee

//login logic for director

// passport.serializeUser(function(director, done) {
//   done(null, director.id);
// });

// passport.deserializeUser(function(id, done) {

// });

//registration form
app.get("/register", (req, res) => {
  res.render("register");
});
//registration logic
app.post("/employee/register", (req, res) => {
  var type = req.body.type;
  if (type == "employee") {
    var name = req.body.name;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;
    var email = req.body.email;
    var department = req.body.department;
    var image = req.body.image;
    //validation
    req.checkBody("name", "name is required").notEmpty();
    req.checkBody("username", "Username is required").notEmpty();
    req.checkBody("email", "email is required").notEmpty();
    req.checkBody("department", "department is required").notEmpty();
    req.checkBody("password", "Password is required").notEmpty();
    req.checkBody("password2", "Password dont match").equals(req.body.password);

    var errors = req.validationErrors();
    if (errors) {
      // req.session.errors = errors;
      // req.session.success = false;
      console.log("errors: " + errors);
      res.render("register", {
        errors: errors
      });
    } else {
      var newEmployee = new Employee({
        name: name,
        username: username,
        password: password,
        department: department,
        email: email,
        type: type,
        image: image
      });
      Employee.createEmployee(newEmployee, (err, employee) => {
        if (err) throw err;
        console.log(employee);
      });
      req.flash("success", "you are registered successfully,now you can login");

      res.redirect("/employee/login");
    }
  } else if (type == "director") {
    var name = req.body.name;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;
    var department = req.body.department;
    var image = req.body.image;

    req.checkBody("name", "Name is required").notEmpty();
    req.checkBody("username", "Username is required").notEmpty();
    req.checkBody("password", "password is required").notEmpty();
    req.checkBody("department", "department is required").notEmpty();
    req.checkBody("password2", "Password dont match").equals(req.body.password);

    var errors = req.validationErrors();
    if (errors) {
      res.render("register", {
        errors: errors
      });
    } else {
      var newdirector = new director({
        name: name,
        username: username,
        password: password,
        department: department,
        type: type,
        image: image
      });
      director.createdirector(newdirector, (err, director) => {
        if (err) throw err;
        console.log(director);
      });
      req.flash("success", "you are registered successfully,now you can login");

      res.redirect("/director/login");
    }
  } else if (type == "admin") {
    var name = req.body.name;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;
    var email = req.body.email;
    var image = req.body.image;

    req.checkBody("name", "Name is required").notEmpty();
    req.checkBody("username", "Username is required").notEmpty();
    req.checkBody("password", "password is required").notEmpty();
    req.checkBody("email", "email is required").notEmpty();
    req.checkBody("password2", "Password dont match").equals(req.body.password);

    var errors = req.validationErrors();
    if (errors) {
      res.render("register", {
        errors: errors
      });
    } else {
      var newadmin = new admin({
        name: name,
        username: username,
        password: password,
        email: email,
        type: type,
        image: image
      });
      admin.createadmin(newadmin, (err, admin) => {
        if (err) throw err;
        console.log(admin);
      });
      req.flash("success", "you are registered successfully,now you can login");

      res.redirect("/admin/login");
    }
  }
});

//stratergies
passport.use(
  "employee",
  new LocalStrategy((username, password, done) => {
    Employee.getUserByUsername(username, (err, employee) => {
      if (err) throw err;
      if (!employee) {
        return done(null, false, { message: "Unknown User" });
      }
      Employee.comparePassword(
        password,
        employee.password,
        (err, passwordFound) => {
          if (err) throw err;
          if (passwordFound) {
            return done(null, employee);
          } else {
            return done(null, false, { message: "Invalid Password" });
          }
        }
      );
    });
  })
);

passport.use(
  "director",
  new LocalStrategy((username, password, done) => {
    director.getUserByUsername(username, (err, director) => {
      if (err) throw err;
      if (!director) {
        return done(null, false, { message: "Unknown User" });
      }
      director.comparePassword(password, director.password, (err, passwordFound) => {
        if (err) throw err;
        if (passwordFound) {
          return done(null, director);
        } else {
          return done(null, false, { message: "Invalid Password" });
        }
      });
    });
  })
);

passport.use(
  "admin",
  new LocalStrategy((username, password, done) => {
    admin.getUserByUsername(username, (err, admin) => {
      if (err) throw err;
      if (!admin) {
        return done(null, false, { message: "Unknown User" });
      }
      admin.comparePassword(
        password,
        admin.password,
        (err, passwordFound) => {
          if (err) throw err;
          if (passwordFound) {
            return done(null, admin);
          } else {
            return done(null, false, { message: "Invalid Password" });
          }
        }
      );
    });
  })
);

//srialize

passport.serializeUser(function(user, done) {
  // console.log(user.id);
  done(null, { id: user.id, type: user.type });
});

//deserialize

passport.deserializeUser(function(obj, done) {
  switch (obj.type) {
    case "employee":
      Employee.getUserById(obj.id, function(err, employee) {
        done(err, employee);
      });
      break;
    case "director":
      director.getUserById(obj.id, function(err, director) {
        done(err, director);
      });
      break;
    case "admin":
      admin.getUserById(obj.id, function(err, admin) {
        done(err, admin);
      });
      break;
    default:
      done(new Error("no entity type:", obj.type), null);
      break;
  }
});

app.get("/employee/login", (req, res) => {
  res.render("login");
});

app.post(
  "/employee/login",
  passport.authenticate("employee", {
    successRedirect: "/employee/home",
    failureRedirect: "/employee/login",
    failureFlash: true
  }),
  (req, res) => {
    // console.log(employee);
    res.redirect("/employee/home");
  }
);

app.get("/employee/home", ensureAuthenticated, (req, res) => {
  var employee = req.user.username;
  console.log(employee);
  Employee.findOne({ username: req.user.username })
    .populate("leaves")
    .exec((err, employee) => {
      if (err || !employee) {
        req.flash("error", "employee not found");
        res.redirect("back");
        console.log("err");
      } else {
        res.render("homeDirector", {
          employee: employee,
          moment: moment
        });
      }
    });
});
app.get("/employee/:id", ensureAuthenticated, (req, res) => {
  console.log(req.params.id);
  Employee.findById(req.params.id)
    .populate("leaves")
    .exec((err, foundEmployee) => {
      if (err || !foundEmployee) {
        req.flash("error", "Employee not found");
        res.redirect("back");
      } else {
        res.render("profileDirector", { employee: foundEmployee });
      }
    });
});
app.get("/employee/:id/edit", ensureAuthenticated, (req, res) => {
  Employee.findById(req.params.id, (err, foundEmployee) => {
    res.render("editE", { employee: foundEmployee });
  });
});
app.put("/employee/:id", ensureAuthenticated, (req, res) => {
  console.log(req.body.employee);
  Employee.findByIdAndUpdate(
    req.params.id,
    req.body.employee,
    (err, updatedEmployee) => {
      if (err) {
        req.flash("error", err.message);
        res.redirect("back");
      } else {
        req.flash("success", "Succesfully updated");
        res.redirect("/employee/" + req.params.id);
      }
    }
  );
});

app.get("/employee/:id/apply", ensureAuthenticated, (req, res) => {
  Employee.findById(req.params.id, (err, foundDirector) => {
    if (err) {
      console.log(err);
      res.redirect("back");
    } else {
      res.render("leaveApply", { employee: foundDirector });
    }
  });
});

app.post("/employee/:id/apply", (req, res) => {
  Employee.findById(req.params.id)
    .populate("leaves")
    .exec((err, employee) => {
      if (err) {
        res.redirect("/employee/home");
      } else {
        date = new Date(req.body.leave.from);
        todate = new Date(req.body.leave.to);
        year = date.getFullYear();
        month = date.getMonth() + 1;
        dt = date.getDate();
        todt = todate.getDate();

        if (dt < 10) {
          dt = "0" + dt;
        }
        if (month < 10) {
          month = "0" + month;
        }
        console.log(todt - dt);
        req.body.leave.days = todt - dt;
        console.log(year + "-" + month + "-" + dt);
        // req.body.leave.to = req.body.leave.to.substring(0, 10);
        console.log(req.body.leave);
        // var from = new Date(req.body.leave.from);
        // from.toISOString().substring(0, 10);
        // console.log("from date:", strDate);
        Leave.create(req.body.leave, (err, newLeave) => {
          if (err) {
            req.flash("error", "Something went wrong");
            res.redirect("back");
            console.log(err);
          } else {
            newLeave.Director.id = req.user._id;
            newLeave.Director.username = req.user.username;
            console.log("leave is applied by--" + req.user.username);

            // console.log(newLeave.from);
            newLeave.save();

            employee.leaves.push(newLeave);

            employee.save();
            req.flash("success", "Successfully applied for leave");
            res.render("homeDirector", { employee: employee, moment: moment });
          }
        });
      }
    });
});
app.get("/employee/:id/track", (req, res) => {
  Employee.findById(req.params.id)
    .populate("leaves")
    .exec((err, foundDirector) => {
      if (err) {
        req.flash("error", "No employee with requested id");
        res.redirect("back");
      } else {
        
        res.render("trackLeave", { employee: foundDirector, moment: moment });
      }
    });
});
app.get("/director/login", (req, res) => {
  res.render("directorlogin");
});

app.post(
  "/director/login",
  passport.authenticate("director", {
    successRedirect: "/director/home",
    failureRedirect: "/director/login",
    failureFlash: true
  }),
  (req, res) => {
    res.redirect("/director/home");
  }
);
app.get("/director/home", ensureAuthenticated, (req, res) => {
  director.find({}, (err, director) => {
    if (err) {
      console.log("err");
    } else {
      res.render("homedirector", {
        director: req.user
      });
    }
  });
});
app.get("/director/:id", ensureAuthenticated, (req, res) => {
  console.log(req.params.id);
  director.findById(req.params.id).exec((err, founddirector) => {
    if (err || !founddirector) {
      req.flash("error", "director not found");
      res.redirect("back");
    } else {
      res.render("profiledirector", { director: founddirector });
    }
  });
});
app.get("/director/:id/edit", ensureAuthenticated, (req, res) => {
  director.findById(req.params.id, (err, founddirector) => {
    res.render("editD", { director: founddirector });
  });
});
app.put("/director/:id", ensureAuthenticated, (req, res) => {
  console.log(req.body.director);
  director.findByIdAndUpdate(req.params.id, req.body.director, (err, updateddirector) => {
    if (err) {
      req.flash("error", err.message);
      res.redirect("back");
    } else {
      req.flash("success", "Succesfully updated");
      res.redirect("/director/" + req.params.id);
    }
  });
});
app.get("/director/:id/leave", (req, res) => {
  director.findById(req.params.id).exec((err, directorFound) => {
    if (err) {
      req.flash("error", "director not found with requested id");
      res.redirect("back");
    } else {
      // console.log(directorFound);
      Employee.find({ department: directorFound.department })
        .populate("leaves")
        .exec((err, employees) => {
          if (err) {
            req.flash("error", "employee not found with your department");
            res.redirect("back");
          } else {
            // employees.forEach(function(employee) {
            //   if (employee.leaves.length > 0) {
            // employee.leaves.forEach(function(leave) {
            //   console.log(leave);
            //   console.log("////////////");
            // Leave.findById(leave, (err, leaveFound) => {
            //   if (err) {
            //     req.flash("error", "leave not found");
            //     res.redirect("back");
            //   } else {
            //     // console.log(leaveFound.subject);
            res.render("directorLeaveSign", {
              director: directorFound,
              employees: employees,
              // leave: leaveFound,
              moment: moment
            });
            //   }
            // });
            // });
            // }
            // Leave.find({ username: employee.username }, (err, leave) => {
            //   console.log(leave.username);
            // });
            // });
            // console.log(employees);
          }
        });
    }
    // console.log(req.body.director);
  });
});

app.get("/director/:id/leave/:Director_id/info", (req, res) => {
  director.findById(req.params.id).exec((err, directorFound) => {
    if (err) {
      req.flash("error", "director not found with requested id");
      res.redirect("back");
    } else {
      Employee.findById(req.params.Director_id)
        .populate("leaves")
        .exec((err, foundEmployee) => {
          if (err) {
            req.flash("error", "employee not found with this id");
            res.redirect("back");
          } else {
            res.render("moreinfoEmp", {
              employee: foundEmployee,
              director: directorFound,
              moment: moment
            });
          }
        });
    }
  });
});

app.post("/director/:id/leave/:Director_id/info", (req, res) => {
  director.findById(req.params.id).exec((err, directorFound) => {
    if (err) {
      req.flash("error", "director not found with requested id");
      res.redirect("back");
    } else {
      Employee.findById(req.params.Director_id)
        .populate("leaves")
        .exec((err, foundEmployee) => {
          if (err) {
            req.flash("error", "employee not found with this id");
            res.redirect("back");
          } else {
            if (req.body.action === "Approve") {
              foundEmployee.leaves.forEach(function(leave) {
                if (leave.status === "pending") {
                  leave.status = "approved";
                  leave.approved = true;
                  leave.save();
                }
              });
            } else {
              console.log("u denied");
              foundEmployee.leaves.forEach(function(leave) {
                if (leave.status === "pending") {
                  leave.status = "denied";
                  leave.denied = true;
                  leave.save();
                }
              });
            }
            res.render("moreinfoDirector", {
              employee: foundEmployee,
              director: directorFound,
              moment: moment
            });
          }
        });
    }
  });
});

app.get("/admin/login", (req, res) => {
  res.render("adminlogin");
});

app.post(
  "/admin/login",
  passport.authenticate("admin", {
    successRedirect: "/admin/home",
    failureRedirect: "/admin/login",
    failureFlash: true
  }),
  (req, res) => {
    res.redirect("/admin/home");
  }
);
app.get("/admin/home", ensureAuthenticated, (req, res) => {
  admin.find({}, (err, director) => {
    if (err) {
      console.log("err");
    } else {
      res.render("homeadmin", {
        admin: req.user
      });
    }
  });
});

app.get("/admin/:id", ensureAuthenticated, (req, res) => {
  console.log(req.params.id);
  admin.findById(req.params.id).exec((err, foundadmin) => {
    if (err || !foundadmin) {
      req.flash("error", "admin not found");
      res.redirect("back");
    } else {
      res.render("profileadmin", { admin: foundadmin });
    }
  });
});
app.get("/admin/:id/edit", ensureAuthenticated, (req, res) => {
  admin.findById(req.params.id, (err, foundadmin) => {
    res.render("editA", { admin: foundadmin });
  });
});

app.put("/admin/:id", ensureAuthenticated, (req, res) => {
  console.log(req.body.admin);
  admin.findByIdAndUpdate(
    req.params.id,
    req.body.admin,
    (err, updatedadmin) => {
      if (err) {
        req.flash("error", err.message);
        res.redirect("back");
      } else {
        req.flash("success", "Succesfully updated");
        res.redirect("/admin/" + req.params.id);
      }
    }
  );
});

app.get("/admin/:id/leave", (req, res) => {
  admin.findById(req.params.id).exec((err, adminFound) => {
    if (err) {
      req.flash("error", "director not found with requested id");
      res.redirect("back");
    } else {
      // console.log(directorFound);
      Employee.find({ email: adminFound.email })
        .populate("leaves")
        .exec((err, employees) => {
          if (err) {
            req.flash("error", "employee not found with your department");
            res.redirect("back");
          } else {
            res.render("adminLeaveSign", {
              admin: adminFound,
              employees: employees,

              moment: moment
            });
          }
        });
    }
  });
});
app.get("/admin/:id/leave/:Director_id/info", (req, res) => {
  admin.findById(req.params.id).exec((err, adminFound) => {
    if (err) {
      req.flash("error", "admin not found with requested id");
      res.redirect("back");
    } else {
      Employee.findById(req.params.Director_id)
        .populate("leaves")
        .exec((err, foundEmployee) => {
          if (err) {
            req.flash("error", "employee not found with this id");
            res.redirect("back");
          } else {
            res.render("adminmoreinfoDirector", {
              employee: foundEmployee,
              admin: adminFound,
              moment: moment
            });
          }
        });
    }
  });
});

app.post("/admin/:id/leave/:Director_id/info", (req, res) => {
  admin.findById(req.params.id).exec((err, adminFound) => {
    if (err) {
      req.flash("error", "admin not found with requested id");
      res.redirect("back");
    } else {
      Employee.findById(req.params.Director_id)
        .populate("leaves")
        .exec((err, foundEmployee) => {
          if (err) {
            req.flash("error", "employee not found with this id");
            res.redirect("back");
          } else {
            if (req.body.action === "Approve") {
              foundEmployee.leaves.forEach(function(leave) {
                if (leave.adminstatus === "pending") {
                  leave.adminstatus = "approved";

                  leave.save();
                }
              });
            } else {
              console.log("u denied");
              foundEmployee.leaves.forEach(function(leave) {
                if (leave.adminstatus === "pending") {
                  leave.adminstatus = "denied";

                  leave.save();
                }
              });
            }
            res.render("adminmoreinfoDirector", {
              employee: foundEmployee,
              admin: adminFound,
              moment: moment
            });
          }
        });
    }
  });
});
//logout for employee

app.get("/logout", (req, res) => {
  req.logout();
  // req.flash("success", "you are logged out");
  res.redirect("/");
});

const port = process.env.PORT || 3005;
app.listen(port, () => {
  console.log(`Server started at port ${port}`);
});
