window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'UA-107762482-1');

var item = $('#btn-action');
$('#btn-action').keydown(function (event) {
  if (event.keyCode == 13 && item.val() != ' ' && item.val() != '') {
    $(location).attr('href', '/search?keyword='+item.val());
  }
})