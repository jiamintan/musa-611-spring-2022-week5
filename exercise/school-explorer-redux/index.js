/* global schools */

const schoolMap = L.map('school-map').setView([39.95303901388685, -75.16341794003617], 13);
const schoolLayer = L.layerGroup().addTo(schoolMap);

L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.{ext}', {
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  subdomains: 'abcd',
  minZoom: 0,
  maxZoom: 18,
  ext: 'png',
}).addTo(schoolMap);

const schoolList = document.querySelector('#school-list');
const gradeLevelSelect = document.querySelector('#grade-level-select');
const zipCodeSelect = document.querySelector('#zip-code-select');

/* ====================

# Exercise: School Explorer (redux)

==================== */

let showSchoolInfo = (marker, school) => {
  const dataFileName = `../../data/demographics/${school['ULCS Code']}.json`;
  fetch(dataFileName)
    .then(response => response.json())
    .then(data => {
      const first = data[0];
      const pctm = first['MalePCT'];
      const pctf = first['FemalePCT']
      marker.bindPopup(`
        <h3>${school['Publication Name']}</h3>
        <ul>
          <li>Percent Male: ${pctm}%</li>
          <li>Percent Female: ${pctf}%</li>
        </ul>`).openPopup();
    })
}

/* PASTE YOUR WEEK4 EXERCISE CODE HERE */

let updateSchoolMarkers = (schoolsToShow) => {
  schoolLayer.clearLayers();
  schoolsToShow.forEach((school) => {
    const [lat, lng] = JSON.parse(`[${school['GPS Location']}]`);
    const schoolName = school['Publication Name'];
    const marker = L.marker([lat, lng]);
    marker.bindTooltip(schoolName).addTo(schoolMap);
    schoolLayer.addLayer(marker);

    marker.addEventListener('click', () => {
      showSchoolInfo(marker, school);
    });
  });
};

let updateSchoolList = (schoolsToShow) => {
  schoolList.innerHTML = '';
  let schoolNames = [];
  schoolsToShow.map((school) => schoolNames.push(school['Publication Name']));
  schoolNames = [...new Set(schoolNames)].sort();
  schoolNames.forEach((name) => schoolList
    .appendChild(htmlToElement(`<li>${name}</li>`)));
};

let initializeZipCodeChoices = () => {
  let zipCodes = [];
  schools.map((school) => zipCodes.push(school['Zip Code'].substring(0, 5)));
  zipCodes = [...new Set(zipCodes)].sort();
  zipCodes.forEach((code) => zipCodeSelect
    .appendChild(htmlToElement(`<option>${code}</option>`)));
};

let filteredSchools = () => {
  if ((gradeLevelSelect.value !== '') && (zipCodeSelect.value !== '')) {
    return schools.filter((school) => (school[gradeLevelSelect.value] === '1')
        && (school['Zip Code'].substring(0, 5) === zipCodeSelect.value));
  } if ((gradeLevelSelect.value === '') && (zipCodeSelect.value !== '')) {
    return schools.filter((school) => school['Zip Code']
      .substring(0, 5) === zipCodeSelect.value);
  } if ((gradeLevelSelect.value !== '') && (zipCodeSelect.value === '')) {
    return schools.filter((school) => school[gradeLevelSelect.value] === '1');
  }
  return schools;
};

/*

No need to edit anything below this line ... though feel free.

*/

// The handleSelectChange function is an event listener that will be used to
// update the displayed schools when one of the select filters is changed.
let handleSelectChange = () => {
  const schoolsToShow = filteredSchools() || [];
  updateSchoolMarkers(schoolsToShow);
  updateSchoolList(schoolsToShow);
};

gradeLevelSelect.addEventListener('change', handleSelectChange);
zipCodeSelect.addEventListener('change', handleSelectChange);

// The code below will be run when this script first loads. Think of it as the
// initialization step for the web page.
initializeZipCodeChoices();
updateSchoolMarkers(schools);
updateSchoolList(schools);
