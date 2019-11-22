
var currentPage = 0;

var pages = ["Help Page 1", "Help Page 2", "Help Page 3", "Help Page 4"];

$(document).ready(function() {
    $("#nextButton").on("click",function() {
        if (currentPage < pages.length-1) {
            currentPage++;
            
            if (currentPage % 2 == 1) {
                $("#page2").html(pages[currentPage]);
            } else {
                $("#page1").html(pages[currentPage]);
            }
            
            if (currentPage == pages.length-1) {
                $("#nextButton").addClass("disabled");
            } else {
                $("#nextButton").removeClass("disabled");
            }
            $("#prevButton").removeClass("disabled");
            
            $(".pageNumber").html(currentPage+1);
            window.setTimeout(updatePages,250);
        }
    });
    $("#prevButton").on("click",function() {
        if (currentPage > 0) {
            currentPage--;
            
            if (currentPage % 2 == 1) {
                $("#page2").html(pages[currentPage]);
            } else {
                $("#page1").html(pages[currentPage]);
            }
            
            if (currentPage == 0) {
                $("#prevButton").addClass("disabled");
            } else {
                $("#prevButton").removeClass("disabled");
            }
            $("#nextButton").removeClass("disabled");
            
            $(".pageNumber").html(currentPage+1);
            window.setTimeout(updatePages,250);
        }
    });
    $("#page1").html(pages[0]);
    $("#page2").html(pages[1]);
});

function updatePages() {
    $("#page1").css('transform',`rotateY(${currentPage*-180}deg)`);
    $("#page1").css('-webkit-transform',`rotateY(${currentPage*-180}deg)`);
    $("#page2").css('transform',`rotateY(${(currentPage*-180)+180}deg)`);
    $("#page2").css('-webkit-transform',`rotateY(${(currentPage*-180)+180}deg)`);
}
