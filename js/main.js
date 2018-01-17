const socket = io();

socket.on('connect', () => {
  console.log('Connected to socket.io server!');
});

socket.on('message', (message) => {
  const $messageBox = $('.messages');
  $messageBox.append(`<p>&lt;anonymous&gt;: ${message.text} <span class="date">${moment(message.timestamp).local().format('h:mm a')}</span></p>`);
});

// Handles submitting a new message.
(function ($) {
  $(document).ready(() => {
    const $form = $('#message-form');
    const $messageBox = $('.messages');

    $form.on('submit', (event) => {
      event.preventDefault();

      const $message = $form.find('input[name=message]');
      const timestamp = new Number(moment().utc().format('x'));
      socket.emit('message', {
        timestamp,
        text: $message.val(),
      });
      $messageBox.append(`<p>&lt;me&gt;: ${$message.val()} <span class="date">${moment(timestamp).local().format('h:mm a')}</span></p>`);
      $message.val('');
    });
  });
})(jQuery);
