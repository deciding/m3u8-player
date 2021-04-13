$(document).ready(function() {
    $(".delete").click(function(e) {
        var divid = e.target.id+"div"
        $('div#'+divid).hide();
        const Http = new XMLHttpRequest();
        const url='user/del?iid='+e.target.id
        Http.open("GET", url);
        Http.send();
        Http.onreadystatechange = (e) => {
            console.log(Http.responseText)
        }
    });         
    $("video").on("mouseover", function(event) {
        this.play();
    }).on('mouseout', function(event) {
        this.pause();
    });
    //var cip = $("video").hover( hoverVideo, hideVideo );

    //function hoverVideo(e) {  
    //    //$('video', this).get(0).play(); 
    //    e.target.play(); 
    //}

    //function hideVideo(e) {
    //    //$('video', this).get(0).pause(); 
    //    e.target.pause(); 
    //}
});