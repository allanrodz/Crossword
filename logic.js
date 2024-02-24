var BadChars = "`~!@^*()_={[}]\|:;\"',<.>/?";
var TableAcrossWord, TableDownWord;
var CurrentWord, PrevWordHorizontal, x, y, i, j;
var CrosswordFinished, Initialized;

// Check the user's browser and then initialize the puzzle.
if (document.getElementById("waitmessage") != null)
{
	document.getElementById("waitmessage").innerHTML = "Please wait while the crossword is loaded...";
	
	// Current game variables
	CurrentWord = -1;
	PrevWordHorizontal = false;
	
	// Create the cell-to-word arrays.
	TableAcrossWord = new Array(CrosswordWidth);
	for (var x = 0; x < CrosswordWidth; x++) TableAcrossWord[x] = new Array(CrosswordHeight);
	TableDownWord = new Array(CrosswordWidth);
	for (var x = 0; x < CrosswordWidth; x++) TableDownWord[x] = new Array(CrosswordHeight);
	for (var y = 0; y < CrosswordHeight; y++)
		for (var x = 0; x < CrosswordWidth; x++)
		{
			TableAcrossWord[x][y] = -1;
			TableDownWord[x][y] = -1;
		}
	
	// First, add the horizontal words to the puzzle.
	for (var i = 0; i <= LastHorizontalWord; i++)
	{
		x = WordX[i];
		y = WordY[i];
		for (var j = 0; j < WordLength[i]; j++)
		{
			TableAcrossWord[x + j][y] = i;
		}
	}
	
	// Second, add the vertical words to the puzzle.
	for (var i = LastHorizontalWord + 1; i < Words; i++)
	{
		x = WordX[i];
		y = WordY[i];
		for (var j = 0; j < WordLength[i]; j++)
		{
			TableDownWord[x][y + j] = i;
		}
	}
	
	// Now, insert the row HTML into the table.
	for (var y = 0; y < CrosswordHeight; y++)
	{
		document.writeln("<tr>");
		for (var x = 0; x < CrosswordWidth; x++)
		{
			if (TableAcrossWord[x][y] >= 0 || TableDownWord[x][y] >= 0)
				document.write("<td id=\"c" + PadNumber(x) + PadNumber(y) + "\" class=\"ecw-box ecw-boxnormal_unsel\" onclick=\"SelectThisWord(event);\">&nbsp;</td>");
			else
				document.write("<td></td>");
		}
		document.writeln("</tr>");
	}
	
	// Finally, show the crossword and hide the wait message.
	Initialized = true;
	document.getElementById("waitmessage").style.display = "none";
}

// ----------
// Event handlers

// Raised when a key is pressed in the word entry box.
function WordEntryKeyPress(event)
{
	if (CrosswordFinished) return;
	// Treat an Enter keypress as an OK click.
	if (CurrentWord >= 0 && event.keyCode == 13) OKClick();
}

// ----------
// Helper functions

// Called when we're ready to start the crossword.
function BeginCrossword()
{
	if (Initialized)
	{
		document.getElementById("welcomemessage").style.display = "";
		document.getElementById("checkbutton").style.display = "";
	}
}

// Returns true if the string passed in contains any characters prone to evil.
function ContainsBadChars(theirWord)
{
	for (var i = 0; i < theirWord.length; i++)
		if (BadChars.indexOf(theirWord.charAt(i)) >= 0) return true;
	return false;
}

// Pads a number out to three characters.
function PadNumber(number)
{
	if (number < 10)
		return "00" + number;
	else if (number < 100)
		return "0" + number;
	else
		return "" +  number;
}

// Returns the table cell at a particular pair of coordinates.
function CellAt(x, y)
{
	return document.getElementById("c" + PadNumber(x) + PadNumber(y));
}

// Deselects the current word, if there's a word selected.  DOES not change the value of CurrentWord.
function DeselectCurrentWord()
{
	

	if (CurrentWord < 0) return;
	var x, y, i;
	
	document.getElementById("answerbox").style.display = "none";
	ChangeCurrentWordSelectedStyle(false);
	CurrentWord = -1;

	document.getElementById("answerbox").style.display = "none";
	document.getElementById("answerOverlay").style.display = "none"; // Hide the overlay
	
}

// Changes the style of the cells in the current word.
function ChangeWordStyle(WordNumber, NewStyle)
{
	if (WordNumber< 0) return;
	var x = WordX[WordNumber];
	var y = WordY[WordNumber];
	
	if (WordNumber<= LastHorizontalWord)
		for (i = 0; i < WordLength[WordNumber]; i++)
			CellAt(x + i, y).className = NewStyle;
	else
		for (i = 0; i < WordLength[WordNumber]; i++)
			CellAt(x, y + i).className = NewStyle;
}

// Changes the style of the cells in the current word between the selected/unselected form.
function ChangeCurrentWordSelectedStyle(IsSelected)
{
	if (CurrentWord < 0) return;
	var x = WordX[CurrentWord];
	var y = WordY[CurrentWord];
	
	if (CurrentWord <= LastHorizontalWord)
		for (i = 0; i < WordLength[CurrentWord]; i++)
			CellAt(x + i, y).className = CellAt(x + i, y).className.replace(IsSelected ? "_unsel" : "_sel", IsSelected ? "_sel" : "_unsel");
	else
		for (i = 0; i < WordLength[CurrentWord]; i++)
			CellAt(x, y + i).className = CellAt(x, y + i).className.replace(IsSelected ? "_unsel" : "_sel", IsSelected ? "_sel" : "_unsel");
}

// Selects the new word by parsing the name of the TD element referenced by the 
// event object, and then applying styles as necessary.
function SelectThisWord(event)
{
	

	if (CrosswordFinished) return;
	var x, y, i, TheirWord, TableCell;
	
	// Deselect the previous word if one was selected.
	document.getElementById("welcomemessage").style.display = "none";
	if (CurrentWord >= 0) OKClick();
	DeselectCurrentWord();
	
	// Determine the coordinates of the cell they clicked, and then the word that
	// they clicked.
	var target = (event.srcElement ? event.srcElement: event.target);
	x = parseInt(target.id.substring(1, 4), 10);
	y = parseInt(target.id.substring(4, 7), 10);
	
	// If they clicked an intersection, choose the type of word that was NOT selected last time.
	if (TableAcrossWord[x][y] >= 0 && TableDownWord[x][y] >= 0)
		CurrentWord = PrevWordHorizontal ? TableDownWord[x][y] : TableAcrossWord[x][y];
	else if (TableAcrossWord[x][y] >= 0)
		CurrentWord = TableAcrossWord[x][y];
	else if (TableDownWord[x][y] >= 0)
		CurrentWord = TableDownWord[x][y];

	PrevWordHorizontal = (CurrentWord <= LastHorizontalWord);
	
	// Now, change the style of the cells in this word.
	ChangeCurrentWordSelectedStyle(true);
	
	// Then, prepare the answer box.
	x = WordX[CurrentWord];
	y = WordY[CurrentWord];
	TheirWord = "";
	var TheirWordLength = 0;
	for (i = 0; i < WordLength[CurrentWord]; i++)
	{
		// Find the appropriate table cell.
		if (CurrentWord <= LastHorizontalWord)
			TableCell = CellAt(x + i, y);
		else
			TableCell = CellAt(x, y + i);
		// Add its contents to the word we're building.
		if (TableCell.innerHTML != null && TableCell.innerHTML.length > 0 && TableCell.innerHTML != " " && TableCell.innerHTML.toLowerCase() != "&nbsp;")
		{
			TheirWord += TableCell.innerHTML.toUpperCase();
			TheirWordLength++;
		}
		else
		{
			TheirWord += "&bull;";
		}
	}
	
	document.getElementById("wordlabel").innerHTML = TheirWord;
	document.getElementById("wordinfo").innerHTML = ((CurrentWord <= LastHorizontalWord) ? "Horizontally, " : "Vertically, ") + WordLength[CurrentWord] + " letter(s).";
	document.getElementById("wordclue").innerHTML = Clue[CurrentWord];
	document.getElementById("worderror").style.display = "none";
	if (TheirWordLength == WordLength[CurrentWord])
		document.getElementById("wordentry").value = TheirWord;
	else
		document.getElementById("wordentry").value = "";
	
	// Finally, show the answer box.
	document.getElementById("answerbox").style.display = "block";
	try
	{
		document.getElementById("wordentry").focus();
		document.getElementById("wordentry").select();
	}
	catch (e)
	{
	}

	// Finally, show the answer box.
	document.getElementById("answerbox").style.display = "block";
	document.getElementById("answerOverlay").style.display = "block"; // Show the overlay
	
}

// Called when the user clicks the OK link.
function OKClick()
{
    var TheirWord, x, y, i, TableCell;
    if (CrosswordFinished) return;
    if (document.getElementById("okbutton").disabled) return;
    
    // First, validate the entry.
    TheirWord = document.getElementById("wordentry").value.toUpperCase();
    if (TheirWord.length == 0)
    {
        DeselectCurrentWord();
        return;
    }
    if (ContainsBadChars(TheirWord))
    {
        document.getElementById("worderror").innerHTML = "Only letters!."; // Translated from "Только буквы!."
        document.getElementById("worderror").style.display = "block";
        return;
    }
    if (TheirWord.length < WordLength[CurrentWord])
    {
        document.getElementById("worderror").innerHTML  = "Not enough letters. The word consists of " + WordLength[CurrentWord] + " letter(s)."; // Translated from "Мало букв. Слово состоит из " + WordLength[CurrentWord] + " букв(-ы)."
        document.getElementById("worderror").style.display = "block";
        return;
    }
    if (TheirWord.length > WordLength[CurrentWord])
    {
        document.getElementById("worderror").innerHTML = "Too many letters. The word consists of " + WordLength[CurrentWord] + " letter(s)."; // Translated from "Много букв. Слово состоит из " + WordLength[CurrentWord] + " букв(-ы)."
        document.getElementById("worderror").style.display = "block";
        return;
    }
    
    // If we made it this far, they typed an acceptable word, so add these letters to the puzzle and hide the entry box.
    x = WordX[CurrentWord];
    y = WordY[CurrentWord];
    for (i = 0; i < TheirWord.length; i++)
    {
        TableCell = CellAt(x + (CurrentWord <= LastHorizontalWord ? i : 0), y + (CurrentWord > LastHorizontalWord ? i : 0));
        TableCell.innerHTML = TheirWord.substring(i, i + 1);
    }
    DeselectCurrentWord();
}


// Called when the "check puzzle" link is clicked.
function CheckClick()
{
	var i, j, x, y, UserEntry, ErrorsFound = 0, EmptyFound = 0, TableCell;
	if (CrosswordFinished) return;
	DeselectCurrentWord();
	
	for (y = 0; y < CrosswordHeight; y++)
	for (x = 0; x < CrosswordWidth; x++)
		if (TableAcrossWord[x][y] >= 0 || TableDownWord[x][y] >= 0)
		{
			TableCell = CellAt(x, y);
			if (TableCell.className == "ecw-box ecw-boxerror_unsel") TableCell.className = "ecw-box ecw-boxnormal_unsel";
		}
		
	for (i = 0; i < Words; i++)
	{
		// Get the user's entry for this word.
		UserEntry = "";
		for (j = 0; j < WordLength[i]; j++)
		{
			if (i <= LastHorizontalWord)
				TableCell = CellAt(WordX[i] + j, WordY[i]);
			else
				TableCell = CellAt(WordX[i], WordY[i] + j);
			if (TableCell.innerHTML.length > 0 && TableCell.innerHTML.toLowerCase() != "&nbsp;")
			{
				UserEntry += TableCell.innerHTML.toUpperCase();
			}
			else
			{
				UserEntry = "";
				EmptyFound++;
				break;
			}
		}
		// If this word doesn't match, it's an error.
		if (HashWord(UserEntry) != AnswerHash[i] && UserEntry.length > 0)
		{
			ErrorsFound++;
			ChangeWordStyle(i, "ecw-box ecw-boxerror_unsel");
		}
	}
	
	// If they can only check once, disable things prematurely.
	if ( OnlyCheckOnce )
	{
		CrosswordFinished = true;
		document.getElementById("checkbutton").style.display = "none";
	}
	
    // If errors were found, just exit now.
    if (ErrorsFound > 0 && EmptyFound > 0)
        document.getElementById("welcomemessage").innerHTML = ErrorsFound + (ErrorsFound > 1 ? " errors" : " error") + " and " + EmptyFound + (EmptyFound > 1 ? " incomplete words were" : " incomplete word was") + " found.";
    else if (ErrorsFound > 0)
        document.getElementById("welcomemessage").innerHTML = ErrorsFound + (ErrorsFound > 1 ? " errors were" : " error was") + " found.";
    else if (EmptyFound > 0)
        document.getElementById("welcomemessage").innerHTML = "No errors, but " + EmptyFound + (EmptyFound > 1 ? " words left to solve" : " word left to solve") + " ."; // Translated from "Нет ошибок, но " + EmptyFound + (EmptyFound > 1 ? " слов осталось разгадать" : " слово осталось разгодать") + " ."
    
	if (ErrorsFound + EmptyFound > 0)
	{
		document.getElementById("welcomemessage").style.display = "";
		return;
	}
			
	// They finished the puzzle!
	CrosswordFinished = true;
	document.getElementById("checkbutton").style.display = "none";
	document.getElementById("congratulations").style.display = "block";
	document.getElementById("welcomemessage").style.display = "none";
}

// Called when the "cheat" link is clicked.
function CheatClick()
{
	if (CrosswordFinished) return;
	var OldWord = CurrentWord;
	document.getElementById("wordentry").value = Word[CurrentWord];
	OKClick();
	ChangeWordStyle(OldWord, "ecw-box ecw-boxcheated_unsel");
}

// Returns a one-way hash for a word.
function HashWord(Word)
{
	var x = (Word.charCodeAt(0) * 719) % 1138;
	var Hash = 837;
	var i;
	for (i = 1; i <= Word.length; i++)
		Hash = (Hash * i + 5 + (Word.charCodeAt(i - 1) - 64) * x) % 98503;
	return Hash;
}


document.addEventListener('click', function(event) {
    var isClickInsideAnswerBox = document.getElementById('answerbox').contains(event.target);
    var isClickOnOverlay = event.target === document.getElementById('answerOverlay');

    if (isClickOnOverlay && !isClickInsideAnswerBox) {
        hideOverlay();
    }
});


function showOverlay() {
    document.getElementById("answerOverlay").style.display = "flex";
    document.getElementById("answerbox").style.display = "block";
    // Manually setting text for testing
    document.getElementById("wordlabel").innerText = "Test Word Label";
    document.getElementById("wordinfo").innerText = "Test Word Info";
    document.getElementById("wordclue").innerText = "Test Word Clue";
}


function hideOverlay() {
    document.getElementById("answerOverlay").style.display = "none";
    document.getElementById("answerbox").style.display = "none";
}


document.addEventListener('DOMContentLoaded', (event) => {

	
    let typingCompleted = false;
    const initialOverlay = document.createElement('div');
    initialOverlay.id = 'initialOverlay';
    const typingText = document.createElement('div');
    typingText.classList.add('typing-text');
    initialOverlay.appendChild(typingText);
    document.body.appendChild(initialOverlay);

    // Expanded content with HTML tags for styling parts in amber
    const contentParts = [
		{ content: '<h1>Welcome to the <span class="section-title">Kilkenny Hurling Legends Crossword!</span></h1>', type: 'html' },
        { content: '\n\nDive into the legacy of Kilkenny\'s hurling heroes in this engaging crossword puzzle. Each clue and answer celebrates the illustrious careers of some of the most famous hurlers from Kilkenny, a county with a rich history in the sport of hurling. From legendary goalkeepers to iconic field players, this puzzle spans generations of talent that have graced the pitch.\n\n', type: 'text' },
        { content: '<h3><span class="section-title">How It Works:</span></h3>', type: 'html' },
        { content: '\n\nNavigate the Grid: ', type: 'text' },
        { content: 'Use your mouse or touch to select a crossword square. The selected clue will appear at the top, guiding you to fill in the player\'s last name.\n', type: 'text' },
        { content: '<h3><span class="section-title">Enter Your Answers:</span></h3> ', type: 'html' },
        { content: 'Type in the last name of the hurler corresponding to the clue provided. If you\'re stuck, try moving on to other clues — sometimes, filling in surrounding answers can help!\n', type: 'text' },
        { content: '<h3><span class="section-title">Check Your Progress: </span></h3>', type: 'html' },
        { content: 'Feel free to use the "Check for mistakes" button to review your answers. But remember, each clue is a chance to recall the glorious moments these players brought to the game.\n', type: 'text' },
        { content: '<h3><span class="section-title">Submit with Confidence:</span></h3>', type: 'html' },
        { content: 'Once you\'ve filled in all the names, press the "OK" button to submit your answers. Don\'t worry if you don\'t get everything right the first time; this is an opportunity to learn about the legends of Kilkenny hurling.', type: 'text' }
    ];

    let partIndex = 0; // To keep track of which part of the content we're on
    const speed = 25; // Typing speed

	const tapToSkip = document.createElement('div');
    tapToSkip.classList.add('tap-to-skip');
    tapToSkip.textContent = 'Tap to Skip Instructions';
    initialOverlay.appendChild(tapToSkip);

    // Function to remove overlay and skip instructions
    function skipInstructions() {
        initialOverlay.style.opacity = '0';
        setTimeout(() => initialOverlay.remove(), 1000); // Remove after fade
    }

    // Event listener to skip instructions on tap/click
    tapToSkip.addEventListener('click', skipInstructions);


    function typeNextPart() {
        if (partIndex < contentParts.length) {
            const part = contentParts[partIndex];
            if (part.type === 'text') {
                typeText(part.content, () => {
                    partIndex++;
                    typeNextPart();
                });
            } else if (part.type === 'html') {
                typingText.innerHTML += part.content;
                partIndex++;
                setTimeout(typeNextPart, speed);
            }
        } else {
            typingCompleted = true;
            setTimeout(() => initialOverlay.style.opacity = '0', 5000); // Automatic fade out
        }
    }

	function typeText(text, callback) {
		let i = 0;
		function type() {
			if (i < text.length) {
				typingText.innerHTML += text.charAt(i);
				i++;
				// Ensure the latest typed content is visible
				initialOverlay.scrollTop = initialOverlay.scrollHeight;
				setTimeout(type, speed);
			} else if (callback) {
				callback();
			}
		}
		type();
	}
	

    initialOverlay.addEventListener('click', () => {
        if (!typingCompleted) {
            // Complete the typing immediately
            typingText.innerHTML += contentParts.slice(partIndex).map(part => part.content).join('');
            typingCompleted = true;
            setTimeout(() => initialOverlay.style.opacity = '0', 5000); // Wait 5 seconds then fade out
        } else {
            initialOverlay.style.opacity = '0'; // Fade out immediately if text was completed
            setTimeout(() => initialOverlay.remove(), 1000); // Remove after fade
        }
    });

    typeNextPart(); // Start typing
});

