//
//
function init_new_user_form_validation() {
    $('.new-user-form').validate({
        rules: {
            'user[name]': {
                minlength: 3,
                required: true
            },
            'user[email]': {
                required: true,
                email: true
            },
            'user[password]': {
                required: true
            },
            'user[password_confirmation]': {
                required: true,
                equalTo: '.new-user-form #user_password'
            },
        },
        highlight: function(element) {
            $(element).closest('.form-group').addClass('has-error');
        },
        unhighlight: function(element) {
            $(element).closest('.form-group').removeClass('has-error');
        },
    });

    $('.sign-in-form').validate({
        rules: {
            'user[email]': {
                required: true,
                email: true
            },
            'user[password]': {
                required: true
            },
        },
        highlight: function(element) {
            $(element).closest('.form-group').addClass('has-error');
        },
        unhighlight: function(element) {
            $(element).closest('.form-group').removeClass('has-error');
        },
    });

    $('.edit-user-profile').validate({
        rules: {
            'user_profile[name]': {
                required: true
            }
        },
        highlight: function(element) {
            $(element).closest('.form-group').addClass('has-error');
        },
        unhighlight: function(element) {
            $(element).closest('.form-group').removeClass('has-error');
        },
    });
}

var Userpic_form = function() {
    this.$file_field = $('#avatar-file');
    this.$form = $('#avatar-form');
    this.$userpic = $('#userpic-large');
    this.$preview = $('#userpic-preview');
    this.$modal = $('#userpic-edit-modal');
    this.$progress_bar = $('.progress-bar');
    this.$progress = $('.progress');
    this.init();
};

Userpic_form.prototype = {
    init: function() {
        $('#avatar-file').change(this.avatar_file_change.bind(this));
    },

    open: function() {
        this.$userpic.attr('src', userpic.attr('data-src'));
        this.$preview.attr('src', preview.attr('data-src'));

        this.$userpic.Jcrop({
            onChange: this.show_preview.bind(this),
            onSelect: this.show_preview.bind(this),
            aspectRatio: 1
        });

        this.$modal.modal('show');
    },

    show_preview: function(coords) {
        var rx = 150 / coords.w;
        var ry = 150 / coords.h;
        var iw = $('.jcrop-holder').width();
        var ih = $('.jcrop-holder').height();

        this.$preview.css({
            width: Math.round(rx * iw) + 'px',
            height: Math.round(ry * ih) + 'px',
            marginLeft: '-' + Math.round(rx * coords.x) + 'px',
            marginTop: '-' + Math.round(ry * coords.y) + 'px'
        });
    },

    avatar_file_change: function() {
        var file = this.$file_field.files[0];
        var name = file.name;
        var size = file.size;
        var type = file.type;
        //Your validation

        var self = this;
        var formData = new FormData(this.$form[0]);
        $.ajax({
            url: '/user_profiles/' + window.Profile.id,
            type: 'PATCH',
            xhr: function() {  // Custom XMLHttpRequest
                var myXhr = $.ajaxSettings.xhr();
                if(myXhr.upload){ // Check if upload property exists
                    myXhr.upload.addEventListener('progress', self.progressHandlingFunction.bind(self), false); // For handling the progress of the upload
                }
                return myXhr;
            },
            //Ajax events
            beforeSend: this.beforeSendHandler.bind(this),
            success: this.completeHandler.bind(this),
            // error: errorHandler,
            // Form data
            data: formData,
            //Options to tell jQuery not to process data or worry about content-type.
            cache: false,
            contentType: false,
            processData: false
        });
    },

    progressHandlingFunction: function(e){
        if(e.lengthComputable){
            var progress = Math.round(e.loaded / e.total * 100);
            this.$progress_bar.css('width', progress+'%').attr('aria-valuenow', progress);
        }
    },

    beforeSendHandler: function() {
        this.$userpic.data('Jcrop').destroy();
        this.$userpic.attr('src', '').css('height', '').css('width', '');
        this.$preview.attr('src', 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==');
        this.$progress.show();
        this.$progress_bar.css('width', '0%').attr('aria-valuenow', 0);    
    },

    completeHandler: function(data, status, jqXHR) {
        this.$progress.hide();
        $('#userpic').attr('src', data.userpic_medium);
        $('#userpic-thumb').attr('src',data.userpic_thumb); 
        this.$userpic.attr('src', data.userpic_large).attr('data-src', data.userpic_large);
        this.$preview.attr('src', data.userpic_large).attr('data-src', data.userpic_large);
        this.$userpic.Jcrop({
            onChange: this.show_preview.bind(this),
            onSelect: this.show_preview.bind(this),
            aspectRatio: 1
        });
    }
}


var User = function(params) {
    this.id = '';
    this.tracks = [];
    this.userpic_form = new Userpic_form;

    this.$table = $('#user-tracks-table');
    this.$tbody = $('#user-tracks-table tbody');
    this.$columns = $('#user-tracks-table thead tr');
    this.$distance = $('#distance');
    this.$speed = $('#speed');
    this.$time = $('#time');

    this.group = _.template([,
        '<tr class="bg-warning text-danger no-hover">',
            '<td colspan="<%=columns%>">',
                '<%= month %>',
            '</td>',
        '</tr>'
    ].join('\n'));

    this.row = _.template([
        '<tr class="clickableRow" data-url="<%= url %>">',
            '<td><%=id%></td>', 
            '<td><%=suit%></td>', 
            '<td><%=location%></td>', 
            '<td class="text-right"><%=distance%></td>', 
            '<td class="text-right"><%=speed%></td>', 
            '<td class="text-right"><%=time%></td>', 
            '<td><%=comment%></td>', 
            '<td class="text-right"><%=created_at%></td>', 
        '</tr>'
    ].join('\n'));

    $.extend(this, params);
    this.init();
}

User.prototype = {
    init: function() {
        $('.edit-userpic').on('click', this.edit_userpic_click.bind(this));

        this.set_results();
        this.render_list();
        // init_templates();
    },

    set_results: function() {
        var time_res = _.max(this.tracks, 'time'),
            distance_res = _.max(this.tracks, 'distance'),
            speed_res = _.max(this.tracks, 'speed');

        this.$distance.text(distance_res.distance);
        this.$speed.text(speed_res.speed);
        this.$time.text(time_res.time);
    },

    render_group: function(index, value) {
        // group header
        this.$tbody.append(this.group({
            columns: this.$columns.children().length,
            month: value.str_month
        }));
        // group body
        var tracks = _.where(this.tracks, {month: value.month});
        $.each(tracks, this.render_track.bind(this));
    },

    render_track: function(index, track) {
        this.$tbody.append(this.row({
            url: track.url,
            id: track.id,
            suit: track.suit,
            location: track.location,
            distance: track.distance || 0,
            speed: track.speed || 0.0,
            time: (track.time || 0.0).toFixed(1),
            comment: track.comment,
            created_at: track.uploaded_at_formatted
        }));
    },

    render_list: function() {
        var groups = _.chain(this.tracks)
                      .map(function(el) {
                          return {month: el.month, str_month: el.str_month} 
                      })
                      .uniq(false, function(el) { 
                          return el.month; 
                      })
                      .value();

        this.$tbody.children().remove();
        $.each(groups, this.render_group.bind(this));
    },

    edit_userpic_click: function() {
        this.userpic_form.open();
    }
}




$(document).on('ready page:load', function() {
    if ($('.user').length) {
        // window.Profile = new User({
        //     id: $('.user').data('id'),
        //     tracks: $('.user').data('tracks')
        // });
    }

    init_new_user_form_validation();
});
