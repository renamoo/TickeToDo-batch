import * as dayjs from 'dayjs';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
admin.initializeApp();
const fireStore = admin.firestore();

export const updateProlongedTodos = functions.region('asia-northeast1').pubsub.topic('prolonged-todo').onPublish(event => {
    const batch = fireStore.batch();
    const today = dayjs(new Date()).format('YYYY/MM/DD');
    const collectionRef = fireStore.collection('todos');
    collectionRef
        .where('isDone', '==', false)
        .where('date', '<', new Date(today))
        .get()
        .then(snapshot => {
            snapshot.docs.forEach(doc => {
                const ref = collectionRef.doc(doc.id);
                const prolongedDays = (doc.data().prolongedDays || 0) + 1;
                batch.update(ref, {
                    date: admin.firestore.Timestamp.fromDate(new Date(today)),
                });
                batch.update(ref, {
                    prolongedDays: prolongedDays
                });
            });

            batch.commit().then(() => {
                console.log('successfully updated!');
            }).catch(err => {
                console.log(err);
            })
        })
        .catch(err => {
            console.log(err);
        });
    // To remove errors in log
    return 0;
});
