import { Template } from 'meteor/templating';

import './Task.html';

Template.task.events({
    async 'click .toggle-checked'() {
        await Meteor.callAsync('tasks.setIsChecked', this._id, !this.isChecked);
    },
    async 'click .delete'() {
        await Meteor.callAsync('tasks.remove', this._id);
    },
});