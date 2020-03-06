$(function(){
	$("#memoButton").click(function(){
		$("#memo").toggleClass("disp")
		filterPlayer("all")
	})

	$("#memoClose").click(function(){
		$("#memo").removeClass("disp")
	})

	$(".memoTab").click(function(){
		var name = $(this).data("name")
		$(".memoTab").removeClass("selected")
		$(this).addClass("selected")

		$("#memoBody > div").hide()
		$("#memo"+name).show()
	})

	$("#memoDiscussPlayer").on("click","li",function(){
		var no = $(this).data("no")
		filterPlayer(no)

	})

	$("#memoDiscussDay").on("click","li",function(){
		var day = $(this).data("day")
		filterDay(day)
	})	

	$("#menu-sp-discuss").click(function(){
		$("#right").hide()
		$("#left").show()
	})
	$("#menu-sp-player").click(function(){
		$("#left").hide()
		$("#right").show()
	})

})

function filterPlayer(no){
	if(no == "all"){
		$("#memoDiscussTable tr").show()
	} else {
		$("#memoDiscussTable > tr").hide()
		$("#memoDiscussTable tr.discuss.player-"+no).show()	
		$("#memoDiscussTable tr.progress").show()		
	}
}

function filterDay(day){
	if(day == "all"){
		$("#memoDiscussTable tr").show()
	} else {
		$("#memoDiscussTable > tr").hide()
		$("#memoDiscussTable tr.day"+day).show()
	}
}