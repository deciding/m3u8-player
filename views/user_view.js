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
    $(".redownload").click(function(e) {
        const Http = new XMLHttpRequest();
        var iid = e.target.id.slice(3)
        const url='user/redownload?iid='+iid
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
    $('#go-button').click(function(){
        var pageno = $('#page-number').val()
        window.location.href=window.location.origin + `/user?pageno=${pageno}`;
        })
    //$('#page-random').click(function(){
    //    window.location.href=window.location.origin + '/user?random=true';
    //    })
    $('a.page-link').click(function(){
        var pageno = $(this).text()
        window.location.href=window.location.origin + `/user?pageno=${pageno}`;
        })
});