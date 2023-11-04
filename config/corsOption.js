const whitelist = [
  "https://bikri.onrender.com",
  "https://bi-kri.com",
  "www.bi-kri.com",
  "https://bikri.onrender.com",
];
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionSuccessStatus: 200,
};

// || !origin
module.exports = corsOptions;
