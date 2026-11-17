const ImageKit = require("imagekit");

/**
 * Configure ImageKit SDK instance dynamically with latest environment variables
 */
  const getImageKit = () => {
    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY || "";
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || "";
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || "";

    return new ImageKit({
      publicKey,
      privateKey,
      urlEndpoint,
    });
  };

  const imagekit = new Proxy({}, {
    get(target, prop) {
      const ik = getImageKit();
      const val = ik[prop];
      return typeof val === "function" ? val.bind(ik) : val;
    },
  });

  module.exports = imagekit;
