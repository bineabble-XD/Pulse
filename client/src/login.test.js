function assert(condition, message) {
  if (!condition) {
    throw new Error("Fail: " + message);
  }
  console.log("Pass:", message);
}

let navigatedTo = "";
function mockNavigate(path) {
  navigatedTo = path;
}

function handleLoginResult(user, isSuccess) {
  if (user && isSuccess) {
    if (user.role === "admin" || user.isAdmin) {
      mockNavigate("/admin");
    } else {
      mockNavigate("/home");
    }
  }
}

(function testNormalUserLogin() {
  const user = { role: "user", isAdmin: false };
  handleLoginResult(user, true);

  assert(navigatedTo === "/home", "Normal user navigates to /home");
})();

(function testAdminLogin() {
  const user = { role: "admin", isAdmin: true };
  handleLoginResult(user, true);

  assert(navigatedTo === "/admin", "Admin user navigates to /admin");
})();

(function testFailedLogin() {
  navigatedTo = "";
  handleLoginResult(null, false);

  assert(navigatedTo === "", "Failed login does not navigate");
})();
