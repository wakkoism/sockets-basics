function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      if (decodeURIComponent(pair[0]) == variable) {
          return decodeURIComponent(pair[1].replace(/\+/g, ' '));
      }
  }

  return undefined;
}

const name = getQueryVariable('name') || 'anonymous';
const room = getQueryVariable('room') || '';

const socket = io();

socket.on('connect', () => {
  console.log('Connected to socket.io server!');

  socket.emit('joinRoom', {
    name,
    room,
  });
});

socket.on('message', (message) => {

  const user = message.name || 'anonymous';
  const $messageBox = jQuery('.messages');
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
    if (!room || name == 'anonymous')  {
      $('.chat-form').removeClass('hide');
      return;
    }
    $('.room-name').text(room);

    $('.room').removeClass('hide');
    const $form = $('#message-form');
    const $messageBox = $('.messages');

    $form.on('submit', (event) => {
      event.preventDefault();

      const $message = $form.find('input[name=message]');
      const timestamp = moment().utc().valueOf();

      socket.emit('message', {
        timestamp,
        name,
        room,
        text: $message.val(),
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
    $form.find('.clear-chat').bind('click', () => {
      const $messageBox = jQuery('.messages');
      // Clear the message in the message chat.
      $messageBox.html('');
    });
  });
})(jQuery);
