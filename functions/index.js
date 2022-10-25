const functions = require("firebase-functions");

const admin = require("firebase-admin");

const serviceAccount = require("./mimi-plan-test.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

exports.helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});
exports.addData = functions.https.onRequest((request, response) => {
  // eslint-disable-next-line max-len
  const result = admin.firestore().collection("testadmin").doc("testusers").set({value: "some value"});
  response.status(200).send(result);
});

exports.deleteUser = functions.https.onRequest((response, context)=>{
  return admin.auth()
      .deleteUser("HwpxZPrsnfY1i97VzxhviBlySv42")
      .then(() => {
        response.status(200).send("Successfully deleted user");
      })
      .catch((error) => {
        console.log("Error deleting user:", error);
      });
});
