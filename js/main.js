const socket = io();

socket.on('connect', () => {
  console.log('Connected to socket.io server!');
});

socket.on('message', (message) => {
  console.log('New message');
  console.log(message.text);
});

// Handles submitting a new message.
(function ($) {
  $(document).ready(() => {
    const $form = $('#message-form');

    $form.on('submit', (event) => {
      event.preventDefault();
      const $message = $form.find('input[name=message]');
      socket.emit('message', {
        text: $message.val(),
      }, $message.val(''));
    });
  });
})(jQuery);
