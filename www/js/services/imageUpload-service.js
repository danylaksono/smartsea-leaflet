angular.module('starter')
.factory('imgUploadService', function($window) {
    try {
            var img = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
        } catch(e) {
            var img = canvas.toDataURL().split(',')[1];
        }
        // open the popup in the click handler so it will not be blocked
        var w = window.open();
        w.document.write('Uploading...');
        // upload to imgur using jquery/CORS
        // https://developer.mozilla.org/En/HTTP_access_control
        $.ajax({
            url: 'http://api.imgur.com/2/upload.json',
            type: 'POST',
            data: {
                type: 'base64',
                // get your key here, quick and fast http://imgur.com/register/api_anon
                key: 'YOUR-API-KEY',
                name: 'neon.jpg',
                title: 'test title',
                caption: 'test caption',
                image: img
            },
            dataType: 'json'
        }).success(function(data) {
            w.location.href = data['upload']['links']['imgur_page'];
        }).error(function() {
            alert('Could not reach api.imgur.com. Sorry :(');
            w.close();
        });
    }
})