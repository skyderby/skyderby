$(function() {
  $("a[rel~=popover], .has-popover, [data-toggle=popover]").popover();
  enable_tooltips();

  $('table.table td a').on('click', function(e) { e.stopPropagation(); });
});

function enable_tooltips() {
  $("a[rel~=tooltip], .has-tooltip, [data-toggle=tooltip]").tooltip();
}
