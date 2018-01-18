const socket = io();

socket.on('connect', () => {
  console.log('Connected to socket.io server!');
});

socket.on('message', (message) => {
  const $messageBox = $('.messages');
  $messageBox.append(`<p><span class="date">[${moment(message.timestamp).local().format('h:mm a')}]</span> &lt;anonymous&gt;: ${message.text}</p>`);
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
      socket.emit('message', {
        timestamp,
        text: $message.val(),
      });
      $messageBox.append(`<p><span class="date">[${moment(timestamp).local().format('h:mm a')}]</span> &lt;me&gt;: ${$message.val()}</p>`);
      $messageBox.scrollTop($messageBox.prop('scrollHeight'));
      $message.val('');
    });
  });
})(jQuery);
