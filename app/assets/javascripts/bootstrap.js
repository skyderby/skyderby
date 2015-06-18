$(function() {
  $("a[rel~=popover], .has-popover, [data-toggle=popover]").popover();
  $("a[rel~=tooltip], .has-tooltip, [data-toggle=tooltip]").tooltip();

  $('table.table td a').on('click', function(e) { e.stopPropagation(); });
});
