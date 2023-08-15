<template>
    	<div id="memo">
		<div id="memoClose">×</div>
		<div id="memoTabs">
			<div class="memoTab selected" data-name="Discuss">発言ログ</div>
			<div class="memoTab" data-name="Vote">投票ログ</div>
			<div class="memoTab" data-name="Free">自由帳</div>
		</div>
		<div id="memoBody">
			<div id="memoDiscuss">
			<div id="memoDiscussFilter">
			<ul id="memoDiscussPlayer">
				
			</ul>
			<ul id="memoDiscussDay">
				
			</ul>
			</div>
			<table id="memoDiscussTable">
				
			</table>
			</div>
			<div id="memoVote"></div>
			<div id="memoFree">
				<textarea id="memoFreeSpace"></textarea>
			</div>			
		</div> 
	</div>
</template>