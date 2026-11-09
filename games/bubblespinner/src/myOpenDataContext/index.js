import AssetsLoader from "./src/data/AssetsLoader.js";
import DataStore from "./src/data/DataStore.js";
import RankScene from "./src/scenes/RankScene.js";
import GameEnded from "./src/scenes/GameEnded.js";
import Week from "./src/utils/Week.js";

wx.onMessage(function (msg) {
    let action = msg.action;

    if (action === "LoadAssets") {
        AssetsLoader.getInstance().onLoaded(assets => onAssetsLoaded(assets));
    }

    if (action === "RankScene") {
        DataStore.currentScene = RankScene.toString();
        if (DataStore.assets) DataStore.RankScene.loadRecords(msg.shareTicket);
    }

    if (action === "GameEnded") {
        DataStore.currentScene = GameEnded.toString();
        DataStore.currentScore = msg.currentScore;
        if (DataStore.assets) {
            if (msg.lastScene === RankScene.toString()) {
                return DataStore.GameEnded.render();
            }
            return DataStore.GameEnded.updateRecord();
        }
    }

    if (action === "MainMenu") {
        DataStore.currentScene = "MainMenu";
    }

    if (action === "Restart") {
        // Clear the previous drawing
        DataStore.GameEnded.drawLayout();
    }
});

function onAssetsLoaded(assets) {
    DataStore.assets = assets;


    let sharedCanvas = wx.getSharedCanvas();

    DataStore.pixelRatio = wx.getSystemInfoSync().pixelRatio;
    // Note: the offscreen canvas is not scaled by ctx.scale(). It is crucial to draw all
    // the sprites as proportional to the canvas that has already been scaled up for
    // ctx.fillText() to be clear
    DataStore.canvasWidth = sharedCanvas.width;
    DataStore.canvasHeight = sharedCanvas.height;
    DataStore.ctx = sharedCanvas.getContext("2d");

    DataStore.RankScene = RankScene.getInstance();
    DataStore.GameEnded = GameEnded.getInstance();


    if (DataStore.currentScene === RankScene.toString()) DataStore.RankScene.loadRecords();
    if (DataStore.currentScene === GameEnded.toString()) DataStore.GameEnded.updateRecord();
}

DataStore.upgradeDeprecatedRecord = (deprecatedRecord) => {
    let record = {
        wxgame: {
            score: parseInt(deprecatedRecord.maxRecord),
            update_time: new Date().getTime()
        },
    };
    if (deprecatedRecord.week == Week.getThisWeek()) {
        record.wkRecord = parseInt(deprecatedRecord.wkRecord);
        record.lastUpdate = Week.getTuesdayOfWeek(deprecatedRecord.week).getTime();
    }
    return record;
}

DataStore.getCurrentWeekRecords = (rawRecords) => {
    let records = rawRecords.map(rawRecord => {
        let record = rawRecord.KVDataList.find(KVData => KVData.key === "record");
        if (record) record = JSON.parse(record.value);
        let deprecatedRecord = rawRecord.KVDataList.reduce((acc, cur) => { acc[cur.key] = cur.value; return acc }, {});

        if (!record) {
            if (deprecatedRecord) {
                record = DataStore.upgradeDeprecatedRecord(deprecatedRecord);
            } else {
                let now = new Date();
                record = {
                    wxgame: {
                        score: 0,
                        update_time: now.getTime()
                    },
                    wkRecord: 0,
                    lastUpdate: now.getTime()
                }
            }
        }

        record.nickname = rawRecord.nickname;
        record.avatarUrl = rawRecord.avatarUrl;
        return record;
    });

    let thisMonday = Week.getThisMonday().getTime();
    records = records.filter(r => r.lastUpdate >= thisMonday);
    records.sort((r1, r2) => r2.wkRecord - r1.wkRecord);
    return records;
}