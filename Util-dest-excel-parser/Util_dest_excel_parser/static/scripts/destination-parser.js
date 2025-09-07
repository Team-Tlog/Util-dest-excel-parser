
const locationList = document.getElementById('location-list');
const selectedLocationTitle = document.getElementById('selected-location');
const featuresInfoContainer = document.getElementById('features-info');
const inputBox = document.getElementById('file-input');






// ● 필드 명칭

const col_name = 'name';
const col_tag = 'tagNames';
const col_weight = 'weight';

/*
 * 위의 기본적인 필드 데이터 이외에
 *      number : 1부터 시작하는 여행지 번호
 *      modified : 삭제된 태그 수
 *      isModified : 각 태그별 삭제 여부
 * 가 추가됩니다.
 */
var placeData = [];



// ================== State ==================

var currentDestNum = 0;


// ===================== File Input =====================

var inputBox_latest = '';

inputBox.addEventListener('click', function (event) {
    this.value = null;
})

inputBox.addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (!file)
        return;
    if (inputBox_latest == file.name) {
        if (!confirm('현재 동일한 파일이 열려있습니다.\n파일을 다시 엽니까?'))
            return;
    }
    inputBox_latest = file.name;

    makeLoadingView(file.name);

    // 폼 데이터를 담을 FormData 객체를 생성합니다.
    // FormData는 HTML 폼 데이터를 쉽게 서버로 보낼 수 있게 해줍니다.
    const formData = new FormData();
    formData.append('file', file); // 'file'은 Flask 서버에서 파일을 식별할 키입니다.

    // Fetch API를 사용하여 서버로 파일을 전송합니다.
    fetch('/parse', {
        method: 'POST',
        body: formData, // FormData 객체를 body에 직접 담습니다.
    })
    .then(response => {
        if (!response.ok) {
            // HTTP 상태 코드가 200-299 범위에 있지 않으면 에러를 발생시킵니다.
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // 서버의 응답을 텍스트로 받습니다.
    })
    .then(data => {
        // 서버로부터 받은 성공 메시지
        placeData = data;

        try {
            initializePlaceData();
            initial();
        } catch (error) {
            alert('처리 중 오류 : ' + error.message);
            console.error("error : 처리 중 오류 ", error);
        }
    })
    .catch(error => {
        // 네트워크 오류나 서버 에러를 처리합니다.
        alert('업로드 실패: ' + error.message);
        console.error('Error:', error);
    });
});

function initializePlaceData() {
    var i = 1;
    placeData.forEach(place => {
        place.number = i++;
        place.modified = 0;
        place.isModified = new Array(place[col_tag].length).fill(false);
    });
}









// ● 기능 : 로딩 화면 구성

function makeLoadingView(fileName) {
    locationList.replaceChildren()

    const loadingMsg = document.createElement('li');
    loadingMsg.textContent = "[" + fileName + "] 처리중...";
    locationList.appendChild(loadingMsg);

    selectedLocationTitle.textContent = "[" + fileName + "] 처리중...";
    featuresInfoContainer.replaceChildren()
}


// ● 기능 : 지명 리스트 생성

function initial() {
    locationList.replaceChildren();

    placeData.forEach(place => {
        var isHotPlace = false;
        for (var k = 0; k < place[col_tag].length; k++)
            if (place[col_tag][k] == '핫플레이스') {
                isHotPlace = true;
                break;
            }

        const listItem = document.createElement('li');
        listItem.textContent = "[" + place.number + "] " + place[col_name];
        listItem.addEventListener('click', () => select(place.number));
        if (isHotPlace)
            listItem.style.color = '#FE4433';

        locationList.appendChild(listItem);
    });

    // 초기 상태로 첫 번째 지명의 정보 표시 
    if (placeData.length > 0) {
        select(1);
    }
}


// ● 기능 : 항목 선택
function select(idx) {
    currentDestNum = idx;
    displayFeatures(placeData[idx - 1]);

    var i = 1;
    document.querySelectorAll('#location-list li').forEach(
        item => {
            if (i == idx)
                item.style.backgroundColor = '#f0f0f0';
            else
                item.style.backgroundColor = '#ffffff';
            i++;
        }
    );
}

// ● 보조기능 : 태그 표 생성
const t_name = '태그';
const t_descr = '가중치';
const t_remove = '삭제';
function displayFeatures(place) {
    selectedLocationTitle.textContent = "[" + place.number + "] " + place[col_name];
    featuresInfoContainer.replaceChildren(); // 기존 내용 비우기
    featuresInfoContainer.scrollTop = 0;

    if (place[col_tag] && place[col_tag].length > 0) {
        const table = document.createElement('table');
        table.id = 'features-table';

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        const featureHeader = document.createElement('th');
        featureHeader.textContent = t_name;

        const weightHeader = document.createElement('th');
        weightHeader.textContent = t_descr;

        const removeHeader = document.createElement('th');
        removeHeader.textContent = t_remove;

        headerRow.appendChild(featureHeader);
        headerRow.appendChild(weightHeader);
        headerRow.appendChild(removeHeader);
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        for (let i = 0; i < place[col_tag].length; i++) {
            var tagName = place[col_tag][i];
            var weight = place[col_weight][i];

            const row = document.createElement('tr');
            row.destIdx = place.number - 1;
            row.tagIdx = i;

            const featureCell = document.createElement('td');
            featureCell.textContent = tagName;
            const weightCell = document.createElement('td');
            weightCell.textContent = weight;
            const removeCell = document.createElement('td');

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.rowIdx = i;
            checkbox.checked = place.isModified[i];
            checkbox.addEventListener('change', removeCheckBoxChanged);
            removeCell.appendChild(checkbox);

            row.appendChild(featureCell);
            row.appendChild(weightCell);
            row.appendChild(removeCell);
            tbody.appendChild(row);

            viewTagRemoveEffect_tag(row);
        }
        table.appendChild(tbody);
        featuresInfoContainer.appendChild(table);
    } else {
        featuresInfoContainer.textContent = '해당 지명의 특징 정보가 없습니다.';
    }
}


// ● 핸들러 : 태그 제거 버튼

function removeCheckBoxChanged(event) {
    var rowNum = this.rowIdx + 1;
    var place = placeData[currentDestNum - 1];

    var isChecked = event.target.checked;
    if (isChecked) {
        place.modified++;
        place.isModified[rowNum - 1] = true;
    }
    else {
        place.modified--;
        place.isModified[rowNum - 1] = false;
    }
    viewTagRemoveEffect_dest(currentDestNum - 1);
    viewTagRemoveEffect_tag(document.getElementById('features-table').rows[rowNum]);
}

// ● 보조기능 : 태그 제거 효과 적용

function viewTagRemoveEffect_dest(destIdx) {
    var destItem = document.querySelectorAll('#location-list li')[destIdx];
    if (0 < placeData[destIdx].modified) {
        destItem.style.border = '2px solid blue';
    }
    else {
        destItem.style.border = '';
    }
}

function viewTagRemoveEffect_tag(row) {
    var tagIdx = row.tagIdx;
    var place = placeData[row.destIdx];
    var cols = row.cells;
    for (var c = 0; c < cols.length; c++) {
        if (place.isModified[tagIdx])
            cols[c].style.background = '#cccccc';
        else if (c == 1) {
            var colorPercent = (place[col_weight][tagIdx] - 0.5) * 100 / 0.5;
            if (colorPercent < 7) colorPercent = 7;
            var color = '#A2E1DB'; // (50 <= colorPercent ? '#A2E1DB' : '#FFDBCC');
            var gradientStyle = 'linear-gradient(to right, ' + color + ' ' + colorPercent + '%, #FFFFFF ' + colorPercent + '%)';
            cols[c].style.background = gradientStyle;
        }
        else
            cols[c].style.background = '';
    }

    if (place[col_tag][tagIdx] == '핫플레이스') {
        var listItem = document.querySelectorAll('#location-list li')[row.destIdx];
        if (place.isModified[tagIdx])
            listItem.style.color = '';
        else
            listItem.style.color = '#FE4433';
    }
}






// ===================== Modify Submit =====================

function submitModify() {
    // 요청 준비

    var reqArr = [];
    for (place of placeData) {
        if (place.modified <= 0)
            continue;

        for (var i = 0; i < place[col_tag].length; i++)
            if (place.isModified[i]) {
                var req = new Object();
                req.row = place.number;
                req.tag = place[col_tag][i];
                req.value = place[col_weight][i];
                req.task = 'REMOVE';
                reqArr.push(req);
            }
    }
    if (reqArr.length <= 0) {
        alert('수정된 항목이 없습니다!');
        return;
    }

    // API 준비

    var file = inputBox.files[0];
    var formData = new FormData();
    formData.append('file', file);
    formData.append('data', JSON.stringify(reqArr));

    var fileName = '';

    // Fetch API를 사용하여 서버로 파일을 전송합니다.
    fetch('/modify', {
        method: 'POST',
        body: formData, // FormData 객체를 body에 직접 담습니다.
    })
    .then(response => {
        if (!response.ok) {
            alert("수정 실패...");
            // HTTP 상태 코드가 200-299 범위에 있지 않으면 에러를 발생시킵니다.
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        fileName = getFilenameFromContentDisposition(response.headers.get('Content-Disposition'));
        // 응답 본문을 Blob 객체로 변환
        return response.blob();
    })
    .then(blob => {
        // Blob 객체를 사용하여 파일 다운로드 링크 생성
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName; // 파일 이름 설정
        document.body.appendChild(a);
        a.click(); // 다운로드 시작
        window.URL.revokeObjectURL(url); // 메모리 해제
        a.remove(); // <a> 태그 제거
    })
    .catch(error => {
        alert("파일 다운로드 실패...");
        console.error('파일 다운로드 중 오류 발생:', error);
    });
}

function getFilenameFromContentDisposition(header) {
    if (!header) {
        return null;
    }

    // Check for RFC 5987 encoded filename first (filename*=UTF-8'')
    const filenameStarMatch = /filename\*=(.+)/.exec(header);
    if (filenameStarMatch) {
        try {
            const parts = filenameStarMatch[1].split("'");
            if (parts.length === 3) {
                // parts[0] is charset (e.g., 'UTF-8'), parts[1] is language (e.g., 'en'), parts[2] is the encoded value
                const encodedFilename = decodeURIComponent(parts[2]);
                return encodedFilename;
            }
        } catch (e) {
            console.error("Failed to decode filename from header", e);
        }
    }

    // Fallback to standard filename="<value>"
    const filenameMatch = /filename="([^"]+)"/.exec(header);
    if (filenameMatch) {
        return filenameMatch[1];
    }

    return null;
}