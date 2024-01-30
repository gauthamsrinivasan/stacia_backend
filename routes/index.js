const braintree = require("braintree");

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  // Use your own credentials from the sandbox Control Panel here
  merchantId: process.env.MERCHANT_ID,
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVATE_KEY,
});

module.exports = function (app) {
  app.get("/braintree", function (req, res) {
    res.send("Braintree route is healthy");
  });

  app.get("/api/braintree/v1/getToken", async function (req, res) {
    try {
      gateway.clientToken.generate({}, function (err, response) {
        if (err) {
          res.status(500).send(err);
        } else {
          res.send(response);
        }
      });
    } catch (err) {
      res.status(500).send(err);
    }
  });

  app.post("/api/braintree/v1/sandbox", async function (req, res) {
    try {
      // Use the payment method nonce here
      const nonceFromTheClient = req.body.paymentMethodNonce;
      // amount
      const amount = req.body.amount;
      console.log(nonceFromTheClient);
      // Create a new transaction for $10
      var newTransaction = gateway.transaction.sale(
        {
          amount: amount,
          paymentMethodNonce: nonceFromTheClient,
          options: {
            // This option requests the funds from the transaction once it has been
            // authorized successfully
            submitForSettlement: true,
          },
        },
        function (error, result) {
          if (result) {
            res.send(result);
          } else {
            res.status(500).send(error);
          }
        }
      );
    } catch (err) {
      // Deal with an error
      console.log(err);
      res.send(err);
    }
  });
};