const JSON_POSITION = "https://raw.githubusercontent.com/mzkii/kit-shuttle-bus/master/newTimeTable.json";
const BUS_STATUS_ABS_SUM = "運行中：土曜・夏期・春期休業期間 スケジュール";
const BUS_STATUS_ABS = "運行中：夏期・春期休業期間 スケジュール";
const BUS_STATUS_SUM = "運行中：土曜日 スケジュール";
const BUS_STATUS_NOR = "運行中";
const LAB65 = "八束穂キャンパス(65号館前)";
const LAB61 = "八束穂キャンパス(61号館前)";
const LAB74 = "八束穂キャンパス(74号館前)";
const CAM23 = "扇が丘キャンパス(23号館横)";
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
var updateTimeTable = function (isAbsence, isSaturday) {
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
        setAnyBusAlertDisplay(true);
        setTimeTableVisibility(false);
    } else {
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
function getTimeTableFromIsSaturday(jsonData, isSaturday) {
    return isSaturday ? jsonData.saturday : jsonData.weekday;
}
function getTimeTableFromJson(jsonData, isAbsence, isSaturday) {
    return getTimeTableFromIsSaturday(
        getTimeTableFromIsAbsence(jsonData, isAbsence),
        isSaturday
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
var initTable = function () {
    $.getJSON(JSON_POSITION, function (jsonData) {
        var date = new Date();
        /**
         * TODO: 日付の範囲を求める．
         * 期間：平成30年4月1日（日）～8月5日（日）、9月8日（土）～平成31年2月28日（木）
         */
        var isAbsence = false;
        var isSaturday = date.getDay() == 6;
        var selText = $("#sel option:selected").text();
        var timeTable = getTimeTableFromDeparture(
            getTimeTableFromJson(jsonData, isAbsence, isSaturday),
            selText
        );
        timeTable.forEach(function (it) {
            var row = document.getElementById("timetable").insertRow(-1);
            row.insertCell(-1).innerHTML = selText == CAM23 ? "八束穂キャンパス" : "扇が丘キャンパス";
            row.insertCell(-1).innerHTML = it.departure[0];
            row.insertCell(-1).innerHTML = "-";
        });
        setInterval(function () { updateTimeTable(isAbsence, isSaturday) }, 1000);
        updateTimeTable(isAbsence, isSaturday);
    });
}
$(function () {
    initTable();
    $("#sel").change(function () {
        deleleTable();
        initTable();
    });
});