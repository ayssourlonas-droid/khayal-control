import DataStore from "../data/DataStore.js";
import Sprite from "../base/Sprite.js";
import Scene from "./Scene.js";
import Grid from "../utils/Grid.js";
import Text from "../utils/Text.js";
import Week from "../utils/Week.js";

export default class GameEnded extends Scene {
    constructor() {
        super();

        // background for the leaderboard thumbnail (mx = 7.5%, top = 30%, height = 27.5%)
        this.leaderboardThumbnailBackground = new Grid(
            0.3 * DataStore.canvasHeight,
            0.26 * DataStore.canvasHeight,
            0.075 * DataStore.canvasWidth,
            0.04 * DataStore.canvasWidth
        );
        // meta (top = 30%, height = 5%)
        this.header = new Text(
            "排行榜 · 每周一凌晨刷新",
            0.015 * DataStore.canvasHeight,
            0.05 * DataStore.canvasHeight
        );
        this.more = new Text(
            "查看全部排行 ►",
            0.015 * DataStore.canvasHeight,
            0.05 * DataStore.canvasHeight,
            0,
            -0.02 * DataStore.canvasWidth
        );

        this.drawLayout();

        this.leaderboardThumbnailCanvas = wx.createCanvas();
        this.leaderboardThumbnailContext = this.leaderboardThumbnailCanvas.getContext("2d");
        this.leaderboardThumbnailCanvas.width = DataStore.canvasWidth - this.leaderboardThumbnailBackground.mr - this.leaderboardThumbnailBackground.ml;
        this.leaderboardThumbnailCanvas.height = this.leaderboardThumbnailBackground.height - this.header.lineHeight;
        this.leaderboardThumbnailSprite = new Sprite(
            this.leaderboardThumbnailCanvas,
            this.leaderboardThumbnailBackground.ml + 0.5 * this.leaderboardThumbnailCanvas.width,
            this.leaderboardThumbnailBackground.top + this.header.lineHeight + 0.5 * this.leaderboardThumbnailCanvas.height,
            this.leaderboardThumbnailCanvas.width,
            this.leaderboardThumbnailCanvas.height
        );

        this.loading = new Text(
            "加载中",
            this.header.fontSize,
            this.leaderboardThumbnailCanvas.height
        );
    }

    LoadRecords() {
        this.drawLoading();

        wx.getFriendCloudStorage({
            keyList: ["week", "wkRecord", "maxRecord", "record"],
            success: (res) => {

                DataStore.currentWeekRecords = DataStore.getCurrentWeekRecords(res.data);

                // Find the one record before, the user's record and the one after
                wx.getUserInfo({
                    openIdList: ['selfOpenId'],
                    success: (res) => {
                        let [user] = res.data;
                        let nickname = user.nickName;
                        let avatarUrl = user.avatarUrl;
                        let rank = DataStore.currentWeekRecords.findIndex(r => r.nickname == nickname && r.avatarUrl == avatarUrl);

                        this.drawRecords([
                            DataStore.currentWeekRecords[rank - 1],
                            DataStore.currentWeekRecords[rank],
                            DataStore.currentWeekRecords[rank + 1]
                        ].map((r, i) => { if (r) r.rank = rank + i; return r; }));
                    }
                });
            }
        });
    }

    updateRecord() {
        this.drawLoading();

        wx.getUserCloudStorage({
            // keyList: ["week", "wkRecord", "maxRecord", "currentScore"] are deprecated,
            // Correct way should be store all relevant information of the user in one key for each leaderboard
            keyList: ["week", "wkRecord", "maxRecord", "record"],
            success: res => {
                let record = res.KVDataList.find(KVData => KVData.key === "record");
                if (record) record = JSON.parse(record.value);
                let deprecatedRecord = res.KVDataList.reduce((acc, cur) => { acc[cur.key] = cur.value; return acc }, {});

                let now = new Date();
                if (!record) {
                    if (deprecatedRecord) {
                        record = DataStore.upgradeDeprecatedRecord(deprecatedRecord);
                    } else {
                        record = { wxgame: {} }
                    }
                }

                // Update week record
                if (
                    !record.lastUpdate || record.lastUpdate < Week.getThisMonday().getTime() ||
                    !record.wkRecord || DataStore.currentScore > record.wkRecord
                ) {
                    record.wkRecord = DataStore.currentScore;
                }

                // Update max record
                if (!record.wxgame.score || record.wxgame.score < record.wkRecord) {
                    record.wxgame.score = record.wkRecord;
                    record.wxgame.update_time = now.getTime();
                }

                record.lastUpdate = now.getTime();

                wx.setUserCloudStorage({
                    KVDataList: [{ key: "record", value: JSON.stringify(record) }],
                    success: () => {
                        this.LoadRecords();
                    }
                });
            }
        });
    }

    drawLayout() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "rgba(0, 0, 0, 0)";
        this.ctx.strokeStyle = "rgba(80, 80, 80, 1)";
        this.leaderboardThumbnailBackground.draw(this.ctx);

        this.ctx.fillStyle = "#9b9b9b";
        this.ctx.textAlign = "left";
        this.ctx.textBaseline = "top";
        this.header.draw(this.ctx, this.leaderboardThumbnailBackground.mr + this.leaderboardThumbnailBackground.pr, this.leaderboardThumbnailBackground.top + 0.5 * (this.header.lineHeight - this.header.fontSize));

        this.ctx.fillStyle = "#ffffff";
        this.ctx.textAlign = "right";
        this.more.draw(this.ctx, DataStore.canvasWidth - this.leaderboardThumbnailBackground.ml - this.leaderboardThumbnailBackground.pl - this.more.ml, this.leaderboardThumbnailBackground.top + 0.5 * (this.header.lineHeight - this.header.fontSize));

        // hr
        this.ctx.beginPath();
        this.ctx.moveTo(this.leaderboardThumbnailBackground.mr, this.leaderboardThumbnailBackground.top + this.header.lineHeight);
        this.ctx.lineTo(DataStore.canvasWidth - this.leaderboardThumbnailBackground.ml, this.leaderboardThumbnailBackground.top + this.header.lineHeight);
        this.ctx.stroke();
    }

    drawLoading() {
        this.leaderboardThumbnailContext.clearRect(0, 0, this.leaderboardThumbnailCanvas.width, this.leaderboardThumbnailCanvas.height);
        this.leaderboardThumbnailContext.fillStyle = "#888888";
        this.leaderboardThumbnailContext.textAlign = "center";
        this.loading.draw(this.leaderboardThumbnailContext, 0.5 * this.leaderboardThumbnailCanvas.width, 0.5 * this.leaderboardThumbnailCanvas.height);
        this.render();
    }

    drawRecords(records) {
        this.leaderboardThumbnailContext.clearRect(0, 0, this.leaderboardThumbnailCanvas.width, this.leaderboardThumbnailCanvas.height);

        let grid = new Grid(0, this.leaderboardThumbnailCanvas.height, 0, this.leaderboardThumbnailBackground.pr, 0, this.leaderboardThumbnailBackground.pl, this.leaderboardThumbnailCanvas.width / 3);

        records.forEach((record, i) => {
            grid.ml = i * grid.width;
            grid.center = grid.ml + 0.5 * grid.width;
            grid.avatarSize = 0.3 * grid.height;
            grid.fontSize = 0.32 * grid.avatarSize;
            grid.pt = 0.1 * grid.height;

            this.leaderboardThumbnailContext.fillStyle = i === 1 ? "rgba(63, 63, 63, 0.5)" : "rgba(0, 0, 0, 0)";
            this.leaderboardThumbnailContext.strokeStyle = i === 1 ? "rgba(63, 63, 63, 0.5)" : "rgba(0, 0, 0, 0)";
            grid.draw(this.leaderboardThumbnailContext);

            if (!record) return;

            // Draw the rank
            this.leaderboardThumbnailContext.fillStyle = i === 1 ? "#41bf8c" : "#888888";
            this.leaderboardThumbnailContext.textAlign = "center";
            let rank = new Text(record.rank, grid.fontSize, 1.5 * grid.fontSize);
            rank.draw(this.leaderboardThumbnailContext, grid.center, grid.top + grid.pt + 0.5 * rank.lineHeight, `italic bold ${rank.fontSize}px Arial`);

            // Draw the avatar
            let avatar = wx.createImage();
            avatar.x = grid.center;
            avatar.onload = () => {
                new Sprite(avatar, avatar.x, grid.top + grid.pt + rank.lineHeight + 0.5 * grid.avatarSize, grid.avatarSize, grid.avatarSize).render(this.leaderboardThumbnailContext);
                // Refresh the shared canvas
                this.render();
            }
            avatar.src = record.avatarUrl;

            // Draw the nickname
            this.leaderboardThumbnailContext.fillStyle = '#888';
            this.leaderboardThumbnailContext.textAlign = 'center';
            let nickname = new Text(record.nickname, grid.fontSize, 3.5 * grid.fontSize);
            nickname.drawOverflowEllipsis(this.leaderboardThumbnailContext, grid.center, grid.top + grid.pt + rank.lineHeight + grid.avatarSize + 0.5 * nickname.lineHeight, grid.width - grid.pr - grid.pl);

            // Draw the score
            this.bitmapText.draw(this.leaderboardThumbnailContext, record.wkRecord, grid.fontSize * 1.2, grid.center, grid.top + rank.lineHeight + grid.avatarSize + nickname.lineHeight, "center");
        });

        // Redraw the layout since we need to wipe out the previous drawing of the current score and the max record
        this.drawLayout();

        // Draw the current score
        this.bitmapText.draw(this.ctx, DataStore.currentScore, 0.17 * DataStore.canvasWidth, 0.5 * DataStore.canvasWidth, 0.1 * DataStore.canvasHeight, "center");

        // Draw the max record
        this.ctx.textAlign = "center"
        let maxRecord = new Text(`历史最高分: ${records[1].wxgame.score}`, 1.2 * this.header.fontSize, 6 * this.header.fontSize);
        maxRecord.draw(this.ctx, 0.5 * DataStore.canvasWidth, DataStore.canvasHeight - 0.5 * maxRecord.lineHeight);

        this.render();
    }

    render() {
        if (DataStore.currentScene !== GameEnded.toString()) return;
        super.render();
        this.sprite.render(DataStore.ctx);
        this.leaderboardThumbnailSprite.render(DataStore.ctx);
    }

    static toString() {
        return "GameEnded";
    }

    static getInstance() {
        if (!GameEnded.instance) {
            GameEnded.instance = new GameEnded();
        }
        return GameEnded.instance;
    }
}