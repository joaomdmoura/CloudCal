const {ipcRenderer} = require('electron');

ipcRenderer.on('eventsReceived', (event, arg) => {
  $.each( arg, function( key, event ) {
    var startDate = new Date(event.start.dateTime);
    var endDate   = new Date(event.end.dateTime);
    var divClass  = startDate.getDate()+'-'+(startDate.getMonth()+1)+'-'+startDate.getFullYear();
    $('table tbody tr td#'+divClass).addClass('event');
    $('div.activities div.' + divClass).append(`
        <div class="activity animated fadeinright delay-1">
          <p>`+event.summary+`</p>
          <span class="activity-time text-small text-light"><i class="ion-ios-clock-outline m-r-5"></i> <span class="">`+formatHour(startDate)+` - `+formatHour(endDate)+`</span></span>
        </div>
    `)
  });
});
