import Database from"better-sqlite3";import{fileURLToPath}from"url";import path from"path";import fs from"fs";const __dirname=path.dirname(fileURLToPath(import.meta.url)),DB_PATH=path.join(__dirname,"signboard.db");let db=null;export function initDatabase(){db=new Database(DB_PATH),db.pragma("journal_mode = WAL"),db.exec(`
    CREATE TABLE IF NOT EXISTS boards (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      mode TEXT NOT NULL DEFAULT 'text',
      content TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `),db.exec(`
    CREATE TRIGGER IF NOT EXISTS boards_updated_at
      AFTER UPDATE ON boards
      BEGIN
        UPDATE boards SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;
  `);try{db.prepare("PRAGMA table_info(boards)").all().some(col=>col.name==="extra")||(db.exec("ALTER TABLE boards ADD COLUMN extra TEXT DEFAULT '{}'"),console.log("[DB] 已添加 extra 字段"))}catch(e){console.warn("[DB] extra 字段迁移警告:",e.message)}console.log("[DB] 数据库已初始化 (WAL 模式)")}export function getAllBoards(){return db.prepare("SELECT * FROM boards ORDER BY id").all()}export function getBoardsByIds(ids){if(!ids||ids.length===0)return[];const placeholders=ids.map(()=>"?").join(",");return db.prepare(`SELECT * FROM boards WHERE id IN (${placeholders})`).all(...ids)}export function upsertBoard(board){db.prepare(`
    INSERT INTO boards (id, name, mode, content, extra) VALUES (@id, @name, @mode, @content, @extra)
    ON CONFLICT(id) DO UPDATE SET name=@name, mode=@mode, content=@content, extra=@extra
  `).run({id:board.id,name:board.name,mode:board.mode,content:board.content,extra:typeof board.extra=="string"?board.extra:JSON.stringify(board.extra||{})})}export function replaceAllBoards(boards){db.transaction(()=>{db.prepare("DELETE FROM boards").run();const stmt=db.prepare("INSERT INTO boards (id, name, mode, content, extra) VALUES (@id, @name, @mode, @content, @extra)");for(const b of boards)stmt.run({id:b.id,name:b.name,mode:b.mode,content:b.content,extra:b.extra||"{}"})})()}export function deleteBoard(id){db.prepare("DELETE FROM boards WHERE id = ?").run(id)}export function getDb(){return db}export function closeDatabase(){if(!db)return;console.log("[DB] 正在执行 checkpoint..."),db.pragma("wal_checkpoint(TRUNCATE)"),db.close(),db=null;const shmPath=DB_PATH+"-shm",walPath=DB_PATH+"-wal";try{fs.unlinkSync(shmPath),console.log("[DB] 已删除",shmPath)}catch{}try{fs.unlinkSync(walPath),console.log("[DB] 已删除",walPath)}catch{}console.log("[DB] 数据库已安全关闭")}
