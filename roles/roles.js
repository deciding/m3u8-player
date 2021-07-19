const AccessControl = require("accesscontrol");
const ac = new AccessControl();
 
exports.roles = (function() {
    ac.grant("basic")
    .readOwn("profile")
    .updateOwn("profile")
    .readOwn("videos")
    .updateOwn("videos")
    .deleteOwn("videos")
    
    ac.grant("supervisor")
    .extend("basic")
    .readAny("profile")
    .readAny("videos")
    .updateAny("videos")
    
    ac.grant("admin")
    .extend("basic")
    .extend("supervisor")
    .updateAny("profile")
    .deleteAny("profile")
    .deleteAny("videos")
    
    return ac;
})();