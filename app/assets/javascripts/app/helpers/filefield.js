Skyderby.helpers.FileField = {

    change: function(event) {
        var input = $(event.currentTarget),
            numFiles = input.get(0).files ? input.get(0).files.length : 1,
            label = input.val().replace(/\\/g, '/').replace(/.*\//, '');

        input.trigger('fileselect', [numFiles, label]);

    },

    fileselect: function(event, numFiles, label) {
        var input = $(event.currentTarget).parents('.input-group').find(':text'),
            log = numFiles > 1 ? numFiles + ' files selected' : label;
        
        if( input.length ) {
            input.val(log);
        }
    }
};
