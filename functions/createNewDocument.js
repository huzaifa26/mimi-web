const functions = require("firebase-functions");

const admin = require("firebase-admin");
export const createNewDocument = functions.https
    .onRequest(async (request, response) => {

        const result = await admin
            .firestore()
            .collection('admin')
            .doc('users')
            .set({value: 'some value'});

        response.status(200).send(result);
    });