
/* ***************************************************************************************************

Choose a PDF and a CSV file, the first line (line 0!!) in the CSV should contain words/texts 
that are text fields in the PDF. The PDF is opened, and for every consecutive line (line 1 
through last), the fields are placed in the pdf where the words of line 1 were found.

More info / latest version / readme:
https://github.com/burt777/csv_bitch

************************************************************************************* */

var docLink = "https://github.com/burt777/csv_bitch";

// how to save output files:
var saveOptions = new PDFSaveOptions();

// define the color grey: 
var win = new Window("palette", "Fonts", undefined);  
var winGraphics = win.graphics;  
var gray = winGraphics.newPen(winGraphics.BrushType.SOLID_COLOR, [0.5,0.5,0.5], 1);

// Call the main function:
var goGoGo = settingsDialog();


function settingsDialog () {
    // All coords are [Left, Top, Right, Bottom] Mind you: Width = right - left, height = bottom - top!!!!

    var dialog = new Window("dialog", "CSV Bitch Settings:", [100, 100, 650, 500]);
    var counter = 0;

    this.windowRef = dialog;


    // ******************** CSV Selection *********************************************    
    dialog.label1 = dialog.add("statictext", [20, 10, 210, 30]);
    dialog.label1.text = "CSV File: ";

    dialog.csvFileNameInput = dialog.add("edittext", [20, 30, 360, 50]);
    dialog.csvFileNameInput.text = "--select or type CSV filename--";
    // dialog.csvFileNameInput.text = "~/bart/csvIn.csv";
    dialog.csvFileButton = dialog.add("button", [380, 30, 440, 50], "Browse");

    dialog.csvFileNameInput.onChange = function () {
        dialog.okButton.enabled = ((File(dialog.inFileNameInput.text).exists) && (File(dialog.csvFileNameInput.text).exists));
    }

    dialog.csvFileButton.onClick = function () {
        fileName = File.openDialog("Select CSV File:");
        if (fileName != null) {
            dialog.csvFileNameInput.text = fileName;
        }
        return true;
    }


    // ******************** PDF Selection: *********************************************    
    dialog.label2 = dialog.add("statictext", [20, 70, 210, 90]);
    dialog.label2.text = "Input File: ";

    dialog.inFileNameInput = dialog.add("edittext", [20, 90, 360, 110]);
    dialog.inFileNameInput.text = "--select or type input filename--";
    // dialog.inFileNameInput.text = "~/bart/pdfIn.pdf";
    dialog.inFileButton = dialog.add("button", [380, 90, 440, 110], "Browse");

    dialog.inFileNameInput.onChange = function () {
        dialog.okButton.enabled = ((File(dialog.inFileNameInput.text).exists) && (File(dialog.csvFileNameInput.text).exists));
    }

    dialog.inFileButton.onClick = function () {
        fileName = File.openDialog("Select Input File:");
        if (fileName != null) {
            dialog.inFileNameInput.text = fileName;
        }
        return true;
    }

    // ******************** Delimiter *********************************************    
    dialog.label3 = dialog.add("statictext", [20, 120, 300, 150]);
    dialog.label3.text = "CSV Delimiter: ";

    dialog.delimiterInput = dialog.add("edittext", [20, 150, 50, 170]);
    dialog.delimiterInput.text = ";";


    // ******************** Output Dir *********************************************    
    dialog.label4 = dialog.add("statictext", [20, 190, 300, 210]);
    dialog.label4.text = "Output Directory: ";

    dialog.outputDirInput = dialog.add("edittext", [20, 210, 360, 230]);
    dialog.outputDirInput.text = "~";
    dialog.outputDirButton = dialog.add("button", [380, 210, 440, 230], "Browse");

    dialog.outputDirButton.onClick = function () {
        dirName = Folder.selectDialog("Select output folder:", '~');
        if (dirName != null) {
            dialog.outputDirInput.text = dirName;
        }
        return true;
    }
    
    // ******************** Case Sensitive: *********************************************    
    dialog.caseSensitiveBox = dialog.add('checkbox', [20, 250, 210, 265], " Find case sensitive");
    dialog.caseSensitiveBox.value = false;
    
    dialog.label5a = dialog.add("statictext", [50, 265, 450, 280], "The fields in line 0 (the first line) are searched for in the input");
    dialog.label5b = dialog.add("statictext", [50, 280, 450, 295], "file. Check the box if you want this search to be caSe sENsitive");
    dialog.label5a.graphics.foregroundColor = gray;  
    dialog.label5b.graphics.foregroundColor = gray;  

    // ******************** Include line 0 *********************************************    
    dialog.includeLineZeroBox = dialog.add('checkbox', [20, 300, 210, 320], " Make file for line 0");
    dialog.includeLineZeroBox.value = true;
    
    dialog.label6a = dialog.add("statictext", [50, 315, 450, 330], "The file for line 0 is identical to the input file. Click");
    dialog.label6b = dialog.add("statictext", [50, 330, 450, 345], "the box if you want to include this file in the output");
    
    dialog.label6a.graphics.foregroundColor = gray;  
    dialog.label6b.graphics.foregroundColor = gray;  

    dialog.okButton     = dialog.add("button", [20,  365, 105, 385], "Go");
    dialog.cancelButton = dialog.add("button", [120, 365, 210, 385], "Cancel");
    dialog.helpButton   = dialog.add("button", [225, 365, 300, 385], "(?) Help");

    dialog.status      = dialog.add("statictext", [30, 345, 380, 365]);
    dialog.status.text = "...";

    dialog.okButton.onClick = function () {

        var returnArray = new Array();

        returnArray['csvFileName'] = dialog.csvFileNameInput.text;
        returnArray['inFileName'] = dialog.inFileNameInput.text;
        returnArray['delimiter']   = dialog.delimiterInput.text;
        returnArray['outputDir'] = dialog.outputDirInput.text;

        returnArray['caseSensitive']   = (dialog.caseSensitiveBox.value == true);
        returnArray['includeLineZero'] = (dialog.includeLineZeroBox.value == true);

        dialog.status.text = ("caseSEenSitive: " + returnArray['caseSensitive'] + ", line zero: " + returnArray['includeLineZero']);

        if (File(returnArray['csvFileName']).exists == false) {
            alert ("CSV File does not exist");
            return false;
        }

        if (File(returnArray['inFileName']).exists == false) {
            alert ("Input file does not exist");
            return false;
        }

        if (Folder(returnArray['outputDir']).exists == false) {
            alert ("Output dir does not exist");
            return false;
        }


        // dialog.status.text = "Working...";
        dialog.enabled = false;
        fixFile(returnArray);
        dialog.enabled = true;
        dialog.status.text = "done";

        dialog.close();
        return true;
    }

    dialog.cancelButton.onClick = function () {
        dialog.status.text = "done";
        dialog.close();
        return false;
    }

    dialog.helpButton.onClick = function () {
        openURL(docLink);
        return false;
    }


    dialog.show();    

    // * I don't think this code ever happens: 
    while (dialog.status.text != "done") {
        counter ++;
        dialog.status.text = "-/|\\"[counter % 4];
    }; // Wait for returnValue

    dialog.close();
    return true;
}

  
function openURL( address ) {  
    var f = File( Folder.temp + '/aiOpenURL.url' );  
    f.open( 'w' );  
    f.write( '[InternetShortcut]' + '\r' + 'URL=' + address + '\r' );  
    f.close();  
    f.execute();  
    return true;
}

function readInCSV(fileObj, delimiter) {
     var fileArray = new Array();
     fileObj.open('r');
     fileObj.seek(0, 0);
     while(!fileObj.eof) {
          var thisLine = fileObj.readln();
          var csvArray = thisLine.split(delimiter);
          fileArray.push(csvArray);
     }
     fileObj.close();
     return fileArray;
}

function myTrim(x) {
    return x.replace(/^\s+|\s+$/gm,'');
}

function getFileExtension(inputFileName) {
    return inputFileName.split('.').pop();
}

function fixFile(settingsArray) {

    inFile = File(settingsArray['inFileName']);
    csvFile = File(settingsArray['csvFileName']);

    var csvData = readInCSV(csvFile, settingsArray['delimiter']);

    var msg = ""; // collect the message to be displayed

    var colItems = new Array();
    docRef = app.open(inFile);

    // Find all texts from header (line 0):
    for (var textFrameNr = docRef.textFrames.length - 1; textFrameNr >= 0; textFrameNr--) { 
        for (var headerNr = 0; headerNr < csvData[0].length; headerNr++) {

            // compare these two:
            varA = docRef.textFrames[textFrameNr].contents;
            varB = csvData[0][headerNr];

            // strip spaces:
            varA = myTrim(varA);
            varB = myTrim(varB);

            // make it insensitive:
            if (settingsArray['caseSensitive'] !== true) {
                // alert("Case SensitIVE");
                varA = varA.toLowerCase();
                varB = varB.toLowerCase();            
            }

            if (varA == varB) {
                // Found the column:
                colItems[headerNr] = textFrameNr;
            }
        }
    }

    
    // Loop through the headers, check if all headers are found:
    for (headerNr = 0; headerNr < csvData[0].length; headerNr++) {
        if (typeof colItems[headerNr]  == 'undefined') {
            msg += "Header " + headerNr + " not found, text \"" + csvData[0][headerNr] + "\" could not be found in the Input File...\n";
        }
    }

    if (msg !== '') {
        alert (msg);
    } //else {
        // for (headerNr = 0; headerNr < csvData[0].length; headerNr++) {
        //    msg += csvData[0][headerNr] + " found in text frame " + colItems[headerNr] + "\n";
        // }
        // show the matches:
        // alert (msg);
    // }


    var startLine = (settingsArray['includeLineZero']) ? 0 : 1;
    for (lineNr = startLine; lineNr < csvData.length; lineNr++) {

        // the amount of CSV Values that were empty:
        var missingValue = 0;

        for (headerNr = 0; headerNr < csvData[0].length; headerNr++) {
            if (typeof colItems[headerNr] !== 'undefined') {
                if (typeof csvData[lineNr][headerNr] == 'undefined') {
                    newVal =  '';
                    missingValue += 1;
                } else {
                    newVal = csvData[lineNr][headerNr];
                }
                docRef.textFrames[colItems[headerNr]].contents = newVal;
            }
        }

        extension = getFileExtension(inFile.name);
        destName = settingsArray['outputDir'] + "/" + inFile.name.replace('.' + extension, "_" + lineNr + ".pdf");

        if (missingValue > 0) {
            destName = destName.replace(".pdf", "_(missing_" + missingValue + "_values).pdf");
        }
        // alert ("Saving as " + destName);
        docRef.saveAs(new File(destName), saveOptions);
    }


    docRef.close(SaveOptions.DONOTSAVECHANGES);
    // file.rename(file.name + "_done");

    return true;
}

// if ran as a stand alone script, like this:

// $ /Applications/Adobe\ Illutrator\ CC\ 2015/Adobe\ Illustrator.app/Contents/MacOS/Adobe\ Illustrator /run csv_bitch.jsx

// you might want to end by closing the Application:
// app.quit()