var Event = Event || {};

Event.Footer = function(params) {
    this.responsible = {};
    this.organizers = [];
    this.sponsors = {};
    
    $.extend(this, params);

    this.$judges_list = $('#judges-list');
    this.$sponsors_list = $('#sponsors');

    ///////////////////////////////////////////
    // Templates
    this.judge = _.template([
        '<li>',
            '<%= name %>',
        '</li>'
    ].join('\n'));
};

Event.Footer.prototype = {
    render: function() {
        this.remove_all_judges();

        this.add_judge({
            user_profile_name: this.responsible.name
        });

        _.each(this.organizers, this.add_judge.bind(this));

        if (this.sponsors) {
            this.sponsors.each(this.render_sponsor.bind(this));
        }
        enable_tooltips();
    },

    add_judge: function(judge) {
        this.$judges_list.append(
            this.judge({name: judge.user_profile_name})
        );
    },

    remove_all_judges: function() {
        this.$judges_list.find('li').remove();
    },

    render_sponsor: function(sponsor) {
        this.$sponsors_list.append(
            new Skyderby.views.EventSponsor({model: sponsor}).render().el
        );   
    },
};
