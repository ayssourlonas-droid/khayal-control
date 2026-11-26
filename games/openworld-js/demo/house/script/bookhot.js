const bookHot={typeMap:{2:3,3:4,4:5,5:5},jumpUrl:url=>{if("pointerLockElement"in document||"mozPointerLockElement"in document||"webkitPointerLockElement"in document){const exitLock=document.exitPointerLock||document.mozExitPointerLock||document.webkitExitPointerLock;exitLock&&exitLock.call(document)}},showData:(data,isclear=!1)=>{if(isclear)return document.getElementById("bookInfoLT").innerHTML="";const buildInfoHTML=arr=>`
            <button class="collapse-btn" id="collapseBookInfo">${k.collapseBookInfo?"展开":"折叠"}</button>
            <table border="1" cellspacing="0" id="bookInfo" cellpadding="4" ${k.collapseBookInfo?"hidden":""}>
                <tr><th align="right">排名</th><td>${arr[0]}</td></tr>
                <tr><th align="right">网站</th><td><a href="https://${arr[1]}?refer=ow.ccgxk.com" target="_blank">${arr[1]}</a></td></tr>
                <tr><th align="right">名称</th><td>${arr[2]}</td></tr>
                <tr><th align="right">英文</th><td>${arr[3]}</td></tr>
                <tr><th align="right">简介</th><td>${arr[4]}</td></tr>
                <tr><th align="right">类型</th><td>${arr[5]}</td></tr>
            </table>
            `;document.getElementById("bookInfoLT").innerHTML=buildInfoHTML(data),document.getElementById("collapseBookInfo").addEventListener("click",()=>{const ishidden=document.getElementById("bookInfo").hidden;ishidden?document.getElementById("collapseBookInfo").innerHTML="折叠":document.getElementById("collapseBookInfo").innerHTML="展开",document.getElementById("bookInfo").hidden=!ishidden,k.collapseBookInfo=!ishidden})},getInfo:index=>{const args=k.indexToArgs.get(index);let book;if(args?.book)book=args.book;else return[];const y=args.Y,shelfId=book._shelf;let bookIndex=book._index;if(!book)return 0;let tp;book._type===1?y<2?(tp=2,bookIndex=bookIndex-681):tp=1:tp=bookHot.typeMap[book._type];const realIndex=testInShelf.firstFloorIndexTras(tp,bookIndex);return shelfId===k.bookS.floor1.dire4[4]?testInShelf.floor1dire4_4(realIndex):[]}};
