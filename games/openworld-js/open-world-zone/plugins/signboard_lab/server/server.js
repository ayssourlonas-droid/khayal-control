#!/usr/bin/env node
import http from"http";import{initDatabase,closeDatabase}from"./db/index.js";import{handleGetSigns,handleSaveSigns,handleUpdateOneBoard,handleGetSignsBatch,handleImageProxy}from"./api/signs.js";const PORT=8899;function handlePreflight(req,res){res.writeHead(204,{"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET, POST, PATCH, DELETE, OPTIONS","Access-Control-Allow-Headers":"Content-Type","Access-Control-Max-Age":"86400"}),res.end()}function createServer(){return http.createServer((req,res)=>{const url=new URL(req.url,`http://localhost:${PORT}`),{pathname}=url,method=req.method;if(method==="OPTIONS")return handlePreflight(req,res);if(method==="GET"&&pathname==="/api/signs")console.log("📡 GET /api/signs"),handleGetSigns(req,res);else if(method==="GET"&&pathname==="/api/signs/image-proxy")console.log("📡 GET /api/signs/image-proxy"),handleImageProxy(req,res,url.searchParams.get("url")||"");else if(method==="POST"&&pathname==="/api/signs/batch")console.log("📡 POST /api/signs/batch"),handleGetSignsBatch(req,res);else if(method==="POST"&&pathname==="/api/signs")console.log("📡 POST /api/signs"),handleSaveSigns(req,res);else if(method==="PATCH"&&pathname.startsWith("/api/signs/")){const boardId=decodeURIComponent(pathname.slice(11));console.log(`📡 PATCH /api/signs/${boardId}`),handleUpdateOneBoard(req,res,boardId)}else res.writeHead(404,{"Content-Type":"application/json"}),res.end(JSON.stringify({error:"Not Found"}))})}function main(){console.log("[DB] 正在初始化 SQLite..."),initDatabase();const server=createServer();server.listen(PORT,"0.0.0.0",()=>{console.log(`
╔════════════════════════════════════════════╗
║   signboard_lab API 服务器 (Node.js+SQLite) ║
╠════════════════════════════════════════════╣
║   API:  http://localhost:${PORT}                ║
║   数据库: signboard.db                      ║
║                                          ║
║   管理页面:                               ║
║   http://localhost:8089/plugins/          ║
║     signboard_lab/server/admin.html       ║
║                                          ║
║   API 端点:                               ║
║     GET/POST  /api/signs                  ║
║     GET      /api/signs/image-proxy       ║
║     POST     /api/signs/batch             ║
║     PATCH    /api/signs/<id>              ║
║                                          ║
║   Ctrl+C 停止                              ║
╚════════════════════════════════════════════╝
`)});const shutdown=()=>{console.log(`
[Server] 正在关闭...`),server.close(()=>{closeDatabase(),console.log("[Server] 已安全停止"),process.exit(0)})};process.on("SIGINT",shutdown),process.on("SIGTERM",shutdown)}try{main()}catch(err){console.error("启动失败:",err),process.exit(1)}
