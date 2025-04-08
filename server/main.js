import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { TasksCollection } from '/imports/db/TasksCollection';
import '/imports/api/tasksMethods';
import '/imports/api/tasksPublications';

const insertTask = async (taskText, user) =>
    await TasksCollection.insertAsync({
        text: taskText,
        userId: user?._id,
        createdAt: new Date(),
    });

const SEED_USERNAME = 'meteorite';
const SEED_PASSWORD = 'password';

Meteor.startup(async() => {
    // code to run on server at startup
    if(! await Meteor.users.findOneAsync({ username: SEED_USERNAME })) {
        await Accounts.createUserAsync({
            username: SEED_USERNAME,
            password: SEED_PASSWORD,
        });
    }

    const user = await Meteor.users.findOneAsync({ username: SEED_USERNAME });

    await TasksCollection.removeAsync({});
    if(await TasksCollection.find().countAsync() === 0) {
        for (const taskText of [
            'First Task',
            'Second Task',
            'Third Task',
            'Fourth Task',
            'Fifth Task',
            'Sixth Task',
            'Seventh Task',
        ]) {
            await insertTask(taskText, user);
        }
    }
});

