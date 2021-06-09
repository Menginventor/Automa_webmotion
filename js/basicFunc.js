var today = new Date();
var cookieExpiry = new Date(today.getTime() + 30 * 24 * 3600 * 1000); // plus 30 days
function setCookie(name, value)
{
    document.cookie=name + "=" + escape(value) + "; path=/; expires=" + cookieExpiry.toGMTString();
}

function ReadCookie() {
    var allcookies = document.cookie;
    console.log(allcookies);
    cookiearray = allcookies.split(';');
    for(var i=0; i<cookiearray.length; i++) {
        name = cookiearray[i].split('=')[0];
        value = cookiearray[i].split('=')[1];
        //document.write ("Key is : " + name + " and Value is : " + value);
        if(name == 'robotHost'){
            document.getElementById("robot_host").value = value;
        }
    }
}

ReadCookie();

function checkHost(){//also add verified host to cookie
    console.log('Check host');
    var robotHost = document.getElementById("robot_host").value;
    console.log(robotHost);
    let xhttp = new XMLHttpRequest();
    xhttp.timeout = 2000;
    xhttp.open("GET", 'http://'+robotHost+'/check', true);
    xhttp.onreadystatechange=function(){
        //console.log(xhttp.readyState );
        //console.log(xhttp.status  );
       if (xhttp.readyState == 4 && xhttp.status == 200) {
            document.getElementById("host_reply").innerHTML = xhttp.responseText;
            setCookie('robotHost', robotHost)
       }
       else{
       document.getElementById("host_reply").innerHTML = "time-out";
       }
    }
     //xhttp.open("GET", 'http://192.168.1.54/check', false);
    document.getElementById("host_reply").innerHTML = 'waiting for response';
    xhttp.send();


}
function  clrHostReply(){
        document.getElementById("host_reply").innerHTML = '';
}
function sendActionLine(btn){
    var crrRow = btn.parentNode.parentNode;
    var data = '';
    for (var j=1; j<10; j++){
        data += crrRow.cells[j].innerHTML;
        data += ','
    }
    console.log(data);
    var robotHost = document.getElementById("robot_host").value;
    var xhttp = new XMLHttpRequest();
    xhttp.timeout = 2000;
    xhttp.open("GET", 'http://'+robotHost+'/action?value='+data, true);
    xhttp.onreadystatechange=function(){
       console.log(xhttp.readyState );
       console.log(xhttp.status  );
       if (xhttp.readyState == 4 && xhttp.status == 200) {
            console.log('ok');
             document.getElementById("host_reply").innerHTML = xhttp.responseText;
       }
       else{
           //console.log('fail to connect to robot host');
       }
    }
     //xhttp.open("GET", 'http://192.168.1.54/check', false);
    document.getElementById("host_reply").innerHTML = 'sending..';
    xhttp.send();
}

function sendActionAll(row){
    console.log('sendActionAll');
    let table = document.getElementById("csvTable");
    var crrRow =  table.rows[row];//row[0] is header
    var data = '';
    for (var j=1; j<10; j++){
        data += crrRow.cells[j].innerHTML;
        data += ','
    }
    var robotHost = document.getElementById("robot_host").value;
    let xhttp = new XMLHttpRequest();
    xhttp.timeout = 2000;
    xhttp.open("GET", 'http://'+robotHost+'/action?value='+data, true);
    xhttp.onreadystatechange=sendActionAllCallback(xhttp,row+1);
    document.getElementById("host_reply").innerHTML = 'sending row:'+crrRow;
    xhttp.send();

}
function sendActionAllCallback(xhttp,crr_row) {
    return function() {
         let table = document.getElementById("csvTable");

         if (crr_row >= table.rows.length){
            document.getElementById("host_reply").innerHTML = 'sending all done';
         }
        else{
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                console.log('row:'+crr_row+' of '+table.rows.length-1+',ok');

                document.getElementById("host_reply").innerHTML = 'row:'+crr_row+',ok';
                sendActionAll(crr_row)
            }
           else{
               //console.log('fail to connect to robot host');
           }
        }

        /* Do whatever */
    };
}

function reIndex(){
    let table = document.getElementById("csvTable");
    for (let i = 1;i<table.rows.length;i++) {
        let row = table.rows[i];
        //console.log(i);
        row.cells[0].innerHTML = i;
    }
}
function newRow(insertIdx) {
          var table = document.getElementById("csvTable");
          var row = table.insertRow(insertIdx);
          var cells = [];
          for (var idx = 0;idx<12;idx++){
                 var crr_cell = row.insertCell(idx);
                 cells.push(crr_cell);
                 if (idx > 0 && idx < 11){
                 crr_cell.contentEditable = "true";
                 }
          }
          var rowCount = table.rows.length;
           var sendRowHTML = '<input type="button" value = "Send" onclick="sendActionLine(this)" />';
           var delRowHTML = '<input type="button" value = "Delete Row" onclick="deleteRow(this)" />';
           var insertRowAboveHTML = '<input type="button"  value = "Insert Row Above" onclick="insertRow(this,0)" />';
           var insertRowBelowHTML = '<input type="button"  value = "Insert Row Below" onclick="insertRow(this,1)" />';
           cells[11].innerHTML = sendRowHTML+insertRowAboveHTML+insertRowBelowHTML+delRowHTML;
           reIndex();
           return row;
 }
 function insertRow(row,offsetIdx) {
  var idx = row.parentNode.parentNode.rowIndex;
  newRow(idx+offsetIdx)
  console.log(idx);
}

function deleteRow(row) {
  var i = row.parentNode.parentNode.rowIndex;
  document.getElementById('csvTable').deleteRow(i);
     reIndex();
}
function clearTable(){
    var table = document.getElementById("csvTable");
    for (let i = table.rows.length-1;i>0;i--) {
         table.deleteRow(i);
    }
}

function readSingleFile(evt) {

    var f = evt.target.files[0];
    if (f) {
        var r = new FileReader();
        r.onload = function(e) {//define function
            clearTable();
            var contents = e.target.result;
            //document.write("File Uploaded! <br />" + "name: " + f.name + "<br />" + "<br />" + "type: " + f.type + "<br />" + "size: " + f.size + " bytes <br />");

            var lines = contents.split("\n");
            console.log('Header');
            console.log(lines[0]);
            for (var i=1; i<lines.length; i++){//skip for first row
                var tableRow = newRow(-1);
                var cols = lines[i].split(",");

                console.log(tableRow.rowIndex);
                 console.log(lines[i]);
                for (var j=0; j<cols.length; j++){
                     if (j>9)break;//limit to 9 column
                    tableRow.cells[j+1].innerHTML = cols[j];
                }
        }
        //document.write(output);
        }
        r.readAsText(f);
        //document.write(output);
    } else {
    alert("Failed to load file");
    }
}
document.getElementById('fileinput').addEventListener('change', readSingleFile);
