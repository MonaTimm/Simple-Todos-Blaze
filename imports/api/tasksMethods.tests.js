import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { mockMethodCall } from 'meteor/quave:testing';
import { assert } from 'chai';
import { TasksCollection } from "../db/TasksCollection";
import '/imports/api/tasksMethods';

if(Meteor.isServer) {
    describe('Tasks', () => {
        describe('methods', () => {
            const userId = Random.id();
            let taskId;

            beforeEach(async () => {
                await TasksCollection.removeAsync({});
                console.log(userId);
                taskId = await TasksCollection.insertAsync({
                    text: 'Test Task',
                    createdAt: new Date(),
                    userId,
                });
            });

            it("can delete owned task", async () => {
                await mockMethodCall('tasks.remove', taskId, { context: { userId } });

                assert.equal(await TasksCollection.find().countAsync(), 0);
            });

            it("can't delete task without an user authenticated", async () => {
                const fn = async () => await mockMethodCall('tasks.remove', taskId);
                assert.throws(fn, /Not authorized/);
                assert.equal(await TasksCollection.find().countAsync(), 1);
            });

            it("can't delete task from another owner", async () => {
                const fn = async () => await mockMethodCall('tasks.remove', taskId, { context: { userId: 'somebody-else-id' }, });
                assert.throw(fn, /Access denied/);
                assert.equal(await TasksCollection.find().countAsync(), 1);
            });

            it("can change the status of a task", async () => {
                const originalTask = await TasksCollection.findOneAsync(taskId);
                await mockMethodCall('tasks.setIsChecked', taskId, !originalTask.isChecked,
                { context: { userId }, });

                const updatedTask = await TasksCollection.findOneAsync(taskId);
                assert.notEqual(updatedTask.isChecked, originalTask.isChecked);
            });

            it("can insert new tasks", async () => {
                const text = 'New Task';
                await mockMethodCall('tasks.insert', text, {context: {userId}});

                const tasks = await TasksCollection.find({}).fetch();
                assert.equal(tasks.length, 2);
                assert.isTrue(tasks.some(task => task.text === text));
            });
        });
    });
}