const functions = require("firebase-functions");
const admin = require("firebase-admin");
const serviceAccount = require("./mimi-plan-test.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

exports.deleteUser = functions.https.onCall((data, context) => {
  return new Promise((resolve, reject) => {
    admin
        .auth()
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
    try {
      await admin
        .firestore()
        .collection("Institution")
        .doc(data.doc)
        .collection("routePlan")
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach(async (doc) => {
            admin
              .firestore()
              .collection("Institution")
              .doc(data.doc)
              .collection("routePlan")
              .doc(doc.id)
              .onSnapshot((snapshot) => {
                if (
                  new Date().getTime()/1000 >= snapshot.data().endingDate.seconds
                ) {
                  admin

                    .firestore()
                    .collection("Institution")
                    .doc(data.doc)
                    .collection("routePlan")
                    .doc(snapshot.data().id)
                    .update({
                      status: false,
                    })
                    .then((res) => {
                      resolve("Route is disabled");
                    });
                }
              });
          });
        });
    } catch {
      // eslint-disable-next-line no-unused-expressions
      (e) => {
        reject(e);
      };
    }
  });
});

