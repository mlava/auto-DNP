var adnpMode, templateUID;
var hashChange = undefined;

export default {
  onload: ({ extensionAPI }) => {
    const config = {
      tabTitle: "Auto-DNP templates",
      settings: [
        {
          id: "adnp-mode",
          name: "Preferred Mode",
          description: "Set templates by Daily or Weekday/Weekend settings",
          action: { type: "select", items: ["Daily", "Weekday/Weekend"], onChange: (evt) => { setMode(evt); } },
        },
        {
          id: "adnp-Mon",
          name: "Monday's template",
          description: "Block reference for template",
          action: { type: "input", placeholder: "" },
        },
        {
          id: "adnp-Tue",
          name: "Tuesday's template",
          description: "Block reference for template",
          action: { type: "input", placeholder: "" },
        },
        {
          id: "adnp-Wed",
          name: "Wednesday's template",
          description: "Block reference for template",
          action: { type: "input", placeholder: "" },
        },
        {
          id: "adnp-Thu",
          name: "Thursday's template",
          description: "Block reference for template",
          action: { type: "input", placeholder: "" },
        },
        {
          id: "adnp-Fri",
          name: "Friday's template",
          description: "Block reference for template",
          action: { type: "input", placeholder: "" },
        },
        {
          id: "adnp-Sat",
          name: "Saturday's template",
          description: "Block reference for template",
          action: { type: "input", placeholder: "" },
        },
        {
          id: "adnp-Sun",
          name: "Sunday's template",
          description: "Block reference for template",
          action: { type: "input", placeholder: "" },
        },
      ]
    };
    const config2 = {
      tabTitle: "Auto-DNP templates",
      settings: [
        {
          id: "adnp-mode",
          name: "Preferred Mode",
          description: "Set templates by Daily or Weekday/Weekend settings",
          action: { type: "select", items: ["Daily", "Weekday/Weekend"], onChange: (evt) => { setMode(evt); } },
        },
        {
          id: "adnp-weekday",
          name: "Weekday template",
          description: "Block reference for template",
          action: { type: "input", placeholder: "" },
        },
        {
          id: "adnp-weekend",
          name: "Weekend template",
          description: "Block reference for template",
          action: { type: "input", placeholder: "" },
        },
      ]
    };

    // onload
    if (extensionAPI.settings.get("adnp-mode")) {
      adnpMode = extensionAPI.settings.get("adnp-mode");
      if (adnpMode == "Daily") {
        extensionAPI.settings.panel.create(config);
      } else if (adnpMode == "Weekday/Weekend") {
        extensionAPI.settings.panel.create(config2);
      }
    } else {
      extensionAPI.settings.panel.create(config);
    }
    checkDNP(adnpMode);
    
    // onChange
    function setMode(evt) {
      adnpMode = evt;
      if (adnpMode == "Daily") {
        extensionAPI.settings.panel.create(config);
      } else if (adnpMode == "Weekday/Weekend") {
        extensionAPI.settings.panel.create(config2);
      }
    }

    hashChange = async (e) => {
      checkDNP(adnpMode);
    };
    window.addEventListener('hashchange', hashChange);

    async function checkDNP(adnpMode) {
      var pageUid = await window.roamAlphaAPI.ui.mainWindow.getOpenPageOrBlockUid();
      if (!pageUid) {
        var uri = window.location.href;
        const regex = /^https:\/\/roamresearch.com\/#\/(app|offline)\/\w+$/; //today's DNP
        let logPage = document.getElementById("rm-log-container");
        if (uri.match(regex) || logPage) {
          var today = new Date();
          var dd = String(today.getDate()).padStart(2, '0');
          var mm = String(today.getMonth() + 1).padStart(2, '0');
          var yyyy = today.getFullYear();
          pageUid = mm + '-' + dd + '-' + yyyy;
        }
      }
      var pageTitle = window.roamAlphaAPI.q(`[:find (pull ?p [:node/title]) :where [?p :block/uid "${pageUid}"]]`)?.[0]?.[0]?.title || "";

      var currentDate = new Date();
      var currentMonth = (currentDate.getMonth() + 1).toString();
      var currentDay = currentDate.getDate().toString();
      var currentYear = currentDate.getFullYear().toString();
      currentDate = currentMonth.padStart(2, "0") + "-" + currentDay.padStart(2, "0") + "-" + currentYear;
      var d = new Date();
      var dayOfWeek = d.getDay();

      if (pageUid === currentDate) {
        if (adnpMode == "Daily") {
          if (dayOfWeek == 0) {
            if (extensionAPI.settings.get("adnp-Sun")) {
              templateUID = extensionAPI.settings.get("adnp-Sun");
            }
          } else if (dayOfWeek == 1) {
            if (extensionAPI.settings.get("adnp-Mon")) {
              templateUID = extensionAPI.settings.get("adnp-Mon");
            }
          } else if (dayOfWeek == 2) {
            if (extensionAPI.settings.get("adnp-Tue")) {
              templateUID = extensionAPI.settings.get("adnp-Tue");
            }
          } else if (dayOfWeek == 3) {
            if (extensionAPI.settings.get("adnp-Wed")) {
              templateUID = extensionAPI.settings.get("adnp-Wed");
            }
          } else if (dayOfWeek == 4) {
            if (extensionAPI.settings.get("adnp-Thu")) {
              templateUID = extensionAPI.settings.get("adnp-Thu");
            }
          } else if (dayOfWeek == 5) {
            if (extensionAPI.settings.get("adnp-Fri")) {
              templateUID = extensionAPI.settings.get("adnp-Fri");
            }
          } else {
            if (extensionAPI.settings.get("adnp-Sat")) {
              templateUID = extensionAPI.settings.get("adnp-Sat");
            }
          }
        } else if (adnpMode == "Weekday/Weekend") {
          if (dayOfWeek == 0) { // Sunday
            if (extensionAPI.settings.get("adnp-weekend")) {
              templateUID = extensionAPI.settings.get("adnp-weekend");
            }
          } else if (dayOfWeek == 6) { // Saturday
            if (extensionAPI.settings.get("adnp-weekend")) {
              templateUID = extensionAPI.settings.get("adnp-weekend");
            }
          } else { // weekdays
            if (extensionAPI.settings.get("adnp-weekday")) {
              templateUID = extensionAPI.settings.get("adnp-weekday");
            }
          }
        }
        if (templateUID == undefined) {
          alert("Make sure to set the template block reference in Roam Depot settings!");
        } else {
          templateUID = templateUID.replace('((', '');
          templateUID = templateUID.replace('))', '');
          checkPage(pageUid, pageTitle, templateUID);
        }
      }
    }
  },
  onunload: () => {
    window.removeEventListener('hashchange', hashChange);
  }
}

function checkPage(pageUid, pageTitle, templateUID) {
  let query = `[:find ?block_string
                :where
                [?p :node/title "${pageTitle}"]
                [?p :block/children ?c]
                [?c :block/string ?block_string]]`;
  let results = window.roamAlphaAPI.q(query);

  var parentBlockTextMatch = false;
  let tree = getTreeByBlockUid(templateUID);
  var parentBlockText = tree.children[0].text;
  for (var i = 0; i < results.length; i++) {
    if (results[i][0] == parentBlockText) {
      parentBlockTextMatch = true;
    }
  }
  if (parentBlockTextMatch == false) {
    printTree(tree, pageUid);
  }
}

async function printTree(tree, pageUid) {
  let order = await window.roamAlphaAPI.q(`[:find ?c :where [?e :block/children ?c] [?e :block/uid "${pageUid}"]]`).length;
  
  if (tree.hasOwnProperty('children') && tree.children.length > 0) { 
    for (var i = 0; i < tree.children.length; i++) {
      let newerUid = roamAlphaAPI.util.generateUID();
      let blockText = tree.children[i].text;
      window.roamAlphaAPI.createBlock(
        {
          "location": { "parent-uid": pageUid, "order": order + tree.children[i].order },
          "block": { "string": blockText, uid: newerUid, open: true, "heading": tree.children[i].heading }
        }
      );
      if (tree.children[i].hasOwnProperty('children') && tree.children[i].children.length > 0) {
        printTree(tree.children[i], newerUid);
      }
    }
  }
}


// I think these two helper functions came from either TFTHacker and Roam42, or possibly David Vargas at roamjs.com
function getTreeByBlockId(blockId) {
  const block = window.roamAlphaAPI.pull("[*]", blockId);
  const children = block[":block/children"] || [];
  const props = block[":block/props"] || {};
  return {
    text: block[":block/string"] || "",
    order: block[":block/order"] || 0,
    uid: block[":block/uid"] || "",
    children: children
      .map((c) => getTreeByBlockId(c[":db/id"]))
      .sort((a, b) => a.order - b.order),
    heading: block[":block/heading"] || 0,
    open: block[":block/open"] || true,
    viewType: block[":children/view-type"]?.substring(1),
    editTime: new Date(block[":edit/time"] || 0),
    textAlign: block[":block/text-align"] || "left",
    props: {
      imageResize: Object.fromEntries(
        Object.keys(props[":image-size"] || {}).map((p) => [
          p,
          {
            height: props[":image-size"][p][":height"],
            width: props[":image-size"][p][":width"],
          },
        ])
      ),
      iframe: Object.fromEntries(
        Object.keys(props[":iframe"] || {}).map((p) => [
          p,
          {
            height: props[":iframe"][p][":size"][":height"],
            width: props[":iframe"][p][":size"][":width"],
          },
        ])
      ),
    },
  };
};

function getTreeByBlockUid(blockUid) {
  if (!blockUid) {
    return {
      text: "",
      order: 0,
      uid: "",
      children: [],
      heading: 0,
      open: true,
      viewType: "bullet",
      editTime: new Date(0),
      textAlign: "left",
      props: {
        imageResize: {},
        iframe: {},
      },
    };
  }
  const blockId = window.roamAlphaAPI.q(
    `[:find ?e :where [?e :block/uid "${blockUid}"]]`
  )?.[0]?.[0];
  return getTreeByBlockId(blockId);
};

/*
if (tree.hasOwnProperty('children')) {
  let newUid = roamAlphaAPI.util.generateUID();
  window.roamAlphaAPI.createBlock(
    {
      "location": { "parent-uid": pageUid, "order": order },
      "block": { "string": "", uid: newUid, open: true }
    }
  );

  for (var i = 0; i < tree.children.length; i++) {
    let newerUid = roamAlphaAPI.util.generateUID();
    let blockText = tree.children[i].text;
    window.roamAlphaAPI.createBlock(
      {
        "location": { "parent-uid": pageUid, "order": order + tree.children[i].order },
        "block": { "string": blockText, uid: newerUid, open: true, "heading": tree.children[i].heading }
      }
    );

    if (tree.children[i].hasOwnProperty('children')) {
      for (var j = 0; j < tree.children[i].children.length; j++) {
        let newerUid1 = roamAlphaAPI.util.generateUID();
        window.roamAlphaAPI.createBlock(
          {
            "location": { "parent-uid": newerUid, "order": tree.children[i].children[j].order },
            "block": { "string": tree.children[i].children[j].text, uid: newerUid1, "heading": tree.children[i].children[j].heading }
          }
        );
        if (tree.children[i].children[j].hasOwnProperty('children')) {
          for (var k = 0; k < tree.children[i].children[j].children.length; k++) {
            let newerUid2 = roamAlphaAPI.util.generateUID();
            window.roamAlphaAPI.createBlock(
              {
                "location": { "parent-uid": newerUid1, "order": tree.children[i].children[j].children[k].order },
                "block": { "string": tree.children[i].children[j].children[k].text, uid: newerUid2, "heading": tree.children[i].children[j].children[k].heading }
              }
            );
            if (tree.children[i].children[j].children[k].hasOwnProperty('children')) {
              for (var m = 0; m < tree.children[i].children[j].children[k].children.length; m++) {
                let newerUid3 = roamAlphaAPI.util.generateUID();
                window.roamAlphaAPI.createBlock(
                  {
                    "location": { "parent-uid": newerUid2, "order": tree.children[i].children[j].children[k].children[m].order },
                    "block": { "string": tree.children[i].children[j].children[k].children[m].text, uid: newerUid3, "heading": tree.children[i].children[j].children[k].children[m].heading }
                  }
                );
                if (tree.children[i].children[j].children[k].children[m].hasOwnProperty('children')) {
                  for (var n = 0; n < tree.children[i].children[j].children[k].children[m].children.length; n++) {
                    let newerUid4 = roamAlphaAPI.util.generateUID();
                    window.roamAlphaAPI.createBlock(
                      {
                        "location": { "parent-uid": newerUid3, "order": tree.children[i].children[j].children[k].children[m].children[n].order },
                        "block": { "string": tree.children[i].children[j].children[k].children[m].children[n].text, uid: newerUid4, "heading": tree.children[i].children[j].children[k].children[m].children[n].heading }
                      }
                    );
                    if (tree.children[i].children[j].children[k].children[m].children[n].hasOwnProperty('children')) {
                      for (var p = 0; p < tree.children[i].children[j].children[k].children[m].children[n].children.length; p++) {
                        let newerUid5 = roamAlphaAPI.util.generateUID();
                        window.roamAlphaAPI.createBlock(
                          {
                            "location": { "parent-uid": newerUid4, "order": tree.children[i].children[j].children[k].children[m].children[n].children[p].order },
                            "block": { "string": tree.children[i].children[j].children[k].children[m].children[n].children[p].text, uid: newerUid5, "heading": tree.children[i].children[j].children[k].children[m].children[n].children[p].heading }
                          }
                        );
                        if (tree.children[i].children[j].children[k].children[m].children[n].children[p].hasOwnProperty('children')) {
                          for (var q = 0; q < tree.children[i].children[j].children[k].children[m].children[n].children[p].children.length; q++) {
                            let newerUid6 = roamAlphaAPI.util.generateUID();
                            window.roamAlphaAPI.createBlock(
                              {
                                "location": { "parent-uid": newerUid5, "order": tree.children[i].children[j].children[k].children[m].children[n].children[p].children[q].order },
                                "block": { "string": tree.children[i].children[j].children[k].children[m].children[n].children[p].children[q].text, uid: newerUid6, "heading": tree.children[i].children[j].children[k].children[m].children[n].children[p].children[q].heading }
                              }
                            );
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
*/