// readJson("./store.json", pageElementTable);
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  var jsonStr = JSON.stringify(request);
  document.querySelector(".migration textarea").value = jsonStr;
  pageElementTable(request);
});


getJSONInput(pageElementTable);

async function readJson(url, callback) {
  const response = await fetch(url);
  const store = await response.json();
  callback(store);
}


function getJSONInput(callback) {
  var button = document.querySelector(".migration button");
  button.onclick = function() {
    var data = document.querySelector(".migration textarea").value;
    try {
      var json = JSON.parse(data);
      callback(json);
    } catch (e) {
      alert("invalid json");
      console.error(e, "not valid json");
    }
  };
}

function getTableRows(json) {
  const { config, pageScraping, domainEntityProperties } = json;
  const { campaigns } = config;

  const externalPageElements = Object.values(pageScraping.pageElements).filter(
    ele => ele.type === "ExternalValue"
  );

  return externalPageElements.map(ele => {
    console.log(ele);
    const { id, name, type, pageTypeName, dataType } = ele;
    const depNames = getDEPNames(domainEntityProperties, id);
    const campRulesIdName = returnCampRulesIdName(campaigns);
    const campaignIds = checkCampaignForDEP(depNames, campRulesIdName);
    return {
      pageTypeName,
      name,
      dataType,
      type,
      id,
      depNames,
      campaignIds
    };
  });
}

function getDEPNames(deps, id) {
  const names = Object.values(deps)
    .filter(dep => dep.sources.filter(s => s.pageElementId === id).length)
    .map(d => d.name);
  return names != "" ? names.join(",") : "no DEP";
}

function returnCampRulesIdName(camp) {
  return camp.map(c => {
    const rules = c.collections.map(c => c.targetRulesExpression);
    return {
      name: c.name,
      rules: rules,
      id: c.id
    };
  });
}

function checkCampaignForDEP(deps, campaigns) {
  let campIds = [];
  campaigns.forEach(camp => {
    deps.split(",").forEach(d => {
      if (nameExistsInCamp(camp, d)) {
        campIds.push(camp.id);
      }
    });
  });
  return campIds.length > 0 ? campIds.join(",") : "not used";
}

function nameExistsInCamp(camp, name) {
  return JSON.stringify(camp).indexOf(name) > -1;
}

function pageElementTable(json) {
  const tableRowObject = getTableRows(json);
  var hotElement = document.querySelector("#hot");
  hotElement.innerHTML = "";
  // var hotElementContainer = hotElement.parentNode;

  var hotSettings = {
    data: tableRowObject,
    columns: [
      {
        data: "campaignIds",
        type: "text"
      },
      {
        data: "depNames",
        type: "text",
        width: 400
      },
      {
        data: "id",
        type: "numeric"
      },
      {
        data: "name",
        type: "text",
        width: 400
      },
      {
        data: "pageTypeName",
        type: "text"
      },
      {
        data: "dataType",
        type: "text"
      },
      {
        data: "type",
        type: "text"
      }
    ],
    autoWrapRow: true,
    rowHeaders: true,
    colHeaders: [
      "campaignIds",
      "depNames",
      "id",
      "name",
      "pageTypeName",
      "dataType",
      "type"
    ],
    columnSorting: {
      indicator: true
    },
    width: 880,
    filters: true,
    licenseKey: "non-commercial-and-evaluation"
  };
  var hot = new Handsontable(hotElement, hotSettings);
}
