const JSON_POSITION = "https://raw.githubusercontent.com/mzkii/kit-shuttle-bus/master/newTimeTable.json";
const BUS_STATUS_ABS_SUM = "<strong>運行中：</strong><br><br>土曜日 スケジュール<br><br>夏期・春期休業期間 スケジュール<br><br>平成30年8月6日（月）～9月7日（金）、平成31年3月1日（木）～3月29日（金）";
const BUS_STATUS_ABS = "<strong>運行中：</strong><br><br>夏期・春期休業期間 スケジュール<br><br>平成30年8月6日（月）～9月7日（金）、平成31年3月1日（木）～3月29日（金）";
const BUS_STATUS_SUM = "<strong>運行中：</strong><br><br>土曜日 スケジュール";
const BUS_STATUS_NOR = "<strong>運行中</strong>";
const LAB65 = "八束穂キャンパス(65号館前)";
const LAB61 = "八束穂キャンパス(61号館前)";
const LAB74 = "八束穂キャンパス(74号館前)";
const CAM23 = "扇が丘キャンパス(23号館横)";
const OUT_OF_SERVICE = "現在運行予定の便はありません";
function getColorClassName(second) {
    if (second < 60 * 5) return "bg-danger";
    if (second < 60 * 15) return "bg-warning";
    if (second < 60 * 60) return "bg-success";
    return "bg-white";
}
function getNowTimeAsSecond() {
    var date = new Date();
    return date.getHours() * 60 * 60 + date.getMinutes() * 60 + date.getSeconds();
}
function getTimeDiff(second) {
    return second - getNowTimeAsSecond();
}
function getTimeFormatStringFromSecond(second) {
    return ("00" + Math.floor(second / 60 / 60)).slice(-2) + ":" +
        ("00" + Math.floor((second / 60) % 60)).slice(-2) + ":" +
        ("00" + second % 60).slice(-2);
}
function hasAnyTable(timetable) {
    return timetable.rows.length <= 1;
}
function setBusStatusDisplay(visibility) {
    var alert = document.getElementById("alert-success");
    if (visibility) alert.style.display = "block";
    else alert.style.display = "none";
}
function setBusStatusText(text) {
    var alert = document.getElementById("alert-success");
    alert.innerHTML = text;
}
function setAnyBusAlertText(text) {
    var alert = document.getElementById("alert-danger");
    alert.innerHTML = text;
}
function setAnyBusAlertDisplay(visibility) {
    var alert = document.getElementById("alert-danger");
    if (visibility) alert.style.display = "block";
    else alert.style.display = "none";
}
function setTimeTableVisibility(visibility) {
    var timetable = document.getElementById("timetable");
    if (visibility) timetable.style.visibility = "visible";
    else timetable.style.visibility = "hidden";
}
function getSecondFromTimeFormat(timeFormatString) {
    return parseInt(timeFormatString.substr(0, 2)) * 60 * 60 +
        parseInt(timeFormatString.substr(3, 4)) * 60;
}
var updateTimeTable = function (isAbsence, day) {
    var table = document.getElementById("timetable");
    var visibleRowsLength = 1;
    for (var i = 1; i < table.rows.length; i++) {
        var departure = table.rows[i].cells[1].firstChild.data;
        var diff = getTimeDiff(getSecondFromTimeFormat(departure));
        if (diff >= 0) {
            table.rows[i].cells[2].firstChild.data = getTimeFormatStringFromSecond(diff);
            timetable.rows[i].className = getColorClassName(diff);
            visibleRowsLength++;
        } else {
            table.rows[i].style.display = "none";
        }
    }
    if (visibleRowsLength <= 1) {
        setBusStatusDisplay(false);
        setAnyBusAlertText(OUT_OF_SERVICE);
        setAnyBusAlertDisplay(true);
        setTimeTableVisibility(false);
    } else {
        var isSaturday = day == 6;
        if (isAbsence && isSaturday) setBusStatusText(BUS_STATUS_ABS_SUM);
        else if (isAbsence) setBusStatusText(BUS_STATUS_ABS);
        else if (isSaturday) setBusStatusText(BUS_STATUS_SUM);
        else setBusStatusText(BUS_STATUS_NOR);
        setBusStatusDisplay(true);
        setAnyBusAlertDisplay(false);
        setTimeTableVisibility(true);
    }
}
function getTimeTableFromIsAbsence(jsonData, isAbsence) {
    return isAbsence ? jsonData.absence : jsonData.semester;
}
function getTimeTableFromDay(jsonData, day) {
    switch (day) {
        case 0: return jsonData.other;      // 日曜日
        case 6: return jsonData.saturday;   // 土曜日
        default: return jsonData.weekday;   // 平日
    }
}
function getTimeTableFromJson(jsonData, isAbsence, day) {
    return getTimeTableFromDay(
        getTimeTableFromIsAbsence(jsonData, isAbsence),
        day
    );
}
function getTimeTableFromDeparture(jsonData, departure) {
    switch (departure) {
        case LAB65: {
            jsonData.toCollege.forEach(function (it) { it.departure = [it.departure[0]] });
            return jsonData.toCollege;
        }
        case LAB61: {
            jsonData.toCollege.forEach(function (it) { it.departure = [it.departure[1]] });
            return jsonData.toCollege;
        }
        case LAB74: {
            jsonData.toCollege.forEach(function (it) { it.departure = [it.departure[2]] });
            return jsonData.toCollege;
        }
        case CAM23:
        default:
            return jsonData.toLab;
    }
}
function deleleTable() {
    var table = document.getElementById("timetable");
    var length = table.rows.length;
    for (var i = 0; i < length - 1; i++) {
        table.deleteRow(1);
    }
}
function getAbsence(date) {
    var today = new Date();
    var d20180806 = new Date(2018, 8, 6, 0, 0);
    var d20180908 = new Date(2018, 9, 8, 0, 0);
    var d20190301 = new Date(2019, 3, 1, 0, 0);
    var d20190329 = new Date(2019, 3, 30, 0, 0);
    console.log(d20180806.getTime() <= today.getTime(), today.getTime() <= d20180908.getTime());
    console.log(d20190301.getTime() <= today.getTime(), today.getTime() <= d20190329.getTime());
    return true;
}
var initTable = function () {
    $.getJSON(JSON_POSITION, function (jsonData) {
        var date = new Date();
        var selText = $("#sel option:selected").text();
        var timeTable = getTimeTableFromDeparture(
            getTimeTableFromJson(jsonData, getAbsence(date), date.getDay()), selText);
        timeTable.forEach(function (it) {
            var row = document.getElementById("timetable").insertRow(-1);
            row.insertCell(-1).innerHTML = selText == CAM23 ? "八束穂キャンパス" : "扇が丘キャンパス";
            row.insertCell(-1).innerHTML = it.departure[0];
            row.insertCell(-1).innerHTML = "-";
        });
        setInterval(function () { updateTimeTable(getAbsence(date), date.getDay()) }, 1000);
        updateTimeTable(getAbsence(date), date.getDay());
    });
}
$(function () {
    initTable();
    $("#sel").change(function () {
        deleleTable();
        initTable();
    });
});
