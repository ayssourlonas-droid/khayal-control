import DataStore from "../data/DataStore.js";
import Sprite from "../base/Sprite.js";
import Scene from "./Scene.js";
import Grid from "../utils/Grid.js";
import Text from "../utils/Text.js";

export default class RankScene extends Scene {
    constructor() {
        super();
        // background for the leaderboard (top = 15%, height = 65%, mx = 7.5 %, px = 6 %)
        this.leaderboardBackground = new Grid(
            0.15 * DataStore.canvasHeight,
            0.65 * DataStore.canvasHeight,
            0.075 * DataStore.canvasWidth,
            0.06 * DataStore.canvasWidth
        );

        // meta (top = 15%, height = 5%)
        this.header = new Text(
            "每周一凌晨刷新",
            0.015 * DataStore.canvasHeight,
            0.04 * DataStore.canvasHeight
        );

        this.groupRank = new Text(
            "每周一凌晨刷新 · 群排行",
            0.015 * DataStore.canvasHeight,
            0.04 * DataStore.canvasHeight
        );

        // Canvas for the leaderboard
        this.leaderboardCanvas = wx.createCanvas();
        this.leaderboardContext = this.leaderboardCanvas.getContext("2d");
        this.leaderboardCanvas.width = DataStore.canvasWidth - this.leaderboardBackground.mr - this.leaderboardBackground.ml;
        this.leaderboardCanvas.height = this.leaderboardBackground.height - this.header.lineHeight;
        this.leaderboardSprite = new Sprite(
            this.leaderboardCanvas,
            this.leaderboardBackground.ml + 0.5 * this.leaderboardCanvas.width,
            this.leaderboardBackground.top + this.header.lineHeight + 0.5 * this.leaderboardCanvas.height,
            this.leaderboardCanvas.width,
            this.leaderboardCanvas.height
        );

        this.loading = new Text(
            "加载中",
            this.header.fontSize,
            this.leaderboardCanvas.height
        );

        this.noRecords = new Text(
            "本周暂无记录",
            this.header.fontSize,
            this.leaderboardCanvas.height
        );

        this.sy = 0;
        wx.onTouchStart(e => {
            if (DataStore.currentScene != RankScene.toString()) return;
            this.startY = this.sy + e.touches[0].clientY;
        });
        wx.onTouchMove(e => {
            if (DataStore.currentScene != RankScene.toString()) return;
            this.sy = this.startY - e.touches[0].clientY;
            this.render(this.sy);
        });
        wx.onTouchEnd(e => {
            if (DataStore.currentScene != RankScene.toString()) return;
            this.sy = ((arr) => { arr.sort((a, b) => { return a - b; }); return arr })([0, this.sy, this.leaderboardCanvas.height - this.leaderboardSprite.height])[1];
            this.render(this.sy);
        });
    }

    drawLayout(isGroupRank) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        this.ctx.strokeStyle = "rgba(80, 80, 80, 1)";
        this.ctx.lineWidth = 2;
        this.leaderboardBackground.draw(this.ctx);

        this.ctx.fillStyle = "#ffffff";
        this.ctx.textAlign = "left";
        this.ctx.textBaseline = "top";
        (isGroupRank ? this.groupRank : this.header).draw(this.ctx, this.leaderboardBackground.mr + 0.8 * this.leaderboardBackground.pr, this.leaderboardBackground.top + 0.5 * (this.header.lineHeight - this.header.fontSize));

        // hr (top = 20%)
        this.ctx.beginPath();
        this.ctx.moveTo(this.leaderboardBackground.mr, this.leaderboardBackground.top + this.header.lineHeight);
        this.ctx.lineTo(DataStore.canvasWidth - this.leaderboardBackground.ml, this.leaderboardBackground.top + this.header.lineHeight);
        this.ctx.stroke();
    }

    drawLoading() {
        this.leaderboardContext.clearRect(0, 0, this.leaderboardCanvas.width, this.leaderboardCanvas.height);
        this.leaderboardContext.fillStyle = "#888888";
        this.leaderboardContext.textAlign = "center";
        this.loading.draw(this.leaderboardContext, 0.5 * this.leaderboardCanvas.width, 0.5 * this.leaderboardCanvas.height);
        this.render();
    }

    drawNoRecords() {
        this.leaderboardContext.clearRect(0, 0, this.leaderboardCanvas.width, this.leaderboardCanvas.height);
        this.leaderboardContext.fillStyle = "#888888";
        this.leaderboardContext.textAlign = "center";
        this.noRecords.draw(this.leaderboardContext, 0.5 * this.leaderboardCanvas.width, 0.5 * this.leaderboardCanvas.height);
        this.render();
    }

    loadRecords(shareTicket) {
        this.drawLayout(shareTicket);
        this.drawLoading();

        if (shareTicket) {
            wx.getGroupCloudStorage({
                shareTicket: shareTicket,
                keyList: ["week", "wkRecord", "record"],
                success: res => {
                    this.drawRecords(DataStore.getCurrentWeekRecords(res.data));
                }
            });
            return;
        }

        if (DataStore.currentWeekRecords) {
            return this.drawRecords(DataStore.currentWeekRecords);
        }

        wx.getFriendCloudStorage({
            keyList: ["week", "wkRecord", "record"],
            success: res => {
                DataStore.currentWeekRecords = DataStore.getCurrentWeekRecords(res.data);
                this.drawRecords(DataStore.currentWeekRecords);
            }
        });
    }

    drawRecords(records) {
        this.leaderboardContext.clearRect(0, 0, this.leaderboardCanvas.width, this.leaderboardCanvas.height);

        if (!records.length) return this.drawNoRecords();

        let grid = new Grid(0, 0.178 * this.leaderboardCanvas.width, 0, this.leaderboardBackground.pr, 0, this.leaderboardBackground.pl, this.leaderboardCanvas.width);
        this.leaderboardCanvas.height = Math.max(this.leaderboardCanvas.height, grid.height * records.length);

        records.forEach((record, i) => {
            grid.top = i * grid.height;
            grid.mid = grid.top + 0.5 * grid.height;
            grid.fontSize = 0.25 * grid.height;
            grid.avatarSize = 0.5 * grid.height;

            this.leaderboardContext.fillStyle = i % 2 ? "rgba(30, 30, 30, 0.6)" : "rgba(0, 0, 0, 0)";
            grid.draw(this.leaderboardContext, 0, true, false);

            // Draw the rank
            this.leaderboardContext.fillStyle = i == 0 ? '#fa7e00' : i == 1 ? '#fec11e' : i == 2 ? '#fbd413' : '#888888';
            this.leaderboardContext.textAlign = "center";
            this.leaderboardContext.textBaseline = "middle";
            new Text(i + 1).draw(this.leaderboardContext, grid.pl, grid.mid, `italic bold ${grid.fontSize}px Arial`);

            // Draw the avatar
            let avatar = wx.createImage();
            avatar.y = grid.mid;
            avatar.onload = () => {
                new Sprite(avatar, 2.2 * grid.pl + 0.5 * grid.avatarSize, avatar.y, grid.avatarSize, grid.avatarSize).render(this.leaderboardContext);
                // Refresh the shared canvas
                this.render();
            }
            avatar.src = record.avatarUrl;

            // Draw the score, use the start x of the score to truncate long nicknames
            let scoreStartX = this.bitmapText.draw(this.leaderboardContext, record.wkRecord, 0.3 * grid.height, grid.width - grid.pr, grid.mid - 0.15 * grid.height, "right");
            let nicknameEndX = scoreStartX - grid.pl;
            let nicknameStartX = 2.8 * grid.pl + grid.avatarSize;

            // Draw the nickname
            this.leaderboardContext.fillStyle = '#ffffff';
            this.leaderboardContext.textAlign = 'left';
            new Text(record.nickname, grid.fontSize).drawOverflowEllipsis(this.leaderboardContext, nicknameStartX, grid.mid, nicknameEndX - nicknameStartX);
        });

        // Refresh the shared canvas
        this.render();
    }

    render(sy = 0) {
        if (DataStore.currentScene !== RankScene.toString()) return;
        super.render();
        this.sprite.render(DataStore.ctx);
        this.leaderboardSprite.renderCrop(DataStore.ctx, 0, sy, this.leaderboardCanvas.width, this.leaderboardSprite.height);
    }

    static toString() {
        return "RankScene";
    }

    static getInstance() {
        if (!RankScene.instance) {
            RankScene.instance = new RankScene();
        }
        return RankScene.instance;
    }
}