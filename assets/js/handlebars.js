let Handlebars = require('handlebars');
let layouts    = require('handlebars-layouts');
let path       = require('path');
let fs         = require('fs');
let layoutPath = path.join(__dirname, 'layouts/application.hbs');

// HANDLEBARS HELPERS

Handlebars.registerHelper(layouts(Handlebars));

Handlebars.registerPartial('application', fs.readFileSync(layoutPath, 'utf8'));

Handlebars.registerHelper('if_current_day', function(a, opts) {
  if (a == currentDay) {
      return opts.fn(this);
  } else {
      return opts.inverse(this);
  }
});

// RENDERING

var source   = $("div#content").html();
var template = Handlebars.compile(source);

var cal_source   = $("#handlebars-cal").html();

if (cal_source != undefined){
  var cal_template = Handlebars.compile(cal_source);
}

var currentDate  = new Date();
var currentDay   = currentDate.getDate();
var currentMonth = currentDate.getMonth();
var currentYear  = currentDate.getFullYear();
var cal          = buildCalendar(currentMonth, currentYear);

var context     = {currentMonthName: monthNames[currentDate.getMonth()], cal: cal, currentMonth: currentMonth+1, currentYear: currentYear};
var cal_context = {cal: cal, currentDay: currentDay, currentMonth: currentMonth+1, currentYear: currentYear};

var html = template(context);
$("div#content").html(html);

if (cal_source != undefined){
  var cal_html = cal_template(cal_context);
  $("div.calendar").html(cal_html);
}
