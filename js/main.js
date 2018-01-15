const socket = io();

socket.on('connect', () => {
  console.log('Connected to socket.io server!');
});

socket.on('message', (message) => {
  const $messageBox = $('.messages');
  $messageBox.append(`<p>&lt;anonymous&gt;: ${message.text}</p>`);
});

// Handles submitting a new message.
(function ($) {
  $(document).ready(() => {
    const $form = $('#message-form');
    const $messageBox = $('.messages');

    $form.on('submit', (event) => {
      event.preventDefault();

      const $message = $form.find('input[name=message]');
      socket.emit('message', {
        text: $message.val(),
      });
      $messageBox.append(`<p>&lt;me&gt;: ${$message.val()}</p>`);
      $message.val('');
    });
  });
})(jQuery);
