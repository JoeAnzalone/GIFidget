$(document).ready(function(){

    window.document.addEventListener('drop', function(e){
        e.stopPropagation();
        e.preventDefault();

        var reader = new FileReader();
        var file = e.dataTransfer.files[0];

        reader.onload = function (e) {
            var fileData = reader.result;
            makeGif(fileData);
        };
        reader.readAsDataURL(file);


    }, false);

    var canvas = document.getElementById('bitmap');

    if(!canvas.getContext){
        $('html').addClass('no-canvas');
        $('.no-canvas .controls input, .no-canvas .controls button').prop('disabled', true);
    } else {
        var context = canvas.getContext('2d');
        $('html').addClass('canvas');
    }
    $('input.foreground').change( function(e){
        var reader = new FileReader();
        reader.onload = function (e) {
            makeGif(e.target.result);
        };
        reader.readAsDataURL(input.files[0]);
    } );

    $('.create').click(function(){
        var new_width = $('[name="width"]').val();
        var new_height = $('[name="height"]').val();

        if( new_width ){
            canvas.width = new_width;
        }

        if( new_height ){
            canvas.height = new_height;
        }

        makeGif();
    });

    function makeGif(fileData) {

        var encoder = new GIFEncoder();
        encoder.start();
        encoder.setRepeat(0);


        var delay = $('[name="delay"]').val();
        if( !delay ){
            delay = 50;
        }
        encoder.setDelay(delay);

        encoder.setTransparent(null);


        context.fillStyle = 'rgb(255,255,255)';
        context.fillRect(0,0,canvas.width, canvas.height); //GIF can't do transparent so do white

        /*
         input = typeof input !== 'undefined' ? input : $('.foreground');

        if( $(input.target).prop('type') != 'file' ){
            input.target = $('.foreground')[0];

        }
        */

        var gradient = context.createLinearGradient(0,0,0,canvas.height);
        gradient.addColorStop(0, $('[name=background-color-1]').val() );
        gradient.addColorStop(1, $('[name=background-color-2]').val() );

        var foreground = new Image();
        //foreground.src =  e.target.result;
        foreground.src =  fileData;

        foreground.onload = function(){
            var foreground_canvas = document.createElement('canvas');

            foreground_canvas.width = foreground.width;
            foreground_canvas.height = foreground.height;

            var foreground_context = foreground_canvas.getContext('2d');

            context.drawImage(foreground, 0, 0, foreground.width, foreground.height);

            var foreground_image_data = foreground_context.getImageData(0, 0, foreground_canvas.width, foreground_canvas.height);

            var offsets = [
                [0,2],
                [2,0],
                [0,-2],
                [-2,0]
            ];

            $.each(offsets, function(k, v){
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.fillStyle = gradient;
                context.fillRect(0, 0, canvas.width, canvas.height);

                var width = foreground.width;
                var height = foreground.height;

                var x_coord = (canvas.width/2)-(foreground.width/2);
                var y_coord = (canvas.height/2)-(foreground.height/2);

                x_coord += v[0];
                y_coord += v[1];

                // context.rotate(0.5);

                context.drawImage(foreground, x_coord, y_coord, width, height);

                // context.restore();

                encoder.addFrame(context);
            });

            /*
            context.fillStyle = "rgb(0,0,200)";
            context.fillRect (40, 30, 75, 50);   //draw a little red box
            encoder.addFrame(context);
            */

            encoder.finish();

            binary_gif = encoder.stream().getData() //notice this is different from the as3gif package!
            var data_url = 'data:image/gif;base64,' + encode64(binary_gif);

            if( $('.imgur-upload').length == 0 ){
                $('.create').after('<button class="imgur-upload">Upload to imgur</button>');
            }

            $('.imgur-upload').click(function(e){
                e.stopImmediatePropagation();
                $('.imgur-link').remove();
                var imgur_post_url = 'http://api.imgur.com/2/upload.json';
                var imgur_post_fields = {
                type: 'base64',
                image: encode64(binary_gif),
                key: 'e1bd28e986e039f971fad55e6cbdee93'
                };

                $.post(imgur_post_url, imgur_post_fields, function(data){
                    var imgur_page = data.upload.links.imgur_page;
                    if( $('.imgur-link').length == 0 ){
                        $('.imgur-upload').after('<a class="imgur-link" target="_blank" href="' + imgur_page + '">'+ imgur_page +'</a>');
                    } else {
                        $('.imgur-link').prop('href', imgur_page);
                        $('.imgur-link').html(imgur_page);
                    }
                });
            });

            if( $('.gif').length == 0 ){
                $('.output').append('<a target="_blank" href="' + data_url + '"><img class="gif" src="' + data_url + '" /></a>');
            } else {
                $('.gif').prop('src', data_url);
                $('.output a').prop('href', data_url);
            }
        }

    };

    input = typeof input !== 'undefined' ? input : $('.foreground');

    if( $(input.target).prop('type') != 'file' ){
        input.target = $('.foreground')[0];
    }

    input = input.target;
    if (input.files && input.files[0]) {
        encoder.start();
    }

    /*
    var reader = new FileReader();
    reader.onload = function (e) {
        makeGif(e.target.result);
    };
    reader.readAsDataURL(input.files[0]);
    */
});
