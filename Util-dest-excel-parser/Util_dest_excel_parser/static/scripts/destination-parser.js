
const locationList = document.getElementById('location-list');
const selectedLocationTitle = document.getElementById('selected-location');
const featuresInfoContainer = document.getElementById('features-info');
const inputBox = document.getElementById('file-input');
const inputButton = document.getElementById('submit-button');



var placeData = [];

inputButton.addEventListener('click', () => {
    const file = inputBox.files[0];

    if (!file)
        return;

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





const col_name = 'name';
const col_tag = 'tagNames';
const col_weight = 'weight';

// ● 기능 : 지명 리스트 생성

function initial() {
    while (locationList.firstChild) {
        locationList.removeChild(locationList.firstChild);
    }

    var i = 1;
    placeData.forEach(place => {
        place.number = i;
        var isHotPlace = false;
        for (var k = 0; k < place[col_tag].length; k++)
            if (place[col_tag][k] == '핫플레이스') {
                isHotPlace = true;
                break;
            }

        const listItem = document.createElement('li');
        listItem.textContent = "[" + i + "] " + place[col_name];
        listItem.addEventListener('click', () => select(place.number));
        if (isHotPlace)
            listItem.style.color = '#FE4433';

        locationList.appendChild(listItem);
        i++;
    });

    // 초기 상태로 첫 번째 지명의 정보 표시 
    if (placeData.length > 0) {
        select(1);
    }
}


// ● 기능 : 항목 선택
function select(idx) {
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
function displayFeatures(place) {
    selectedLocationTitle.textContent = "[" + place.number + "] " + place[col_name];
    featuresInfoContainer.innerHTML = ''; // 기존 내용 비우기
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

        headerRow.appendChild(featureHeader);
        headerRow.appendChild(weightHeader);
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        for (let i = 0; i < place[col_tag].length; i++) {
            var tagName = place[col_tag][i];
            var weight = place[col_weight][i];

            const row = document.createElement('tr');
            const featureCell = document.createElement('td');
            featureCell.textContent = tagName;
            const weightCell = document.createElement('td');
            weightCell.textContent = weight;

            var colorPercent = (weight - 0.5) * 100 / 0.5;
            if (colorPercent < 7) colorPercent = 7;
            var color = '#A2E1DB'; // (50 <= colorPercent ? '#A2E1DB' : '#FFDBCC');
            var gradientStyle = 'linear-gradient(to right, ' + color + ' ' + colorPercent + '%, #FFFFFF ' + colorPercent + '%)';
            weightCell.style.background = gradientStyle;

            row.appendChild(featureCell);
            row.appendChild(weightCell);
            tbody.appendChild(row);
        }
        table.appendChild(tbody);
        featuresInfoContainer.appendChild(table);
    } else {
        featuresInfoContainer.textContent = '해당 지명의 특징 정보가 없습니다.';
    }
}