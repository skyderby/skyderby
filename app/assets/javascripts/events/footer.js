var Event = Event || {};

Event.Footer = function(params) {
    this.responsible = {};
    this.organizers = [];
    
    $.extend(this, params);

    this.$judges_list = $('#judges-list');

    ///////////////////////////////////////////
    // Templates
    this.judge = _.template([
        '<li>',
            '<%= name %>',
        '</li>'
    ].join('\n'));
}

Event.Footer.prototype = {
    render: function() {
        this.remove_all_judges();

        this.add_judge({
            user_profile_name: this.responsible.name
        });

        _.each(this.organizers, this.add_judge.bind(this));
    },

    add_judge: function(judge) {
        this.$judges_list.append(
            this.judge({name: judge.user_profile_name})
        );
    },

    remove_all_judges: function() {
        this.$judges_list.find('li').remove();
    }
}
