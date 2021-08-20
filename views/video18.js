$(document).ready(function() {
    var myInterval = false;
    $(".preview").hide(); // first hide all preview imgs
    $("div.list").each(function() { // for each gallery list item
        $(".preview:first", this).show(); // show the first one
        $(this).height($(".preview:first", this).height()); // div height to img height, TODO
    });
    $('.preview').hover(function(e) {
            var $imgGrp = $(e.target);
            var $parent = $imgGrp.parent(); // get the list item div
            var $firstImage = $parent.children('.preview:first');
            var iOffSet = $firstImage.offset(); // get the image position
            myInterval = setInterval(function() {
                var $nextImg;
                $firstImage.hide();
				// if no next images, restart from first
                if ($imgGrp.next('.preview').length == 0) {
                    $imgGrp.fadeOut('normal');
                    $imgGrp = $firstImage;
                    $nextImg = $imgGrp;
                } else
                    $nextImg = $imgGrp.next('.preview');
                if ($imgGrp != $nextImg)
                    $imgGrp.fadeOut('normal'); // fade if go to next
				// set next page position
                $nextImg.css({
                    'top': iOffSet.top,
                    'left': iOffSet.left,
                    'position': 'absolute'
                });
				// fade in
                $nextImg.fadeIn('normal');
				// for the next loop
                $imgGrp = $nextImg;
            }, 750); // 0.75 interval
        },
		// mouse out
        function() {
            var $imgGrp = $(this);
            var $parent = $imgGrp.parent();
            var $firstImage = $parent.children('.preview:first');
			// fadeout only if current image is different from first
            if ($(this).attr('src') != $firstImage.attr('src')) {
                $(this).fadeOut('fast');
            }
			$firstImage.fadeIn('fast');
			// first image fade in, next hover will start from first
            clearInterval(myInterval);
            myInterval = false;
        });

});
$('#search-button').click(function(){
    var search = $('#search').val()
    var pageno = $('#page-number').val()
    window.location.href=window.location.origin + `/video18?search=${search}&pageno=${pageno}`;
    })
$('#go-button').click(function(){
    var search = $('#search').val()
    var pageno = $('#page-number').val()
    window.location.href=window.location.origin + `/video18?search=${search}&pageno=${pageno}`;
    })
$('#page-random').click(function(){
    window.location.href=window.location.origin + '/video18?random=true';
    })
$('a.page-link').click(function(){
    var search = $('#search').val()
    var pageno = $(this).text()
    window.location.href=window.location.origin + `/video18?search=${search}&pageno=${pageno}`;
    })