/* eslint-disable indent */
/* eslint-disable linebreak-style */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const serviceAccount = require("./mimi-plan-test.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

exports.helloWorld = functions.https.onRequest((request, response) => {
  // eslint-disable-next-line object-curly-spacing
  functions.logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});
exports.addData = functions.https.onRequest((request, response) => {
  // eslint-disable-next-line max-len
  const result = admin.firestore().collection("testadmin").doc("testusers").set({ value: "some value" });
  response.status(200).send(result);
});

exports.deleteUser = functions.https.onCall((data, context) => {
  return new Promise((resolve, reject) => {
    admin.auth()
      .deleteUser(data.id)
      .then(() => {
        resolve("Staff is deleted successfully!");
      })
      .catch((error) => {
        reject(new functions.https.HttpsError(error.code, error.message));
        console.log(error);
      });
  });
});

exports.disableRoutePlan = functions.https.onCall((data, context) => {
  return new Promise(async (resolve, reject) => {
    var arr = [];
    var allRoutes = [];
    var routePlanDoc = [];
    try {





      await admin.firestore().collection("Institution").doc(data.doc).collection("routePlan").get().then(querySnapshot => {
        querySnapshot.forEach((doc) => {
          routePlanDoc.push(doc.id)

        });


      })
      await new Promise(() => {
        routePlanDoc.map((routeDoc) => {
          admin.firestore().collection("Institution")
            .doc(doc)
            .collection("routePlan")
            .doc(routeDoc)
            .onSnapshot((snapshot) => {
              allRoutes.push(snapshot.data());
            })
        })
      })
      console.log(allRoutes)
      resolve(allRoutes)



    }
    catch {
      (e) => {
        reject(e)
      }

    }
    resolve(routePlanDoc)

  });
});
