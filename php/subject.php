<?php
	function getSubject() {
		if($file = fopen("result.txt", "r")) {
			while(!feof($file)) {
				$line = fgets($file);
				if($line != "") {
					$allSubjects .= $line;
					if(!feof($file)) $allSubjects .= '*';
				}
			}
		}
		echo $allSubjects;
	}
?>