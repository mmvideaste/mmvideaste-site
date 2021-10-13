let MyEvents = {
  addEvents: function(events) {
    this.deleteVisibleArea();
    if (events.length === 0) {
      this.addEventsNone();
    }
    else {
      this.addEventsAtLeastOne(events);
    }
  },
  addEventsAtLeastOne: function(events) {
    $('.your-timezone-is').html(this.localTimezone());
    this.addToVisibleArea('template-your-timezone-is');
    let that = this;
    events.forEach(function(e) {
      that.addEvent(e);
    });
  },
  addEventsNone: function(events) {
    this.addToVisibleArea('template-no-events');
  },
  addEvent: function(event) {
    $('.template-event a').attr('href', event.event.url);
    $('.template-event a').html(event.event.title);
    $('.template-event .event-date').html(this.humanDate(event.start, event.end));
    this.addToVisibleArea('template-event');
  },
  addToVisibleArea: function(css_class) {
    $('.' + css_class).clone().removeClass(css_class).appendTo('.events-to-display');
  },
  convertTimezone: function(date, tzString) {
    // See https://stackoverflow.com/a/54127122/1207752.
    return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: tzString}));
  },
  deleteVisibleArea: function() {
    $('.events-to-display').empty();
  },
  error: function(thrownError) {
    this.deleteVisibleArea();
    this.addToVisibleArea('template-error-loading-events');
    $('.events-error').html(thrownError);
  },
  fetchEvents: function() {
    let that = this;
    $.ajax({
      url : "/api/v1/events.json",
      dataType: "json",
      contentType: "application/json; charset=utf-8",
      success: function(data) {
        that.success(data);
      },
      error: function(xhr, ajaxOptions, thrownError) {
        that.error(thrownError);
      }
    });
  },
  formatDate: function(d) {
    let date_obj = new Date(d);

    return date_obj.getFullYear() + "-" +
      this.pad((1 + date_obj.getMonth())) + "-" +
      this.pad(date_obj.getDate()) + " " +
      this.pad(date_obj.getHours()) + ":" +
      this.pad(date_obj.getMinutes());
  },
  formatIsoDate: function(d) {
    return d.replace(" +0000", "Z").replace(" ", "T");
  },
  getParamOrDefault: function(param, default_val) {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    if (typeof params[param] != "undefined") {
      return params[param];
    }
    return default_val;
  },
  humanDate: function(start, end) {
    var ret = this.humanSingleDate(start);
    if (end) {
      ret += ' - ' + this.humanSingleDate(end);
    }
    return ret;
  },
  humanSingleDate: function(d) {
    let current_tz_date = this.convertTimezone(this.formatIsoDate(d), this.localTimezone());

    return this.formatDate(current_tz_date);
  },
  localTimezone: function() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  },
  init: function() {
    this.fetchEvents();
  },
  pad: function(n) {
    // https://stackoverflow.com/a/14324851/1207752
    return ("00" + n).slice(-2);
  },
  success: function(data) {
    var events = [];
    let that = this;
    data.forEach(function(e) {
      e.dates.forEach(function(e2) {
        if (e2.start >= that.utcTime()) {
          events.push({
            start: e2.start,
            end: e2.end,
            event: e
          });
        }
      });
    });
    this.addEvents(events.sort(function(a, b) {
      return a.start > b.start;
    }));
  },
  utcTime: function() {
    // Example: 2021-07-05T19:40:47.382Z
    return this.getParamOrDefault('simulate_current_date', new Date().toISOString());
  }
};

$(document).ready(function(){
  MyEvents.init();
});
