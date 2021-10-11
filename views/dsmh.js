$(document).ready(function() {

});
$('#search-button').click(function(){
    var search = $('#search').val()
    var pageno = $('#page-number').val()
    window.location.href=window.location.origin + `/dsmh?search=${search}&pageno=${pageno}`;
    })
$('#go-button').click(function(){
    var search = $('#search').val()
    var pageno = $('#page-number').val()
    window.location.href=window.location.origin + `/dsmh?search=${search}&pageno=${pageno}`;
    })
$('#page-random').click(function(){
    window.location.href=window.location.origin + '/dsmh?random=true';
    })
$('a.page-link').click(function(){
    var search = $('#search').val()
    var pageno = $(this).text()
    window.location.href=window.location.origin + `/dsmh?search=${search}&pageno=${pageno}`;
    })