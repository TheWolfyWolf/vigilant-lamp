
var currentPage = 0;

var pages = ["<h1 style='color: white;'>Movement</h1><br /><hr /><br /><ul style='color: white;'><li><h3>W/Spacebar/Up Arrow &mdash; Jump</h3></li><li><h3>A/Left Arrow &mdash; Move Left</h3></li><li><h3>D/Right Arrow &mdash; Move Right</h3></li></ul>",
             "<h1 style='color: white;'>Actions</h1><br /><hr /><br /><ul style='color: white;'><li><h3>Left Click &mdash; Damage Block</h3></li><li><h3>Q &mdash; Place Block</h3></li><li><h3>Left Click Player &mdash; Hurt Player</h3></li></ul>",
             "<h1 style='color: white;'>Screens</h1><br /><hr /><br /><ul style='color: white;'><li><h3>C &mdash; Crafting</h3></li><li><h3>E &mdash; Inventory</h3></li><li><h3>T &mdash; Chat &mdash; <i>Type '/help' for commands</h3></li></ul>"];

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
