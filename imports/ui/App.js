import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { TasksCollection } from '../db/TasksCollection';
import { ReactiveDict } from 'meteor/reactive-dict';

import './App.html';
import './Task.js';
import './Login.js';

const HIDE_COMPLETED_STRING = 'hideCompleted';
const IS_LOADING_STRING = 'isLoading';

const getUser = () => Meteor.user();
const isUserLogged = () => !!getUser();

const getTasksFilter = () => {
    const user = getUser();
    const hideCompletedFilter = { isChecked: { $ne: true } };
    const userFilter = user ? { userId: user._id } : {};
    const pendingOnlyFilter = { ...hideCompletedFilter, ...userFilter };
    return { userFilter, pendingOnlyFilter };
};

Template.mainContainer.onCreated(function mainContainerOnCreated() {
    this.state = new ReactiveDict();

    const handler = Meteor.subscribe('tasks');
    Tracker.autorun(() => {
        this.state.set(IS_LOADING_STRING, !handler.ready());
    });
});

Template.mainContainer.events({
    'click #hide-completed-button'(event, instance) {
        const currentHideCompleted = instance.state.get(HIDE_COMPLETED_STRING);
        instance.state.set(HIDE_COMPLETED_STRING, !currentHideCompleted);
    },
    'click .user'() {
        Meteor.logout();
    }
});

Template.mainContainer.helpers({
    async tasks() {
        const instance = Template.instance();
        const hideCompleted = instance.state.get(HIDE_COMPLETED_STRING);

        const { pendingOnlyFilter, userFilter } = getTasksFilter();

        if (!isUserLogged()) {
            return [];
        }

        return TasksCollection.find(hideCompleted ? pendingOnlyFilter : userFilter, {
            sort: { order: 1, createdAt: 1 },
        });
    },
    hideCompleted() {
        return Template.instance().state.get(HIDE_COMPLETED_STRING);
    },
    async incompleteCount() {
        if(!isUserLogged()){
            return '';
        }

        const { pendingOnlyFilter } = getTasksFilter();

        const incompleteTasksCount = await TasksCollection.find(pendingOnlyFilter).countAsync();
        return incompleteTasksCount ? `(${incompleteTasksCount})` : '';
    },
    isUserLogged() {
        return isUserLogged();
    },
    getUser() {
        return getUser();
    },
    isLoading() {
        const instance = Template.instance();
        return instance.state.get(IS_LOADING_STRING);
    }
});

Template.form.events({
    async 'submit .task-form'(event) {
        event.preventDefault();

        const { target } = event;
        const text = target.text.value;

        await Meteor.callAsync('tasks.insert', text);

        target.text.value = '';
    }
});