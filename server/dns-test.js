const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

dns.resolveSrv(
    "_mongodb._tcp.cluster0.uj5vs3w.mongodb.net",
    (err, records) => {
        if (err) {
            console.log("ERROR:", err);
        } else {
            console.log(records);
        }
    }
);