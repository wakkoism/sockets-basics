function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      if (decodeURIComponent(pair[0]) == variable) {
          return decodeURIComponent(pair[1]);
      }
  }

  return undefined;
}

const socket = io();

socket.on('connect', () => {
  console.log('Connected to socket.io server!');
});

socket.on('message', (message) => {

  const user = message.name || 'anonymous';
  const $messageBox = $('.messages');
  $messageBox.append(`
    <p>
      <span class="date">[${moment(message.timestamp).local().format('h:mm a')}]</span>&nbsp;
      &lt;${user}&gt;:&nbsp;
      ${message.text}
    </p>
  `);
  $messageBox.scrollTop($messageBox.prop('scrollHeight'));
});

// Handles submitting a new message.
(function ($) {
  $(document).ready(() => {
    const $form = $('#message-form');
    const $messageBox = $('.messages');

    $form.on('submit', (event) => {
      event.preventDefault();

      const $message = $form.find('input[name=message]');
      const timestamp = moment().utc().valueOf();
      const name = getQueryVariable('name') || 'anonymous';

      socket.emit('message', {
        timestamp,
        name,
        text: $message.val(),
        room: getQueryVariable('room'),
      });
      $messageBox.append(`
        <p>
          <span class="date">[${moment(timestamp).local().format('h:mm a')}]</span>&nbsp;
          &lt;${name}&gt;:&nbsp;
          ${$message.val()}
        </p>
      `);
      $messageBox.scrollTop($messageBox.prop('scrollHeight'));
      $message.val('');
    });
  });
})(jQuery);
