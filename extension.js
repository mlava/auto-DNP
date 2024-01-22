var adnpMode, templateUID;
var monitorUID = undefined;
var exAPI = undefined;
var checkTomorrowInterval = 0;

export default {
    onload: async ({ extensionAPI }) => {
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

        exAPI = { extensionAPI };

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
        var today = new Date();
        var todayUID = window.roamAlphaAPI.util.dateToPageUid(today);
        var page = window.roamAlphaAPI.q(` [:find ?e :where [?e :block/uid "${todayUID}"]]`);
        if (page.length < 1) { // no DNP for today yet
            monitorUID = todayUID;
            window.roamAlphaAPI.data.addPullWatch("[:create/time]", `[:block/uid "${monitorUID}"]`, pullFunction);
        } else {
            checkDNP(adnpMode, todayUID);
        }

        // onChange
        function setMode(evt) {
            adnpMode = evt;
            if (adnpMode == "Daily") {
                extensionAPI.settings.panel.create(config);
            } else if (adnpMode == "Weekday/Weekend") {
                extensionAPI.settings.panel.create(config2);
            }
        }

        // command trigger
        extensionAPI.ui.commandPalette.addCommand({
            label: "Manually trigger this day's DNP template",
            callback: async () => {
                var pageUid = await window.roamAlphaAPI.ui.mainWindow.getOpenPageOrBlockUid();
                if (!pageUid) {
                    var uri = window.location.href;
                    const regex = /^https:\/\/(relemma-.+)?roamresearch.com\/(#\/(app|offline)\/\w+)?$/; //today's DNP
                    let logPage = document.getElementById("rm-log-container");
                    if (uri.match(regex) || logPage) {
                        var today = new Date();
                        var dd = String(today.getDate()).padStart(2, '0');
                        var mm = String(today.getMonth() + 1).padStart(2, '0');
                        var yyyy = today.getFullYear();
                        pageUid = mm + '-' + dd + '-' + yyyy;
                    }
                }
                if (pageUid) {
                    checkDNP(adnpMode, pageUid);
                }
            }
        });
    },
    onunload: () => {
        window.roamAlphaAPI.data.removePullWatch("[:create/time]", `[:block/uid "${monitorUID}"]`, pullFunction);
    }
}

function pullFunction(before, after) {
    window.roamAlphaAPI.data.removePullWatch("[:create/time]", `[:block/uid "${monitorUID}"]`, pullFunction);
    checkDNP(adnpMode, monitorUID);
}

async function checkDNP(adnpMode, pageUid) {
    var pageTitle = window.roamAlphaAPI.q(`[:find (pull ?p [:node/title]) :where [?p :block/uid "${pageUid}"]]`)?.[0]?.[0]?.title || "";
    var date = await window.roamAlphaAPI.util.pageTitleToDate(pageTitle);
    
    if (date != null) {
        var d = new Date(date);
        var dayOfWeek = d.getDay();
    
        if (adnpMode == "Weekday/Weekend") {
            if (dayOfWeek == 0) { // Sunday
                if (exAPI.extensionAPI.settings.get("adnp-weekend")) {
                    templateUID = exAPI.extensionAPI.settings.get("adnp-weekend");
                }
            } else if (dayOfWeek == 6) { // Saturday
                if (exAPI.extensionAPI.settings.get("adnp-weekend")) {
                    templateUID = exAPI.extensionAPI.settings.get("adnp-weekend");
                }
            } else { // weekdays
                if (exAPI.extensionAPI.settings.get("adnp-weekday")) {
                    templateUID = exAPI.extensionAPI.settings.get("adnp-weekday");
                }
            }
        } else {
            if (dayOfWeek == 0) {
                if (exAPI.extensionAPI.settings.get("adnp-Sun")) {
                    templateUID = exAPI.extensionAPI.settings.get("adnp-Sun");
                }
            } else if (dayOfWeek == 1) {
                if (exAPI.extensionAPI.settings.get("adnp-Mon")) {
                    templateUID = exAPI.extensionAPI.settings.get("adnp-Mon");
                }
            } else if (dayOfWeek == 2) {
                if (exAPI.extensionAPI.settings.get("adnp-Tue")) {
                    templateUID = exAPI.extensionAPI.settings.get("adnp-Tue");
                }
            } else if (dayOfWeek == 3) {
                if (exAPI.extensionAPI.settings.get("adnp-Wed")) {
                    templateUID = exAPI.extensionAPI.settings.get("adnp-Wed");
                }
            } else if (dayOfWeek == 4) {
                if (exAPI.extensionAPI.settings.get("adnp-Thu")) {
                    templateUID = exAPI.extensionAPI.settings.get("adnp-Thu");
                }
            } else if (dayOfWeek == 5) {
                if (exAPI.extensionAPI.settings.get("adnp-Fri")) {
                    templateUID = exAPI.extensionAPI.settings.get("adnp-Fri");
                }
            } else {
                if (exAPI.extensionAPI.settings.get("adnp-Sat")) {
                    templateUID = exAPI.extensionAPI.settings.get("adnp-Sat");
                }
            }
        }
    
        if (templateUID == undefined) {
            alert("Make sure to set your template block references in Roam Depot settings!");
        } else {
            templateUID = templateUID.replace('((', '');
            templateUID = templateUID.replace('))', '');
    
            let query = `[:find ?block_string :where [?p :node/title "${pageTitle}"] [?p :block/children ?c] [?c :block/string ?block_string]]`;
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
                await printTree(tree, pageUid);
                setTomorrow(); // now that we've printed today's template, let's monitor for tomorrow
            }
        }
    } else {
        alert("You can only trigger a daily note template on a daily note page or the log page!")
    }
}

async function printTree(tree, pageUid) {
    let order = await window.roamAlphaAPI.q(`[:find ?c :where [?e :block/children ?c] [?e :block/uid "${pageUid}"]]`)?.length;

    if (tree.hasOwnProperty('children') && tree.children.length > 0) {
        for (var i = 0; i < tree.children.length; i++) {
            let newerUid = roamAlphaAPI.util.generateUID();
            let blockText = tree.children[i].text;
            window.roamAlphaAPI.createBlock(
                {
                    "location": { "parent-uid": pageUid, "order": order + tree.children[i].order },
                    "block": { "string": blockText, uid: newerUid, "open": tree.children[i].open, "heading": tree.children[i].heading, "text-align": tree.children[i].textAlign }
                }
            );
            if (tree.children[i].hasOwnProperty('children') && tree.children[i].children.length > 0) {
                printTree(tree.children[i], newerUid);
            }
        }
    }
}

async function setTomorrow() {
    let today = new Date();
    let millisToMidnight = new Date().setHours(24,0,0,0) - today;
    var tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    var tomorrowUID = window.roamAlphaAPI.util.dateToPageUid(tomorrow);

    try { if (checkTomorrowInterval > 0) clearInterval(checkTomorrowInterval) } catch (e) { }
    checkTomorrowInterval = setInterval(async () => {
        var page = window.roamAlphaAPI.q(` [:find ?e :where [?e :block/uid "${tomorrowUID}"]]`);
        if (page.length < 1) { // no DNP for tomorrow yet
            monitorUID = tomorrowUID;
            window.roamAlphaAPI.data.addPullWatch("[:create/time]", `[:block/uid "${monitorUID}"]`, pullFunction);
        } else {
            checkDNP(adnpMode, tomorrowUID);
        }
    }, millisToMidnight);
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
        open: block[":block/open"],
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