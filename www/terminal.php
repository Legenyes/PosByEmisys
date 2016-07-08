<?php 

if(isset($_GET['id'])){
	$date_of_expiry = time() + 6000000000;
	setcookie( "terminal_id", $_GET['id'], $date_of_expiry );

	echo "terminal_id set to ". $_GET['id'];
}
else{
	echo "current terminal_id " . $_COOKIE['terminal_id'] ;

}