var AjaxErrorMessageObj = function() {
    this.$flash = $('#ajax-error-message');
    this.$flash_text = $('#ajax-error-message-text');
    this.$flash_close = $('#ajax-error-message > .ajax-error-dismiss');

    this.init();
};

AjaxErrorMessageObj.prototype = {
    init: function() {
        this.$flash_close
            .off('click')
            .on('click', this.on_close_click.bind(this));

        $(document).on('keydown', this.on_keydown.bind(this));
    },

    display: function(text) {
        if (text) {
            this.set_text(text);
        } else {
            this.set_default_text();
        }
        this.show();
    },

    on_close_click: function(e) {
        e.preventDefault();
        this.hide();
    },

    on_keydown: function(e) {
        if (e.which === 27) {
            this.hide();
        }        
    },

    set_text: function(text) {
        this.$flash_text.text(text);
    },

    set_default_text: function() {
        this.$flash_text.text(
            'Something went wrong with that request. Please try again.'
        );
    },

    show: function() {
        this.$flash.addClass('visible');
    },

    hide: function() {
        this.$flash.removeClass('visible');
    }
};

$(document).on('ready page:load', function() {
    window.AjaxErrorMessage = new AjaxErrorMessageObj();
});
